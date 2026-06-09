package main

import (
	"context"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"

	"golanger/backend/config"
	"golanger/backend/data"
	"golanger/backend/database"
	httpdelivery "golanger/backend/delivery/http"
	"golanger/backend/middleware"
	"golanger/backend/repository"
	"golanger/backend/usecase"
)

func main() {
	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		log.Fatalf("Invalid production configuration: %v", err)
	}

	if err := database.Init(cfg.DatabaseURL); err != nil {
		log.Fatalf("Failed to init database: %v", err)
	}

	data.Seed(database.DB)

	userRepo := repository.NewUserRepository(database.DB)
	passwordResetRepo := repository.NewPasswordResetRepository(database.DB)
	lessonRepo := repository.NewLessonRepository(database.DB)
	exerciseRepo := repository.NewExerciseRepository(database.DB)
	progressRepo := repository.NewProgressRepository(database.DB)
	levelRepo := repository.NewGormLevelRepository(database.DB)
	trainerTopicRepo := repository.NewTrainerTopicRepository(database.DB)
	skillRepo := repository.NewSkillRepository(database.DB)

	var rdb *redis.Client
	if cfg.RedisAddr != "" {
		rdb = redis.NewClient(&redis.Options{
			Addr:     cfg.RedisAddr,
			Password: cfg.RedisPassword,
			DB:       cfg.RedisDB,
		})

		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		if err := rdb.Ping(ctx).Err(); err != nil {
			log.Printf("Redis is unavailable, starting without rate limit store: %v", err)
			_ = rdb.Close()
			rdb = nil
		}
	} else {
		log.Printf("REDIS_ADDR is not configured, starting without rate limit store")
	}

	authUC := usecase.NewAuthUseCase(userRepo, passwordResetRepo, cfg.JWTSecret)
	contentUC := usecase.NewContentUseCase(lessonRepo, exerciseRepo, progressRepo, levelRepo, trainerTopicRepo, skillRepo)
	runnerUC := usecase.NewRunnerUseCase(exerciseRepo, progressRepo)
	h := httpdelivery.NewHandler(authUC, contentUC, runnerUC, cfg, rdb)

	if err := authUC.EnsureAdminAccount(cfg.AdminLogin, cfg.AdminSecret); err != nil {
		log.Fatalf("Failed to ensure admin account: %v", err)
	}

	r := gin.Default()
	if err := r.SetTrustedProxies([]string{"10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"}); err != nil {
		log.Fatalf("Failed to configure trusted proxies: %v", err)
	}
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))
	r.OPTIONS("/*path", func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		for _, allowed := range cfg.AllowedOrigins {
			if origin == allowed {
				c.Header("Access-Control-Allow-Origin", origin)
				c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
				c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
				c.Header("Access-Control-Allow-Credentials", "true")
				break
			}
		}
		c.Status(204)
	})

	// Serve uploaded images statically
	r.Static("/uploads", "./uploads")

	api := r.Group("/api")

	// Auth
	auth := api.Group("/auth")
	auth.Use(middleware.RedisRateLimit(rdb, "auth", 30, time.Minute))
	auth.POST("/register", h.Register())
	auth.POST("/login", h.Login())
	auth.POST("/forgot-password", h.ForgotPassword())
	auth.POST("/reset-password", h.ResetPassword())
	auth.GET("/me", middleware.AuthRequired(cfg.JWTSecret), h.Me())
	auth.PUT("/me", middleware.AuthRequired(cfg.JWTSecret), h.UpdateMe())
	auth.GET("/yandex", h.YandexOAuth())
	auth.POST("/yandex", h.YandexCallback())
	auth.GET("/google", h.GoogleOAuth())
	auth.POST("/google", h.GoogleCallback())

	// Content (public)
	api.GET("/lessons", h.GetLessons())
	api.GET("/lessons/:slug", h.GetLesson())
	api.GET("/exercises", h.GetExercises())
	api.GET("/exercises/:id", h.GetExercise())

	// Trainer topics (public)
	api.GET("/trainer/topics", h.GetTrainerTopics())
	api.GET("/trainer/topics/:slug", h.GetTrainerTopic())

	runnerLimit := middleware.RedisRateLimit(rdb, "runner", 12, time.Minute)
	api.POST("/run", runnerLimit, h.RunCode())

	// Submit (auth optional — saves progress when logged in)
	submitMiddleware := middleware.AuthRequired(cfg.JWTSecret)
	api.POST("/submit", runnerLimit, func(c *gin.Context) {
		// Try auth, but don't block if not provided
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			submitMiddleware(c)
		}
		if !c.IsAborted() {
			h.SubmitExercise()(c)
		}
	})

	// Progress (protected)
	protected := api.Group("/")
	protected.Use(middleware.AuthRequired(cfg.JWTSecret))
	protected.GET("/progress", h.GetProgress())
	protected.POST("/progress", h.UpdateProgress())
	protected.GET("/user/profile", h.GetProfile())
	protected.POST("/certificates/:type/email", h.EmailCertificate())

	// Admin (protected by authenticated admin role)
	admin := api.Group("/admin")
	admin.Use(middleware.AuthRequired(cfg.JWTSecret), middleware.AdminRequired(authUC))
	admin.POST("/activate", h.ActivatePremium())

	// Admin: Lessons CRUD
	admin.GET("/lessons", h.AdminGetLessons())
	admin.GET("/lessons/:id", h.AdminGetLesson())
	admin.POST("/lessons", h.AdminCreateLesson())
	admin.PUT("/lessons/:id", h.AdminUpdateLesson())
	admin.DELETE("/lessons/:id", h.AdminDeleteLesson())

	// Admin: Exercises CRUD
	admin.GET("/exercises", h.AdminGetExercises())
	admin.GET("/exercises/:id", h.AdminGetExercise())
	admin.POST("/exercises", h.AdminCreateExercise())
	admin.PUT("/exercises/:id", h.AdminUpdateExercise())
	admin.DELETE("/exercises/:id", h.AdminDeleteExercise())

	// Admin: TrainerTopics CRUD
	admin.GET("/trainer-topics", h.AdminGetTrainerTopics())
	admin.GET("/trainer-topics/:id", h.AdminGetTrainerTopic())
	admin.POST("/trainer-topics", h.AdminCreateTrainerTopic())
	admin.PUT("/trainer-topics/:id", h.AdminUpdateTrainerTopic())
	admin.DELETE("/trainer-topics/:id", h.AdminDeleteTrainerTopic())

	// Admin: Modules CRUD
	admin.GET("/modules", h.AdminGetModules())
	admin.POST("/modules", h.AdminCreateModule())
	admin.PUT("/modules/:name", h.AdminRenameModule())
	admin.DELETE("/modules/:name", h.AdminDeleteModule())
	admin.PUT("/modules/:name/move", h.AdminMoveModule())

	// Admin: Upload image
	admin.POST("/upload", h.UploadImage())

	// Admin: Levels CRUD
	admin.GET("/levels", h.AdminGetLevels())
	admin.POST("/levels", h.AdminCreateLevel())
	admin.PUT("/levels/:id", h.AdminUpdateLevel())
	admin.DELETE("/levels/:id", h.AdminDeleteLevel())

	// Public: Levels
	api.GET("/levels", h.AdminGetLevels())

	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
