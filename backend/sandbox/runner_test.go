package sandbox

import (
	"os"
	"strings"
	"testing"
)

func TestRunCodeLocally(t *testing.T) {
	t.Setenv("SANDBOX_MODE", "")
	result := RunCode(`package main

import "fmt"

func main() {
	fmt.Print("ok")
}`)
	if !result.Passed {
		t.Fatalf("expected code to pass, error: %s", result.Error)
	}
	if result.Output != "ok" {
		t.Fatalf("unexpected output: %q", result.Output)
	}
}

func TestRunCodeInDocker(t *testing.T) {
	if os.Getenv("RUN_DOCKER_SANDBOX_TEST") != "1" {
		t.Skip("set RUN_DOCKER_SANDBOX_TEST=1 to run the Docker integration test")
	}
	t.Setenv("SANDBOX_MODE", "docker")
	result := RunCode(`package main

import "fmt"

func main() {
	fmt.Print("docker-ok")
}`)
	if !result.Passed {
		t.Fatalf("expected Docker code to pass, error: %s", result.Error)
	}
	if result.Output != "docker-ok" {
		t.Fatalf("unexpected Docker output: %q", result.Output)
	}
}

func TestTruncate(t *testing.T) {
	got := truncate(strings.Repeat("x", 10), 4)
	if got != "xxxx\n... (output truncated)" {
		t.Fatalf("unexpected truncated value: %q", got)
	}
}

func TestEnvOrDefault(t *testing.T) {
	const key = "GOLANGER_TEST_VALUE"
	_ = os.Unsetenv(key)
	if got := envOrDefault(key, "fallback"); got != "fallback" {
		t.Fatalf("expected fallback, got %q", got)
	}
	t.Setenv(key, " configured ")
	if got := envOrDefault(key, "fallback"); got != "configured" {
		t.Fatalf("expected trimmed configured value, got %q", got)
	}
}
