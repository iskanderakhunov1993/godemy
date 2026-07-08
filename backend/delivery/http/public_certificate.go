package http

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"golanger/backend/usecase"
)

func (h *Handler) GetPublicCertificate() gin.HandlerFunc {
	return func(c *gin.Context) {
		certificateID := strings.TrimSpace(c.Param("certificateId"))
		certificate, err := h.content.FindCertificateByPublicID(certificateID)
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Certificate not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch certificate"})
			return
		}

		fullName := ""
		if certificate.User != nil {
			fullName = certificate.User.FullName
		}

		c.JSON(http.StatusOK, gin.H{
			"certificateId": certificate.CertificateID,
			"type":          certificate.Type,
			"status":        certificate.Status,
			"issuedAt":      certificate.IssuedAt,
			"courseName":    "Go Junior Bootcamp",
			"holderName":    fullName,
			"projects":      certificate.ProjectsSnapshot,
		})
	}
}
