package http

import (
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"strings"

	"github.com/gin-gonic/gin"
)

func (h *Handler) EmailCertificate() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetUint("userId")
		if userID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		user, err := h.auth.Me(userID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		progresses, err := h.content.GetProgress(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch progress"})
			return
		}

		lessons, err := h.content.GetLessons("")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lessons"})
			return
		}

		exercises, err := h.content.GetExercises("", "", "")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch exercises"})
			return
		}

		certificateType := strings.TrimSpace(c.Param("type"))
		certificates := buildCertificates(user, progresses, lessons, exercises)

		var selected *certificateDTO
		for i := range certificates {
			if certificates[i].ID == certificateType {
				selected = &certificates[i]
				break
			}
		}

		if selected == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Certificate not found"})
			return
		}

		if !selected.Earned {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Certificate is not earned yet"})
			return
		}
		if !selected.EmailAllowed {
			c.JSON(http.StatusForbidden, gin.H{"error": selected.LockedReason})
			return
		}

		if err := h.sendCertificateEmail(user.Email, user.FullName, *selected); err != nil {
			log.Printf("certificate email send error for %s: %v", user.Email, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send certificate email"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"ok":      true,
			"message": "Ссылка на сертификат отправлена на email",
		})
	}
}

func (h *Handler) sendCertificateEmail(email string, fullName string, cert certificateDTO) error {
	certificateLink := fmt.Sprintf("%s/certificate?type=%s", strings.TrimRight(h.cfg.FrontendURL, "/"), cert.ID)
	body := fmt.Sprintf(
		"Здравствуйте, %s!\n\nВаш сертификат Godemy готов.\n\nКурс: %s\nНомер сертификата: %s\nСсылка на сертификат: %s\n\nОткройте ссылку и сохраните сертификат как PDF.\n",
		strings.TrimSpace(fullName),
		cert.CourseName,
		cert.CertificateNumber,
		certificateLink,
	)

	if h.cfg.SMTPHost == "" || h.cfg.SMTPPort == "" || h.cfg.SMTPUser == "" || h.cfg.SMTPPassword == "" {
		if strings.EqualFold(h.cfg.AppEnv, "production") {
			return fmt.Errorf("SMTP is not configured")
		}
		log.Printf("[certificate-email] SMTP not configured. Link for %s: %s", email, certificateLink)
		return nil
	}

	from := h.cfg.SMTPFrom
	if from == "" {
		from = h.cfg.SMTPUser
	}

	msg := []byte("To: " + email + "\r\n" +
		"From: " + from + "\r\n" +
		"Subject: Ваш сертификат Godemy\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/plain; charset=UTF-8\r\n\r\n" +
		body)

	auth := smtp.PlainAuth("", h.cfg.SMTPUser, h.cfg.SMTPPassword, h.cfg.SMTPHost)
	addr := fmt.Sprintf("%s:%s", h.cfg.SMTPHost, h.cfg.SMTPPort)
	return smtp.SendMail(addr, auth, from, []string{email}, msg)
}
