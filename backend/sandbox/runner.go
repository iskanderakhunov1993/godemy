package sandbox

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

type RunResult struct {
	Output string `json:"output"`
	Error  string `json:"error"`
	Passed bool   `json:"passed"`
}

const maxOutputSize = 64 * 1024 // 64KB

// RunCode executes user Go code in a temporary directory with a timeout.
// It does NOT use Docker — suitable for local dev. For production, wrap with Docker.
func RunCode(code string) RunResult {
	dir, err := os.MkdirTemp("", "golanger-*")
	if err != nil {
		return RunResult{Error: "Failed to create temp dir"}
	}
	defer os.RemoveAll(dir)

	filePath := filepath.Join(dir, "main.go")
	if err := os.WriteFile(filePath, []byte(code), 0600); err != nil {
		return RunResult{Error: "Failed to write code"}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "go", "run", filePath)
	cmd.Dir = dir

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	runErr := cmd.Run()

	outStr := truncate(stdout.String(), maxOutputSize)
	errStr := truncate(stderr.String(), maxOutputSize)

	if ctx.Err() == context.DeadlineExceeded {
		return RunResult{Error: "Execution timed out (10s limit)", Passed: false}
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

	// Write go.mod
	goMod := "module exercise\n\ngo 1.21\n"
	if err := os.WriteFile(filepath.Join(dir, "go.mod"), []byte(goMod), 0600); err != nil {
		return RunResult{Error: "Failed to write go.mod"}
	}

	// Write solution.go (user code — replace main with package main)
	if err := os.WriteFile(filepath.Join(dir, "solution.go"), []byte(userCode), 0600); err != nil {
		return RunResult{Error: "Failed to write solution"}
	}

	// Write test file
	if err := os.WriteFile(filepath.Join(dir, "solution_test.go"), []byte(testCode), 0600); err != nil {
		return RunResult{Error: "Failed to write tests"}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "go", "test", "-v", "./...")
	cmd.Dir = dir

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	runErr := cmd.Run()

	outStr := truncate(stdout.String(), maxOutputSize)
	errStr := truncate(stderr.String(), maxOutputSize)

	if ctx.Err() == context.DeadlineExceeded {
		return RunResult{Error: "Tests timed out (15s limit)", Passed: false}
	}

	passed := runErr == nil
	combined := outStr
	if errStr != "" {
		combined = fmt.Sprintf("%s\n%s", outStr, errStr)
	}
	return RunResult{Output: combined, Passed: passed}
}

func truncate(s string, max int) string {
	if len(s) > max {
		return s[:max] + "\n... (output truncated)"
	}
	return s
}
