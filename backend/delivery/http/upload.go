package http

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
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

		src, err := file.Open()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "failed to read file"})
			return
		}
		defer src.Close()

		header := make([]byte, 512)
		n, readErr := io.ReadFull(src, header)
		if readErr != nil && readErr != io.ErrUnexpectedEOF {
			c.JSON(http.StatusBadRequest, gin.H{"error": "failed to inspect file"})
			return
		}
		contentType := http.DetectContentType(header[:n])
		allowedTypes := map[string]string{
			"image/jpeg": ".jpg",
			"image/png":  ".png",
			"image/gif":  ".gif",
			"image/webp": ".webp",
		}
		ext, allowed := allowedTypes[contentType]
		if !allowed {
			c.JSON(http.StatusBadRequest, gin.H{"error": "only JPEG, PNG, GIF and WebP images are allowed"})
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

		filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		dst := filepath.Join(uploadsDir, filename)

		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"url": "/uploads/" + filename})
	}
}
