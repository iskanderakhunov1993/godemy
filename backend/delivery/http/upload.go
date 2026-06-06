package http

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func (h *Handler) UploadImage() gin.HandlerFunc {
	return func(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "no file provided"})
			return
		}

		// Validate content type
		contentType := file.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "image/") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "only images allowed"})
			return
		}

		// Limit size to 5MB
		if file.Size > 5*1024*1024 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "file too large (max 5MB)"})
			return
		}

		// Ensure uploads directory exists
		uploadsDir := "./uploads"
		if err := os.MkdirAll(uploadsDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create uploads dir"})
			return
		}

		// Build unique filename: timestamp + original extension
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext == "" {
			ext = ".png"
		}
		filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		dst := filepath.Join(uploadsDir, filename)

		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"url": "/uploads/" + filename})
	}
}
