package sandbox

import (
	"archive/tar"
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type RunResult struct {
	Output string `json:"output"`
	Error  string `json:"error"`
	Passed bool   `json:"passed"`
}

const maxOutputSize = 64 * 1024 // 64KB

const defaultRunnerImage = "golanger-runner:latest"

func RunCode(code string) RunResult {
	dir, err := os.MkdirTemp("", "golanger-*")
	if err != nil {
		return RunResult{Error: "Failed to create temp dir"}
	}
	defer os.RemoveAll(dir)
	if err := os.Chmod(dir, 0755); err != nil {
		return RunResult{Error: "Failed to prepare temp dir"}
	}

	filePath := filepath.Join(dir, "main.go")
	if err := os.WriteFile(filePath, []byte(code), 0644); err != nil {
		return RunResult{Error: "Failed to write code"}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	runErr, outStr, errStr := run(ctx, dir, []string{"go", "run", "main.go"})

	outStr = truncate(outStr, maxOutputSize)
	errStr = truncate(errStr, maxOutputSize)

	if ctx.Err() == context.DeadlineExceeded {
		return RunResult{Error: "Execution timed out (30s limit)", Passed: false}
	}

	if runErr != nil {
		return RunResult{Output: outStr, Error: errStr, Passed: false}
	}

	return RunResult{Output: outStr, Passed: true}
}

// RunCodeWithTests runs user code against test cases.
func RunCodeWithTests(userCode, testCode string) RunResult {
	dir, err := os.MkdirTemp("", "golanger-test-*")
	if err != nil {
		return RunResult{Error: "Failed to create temp dir"}
	}
	defer os.RemoveAll(dir)
	if err := os.Chmod(dir, 0755); err != nil {
		return RunResult{Error: "Failed to prepare temp dir"}
	}

	// Write go.mod
	goMod := "module exercise\n\ngo 1.21\n"
	if err := os.WriteFile(filepath.Join(dir, "go.mod"), []byte(goMod), 0644); err != nil {
		return RunResult{Error: "Failed to write go.mod"}
	}

	if err := os.WriteFile(filepath.Join(dir, "solution.go"), []byte(userCode), 0644); err != nil {
		return RunResult{Error: "Failed to write solution"}
	}

	if err := os.WriteFile(filepath.Join(dir, "solution_test.go"), []byte(testCode), 0644); err != nil {
		return RunResult{Error: "Failed to write tests"}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 45*time.Second)
	defer cancel()

	runErr, outStr, errStr := run(ctx, dir, []string{"go", "test", "-v", "./..."})
	outStr = truncate(outStr, maxOutputSize)
	errStr = truncate(errStr, maxOutputSize)

	if ctx.Err() == context.DeadlineExceeded {
		return RunResult{Error: "Tests timed out (45s limit)", Passed: false}
	}

	passed := runErr == nil
	combined := outStr
	if errStr != "" {
		combined = fmt.Sprintf("%s\n%s", outStr, errStr)
	}
	return RunResult{Output: combined, Passed: passed}
}

func run(ctx context.Context, dir string, command []string) (error, string, string) {
	if strings.EqualFold(os.Getenv("SANDBOX_MODE"), "docker") {
		return runInDocker(ctx, dir, command)
	}

	cmd := exec.CommandContext(ctx, command[0], command[1:]...)
	cmd.Dir = dir
	return collectOutput(cmd)
}

func runInDocker(ctx context.Context, dir string, command []string) (error, string, string) {
	archive, err := archiveDirectory(dir)
	if err != nil {
		return err, "", "Failed to prepare sandbox files"
	}

	name := "golanger-run-" + randomSuffix()
	image := strings.TrimSpace(os.Getenv("RUNNER_IMAGE"))
	if image == "" {
		image = defaultRunnerImage
	}

	args := []string{
		"run", "--rm", "--interactive",
		"--name", name,
		"--network", "none",
		"--cpus", envOrDefault("SANDBOX_CPUS", "0.50"),
		"--memory", envOrDefault("SANDBOX_MEMORY", "256m"),
		"--pids-limit", envOrDefault("SANDBOX_PIDS_LIMIT", "64"),
		"--read-only",
		"--cap-drop", "ALL",
		"--security-opt", "no-new-privileges",
		"--tmpfs", "/tmp:rw,exec,nosuid,nodev,size=128m",
		"--env", "HOME=/tmp",
		"--env", "GOCACHE=/tmp/go-cache",
		"--env", "GOTMPDIR=/tmp/go-tmp",
		"--env", "GOPATH=/tmp/go",
		image,
		"sh", "-c",
		`mkdir -p /tmp/work /tmp/go-cache /tmp/go-tmp /tmp/go && tar -xf - -C /tmp/work && cd /tmp/work && exec "$@"`,
		"runner",
	}
	args = append(args, command...)

	cmd := exec.CommandContext(ctx, "docker", args...)
	cmd.Stdin = bytes.NewReader(archive)
	err, stdout, stderr := collectOutput(cmd)

	// If the client is killed on timeout, ensure the workload does not remain
	// alive in the Docker daemon.
	cleanupCtx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_ = exec.CommandContext(cleanupCtx, "docker", "rm", "-f", name).Run()

	return err, stdout, stderr
}

func archiveDirectory(dir string) ([]byte, error) {
	var buf bytes.Buffer
	tw := tar.NewWriter(&buf)

	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	for _, entry := range entries {
		if !entry.Type().IsRegular() {
			continue
		}
		data, err := os.ReadFile(filepath.Join(dir, entry.Name()))
		if err != nil {
			return nil, err
		}
		header := &tar.Header{
			Name: entry.Name(),
			Mode: 0644,
			Size: int64(len(data)),
		}
		if err := tw.WriteHeader(header); err != nil {
			return nil, err
		}
		if _, err := tw.Write(data); err != nil {
			return nil, err
		}
	}
	if err := tw.Close(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func collectOutput(cmd *exec.Cmd) (error, string, string) {
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	return err, stdout.String(), stderr.String()
}

func envOrDefault(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func randomSuffix() string {
	var raw [6]byte
	if _, err := rand.Read(raw[:]); err == nil {
		return hex.EncodeToString(raw[:])
	}
	return strconv.FormatInt(time.Now().UnixNano(), 36)
}

func truncate(s string, max int) string {
	if len(s) > max {
		return s[:max] + "\n... (output truncated)"
	}
	return s
}
