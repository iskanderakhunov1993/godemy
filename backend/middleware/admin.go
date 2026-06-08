package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"golanger/backend/models"
)

type AdminUserProvider interface {
	Me(userID uint) (*models.User, error)
}

func AdminRequired(auth AdminUserProvider) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetUint("userId")
		if userID == 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization required"})
			return
		}

		user, err := auth.Me(userID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization required"})
			return
		}
		if !user.IsAdmin {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "admin access required"})
			return
		}

		c.Set("adminUser", user)
		c.Next()
	}
}
