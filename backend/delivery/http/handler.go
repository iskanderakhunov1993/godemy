package http

import (
	"context"
	"golanger/backend/config"
	"golanger/backend/usecase"
	"net/http"

	"github.com/redis/go-redis/v9"
)

type Handler struct {
	auth    *usecase.AuthUseCase
	content *usecase.ContentUseCase
	runner  *usecase.RunnerUseCase
	cfg     *config.Config
	rdb     *redis.Client
}

func NewHandler(auth *usecase.AuthUseCase, content *usecase.ContentUseCase, runner *usecase.RunnerUseCase, cfg *config.Config, rdb *redis.Client) *Handler {
	return &Handler{
		auth:    auth,
		content: content,
		runner:  runner,
		cfg:     cfg,
		rdb:     rdb,
	}
}

// Тестовый обработчик для проверки Redis
func (h *Handler) TestRedis(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	err := h.rdb.Set(ctx, "test_key", "hello redis", 0).Err()
	if err != nil {
		http.Error(w, "Redis SET error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	val, err := h.rdb.Get(ctx, "test_key").Result()
	if err != nil {
		http.Error(w, "Redis GET error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write([]byte("Redis value: " + val))
}
