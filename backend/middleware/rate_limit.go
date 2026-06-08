package middleware

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func RedisRateLimit(rdb *redis.Client, prefix string, limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodOptions || rdb == nil {
			c.Next()
			return
		}

		bucket := time.Now().Unix() / int64(window.Seconds())
		key := "rate:" + prefix + ":" + c.ClientIP() + ":" + strconv.FormatInt(bucket, 10)

		ctx, cancel := context.WithTimeout(c.Request.Context(), 500*time.Millisecond)
		defer cancel()

		count, err := rdb.Incr(ctx, key).Result()
		if err != nil {
			c.Next()
			return
		}
		if count == 1 {
			_ = rdb.Expire(ctx, key, window+time.Minute).Err()
		}
		if count > int64(limit) {
			c.Header("Retry-After", strconv.Itoa(int(window.Seconds())))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "too many requests"})
			return
		}

		c.Next()
	}
}
