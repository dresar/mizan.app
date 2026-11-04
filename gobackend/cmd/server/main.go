package main

import (
	"encoding/json"
	"fmt"
	"os"
	"runtime"
	"strings"
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"

	"gobackend/config"
	"gobackend/internal/database"
	"gobackend/internal/handlers"
	"gobackend/internal/hub"
	"gobackend/internal/middleware"
)

type EventPayload struct {
	Channel   string      `json:"channel"`
	Action    string      `json:"action"`
	Data      interface{} `json:"data"`
	Timestamp string      `json:"timestamp"`
}

func main() {
	cfg := config.LoadConfig()

	_, _ = database.InitDB(cfg.DatabaseURL)

	app := fiber.New(fiber.Config{
		ServerHeader: "Mizan-Go-Core",
		AppName:      "Mizan High-Performance Backend v2.0",
		BodyLimit:    4 * 1024 * 1024,
	})

	app.Use(middleware.SecurityHeaders())
	app.Use(middleware.CORSMiddleware())

	realtimeHub := hub.NewHub()
	go realtimeHub.Run()

	startTime := time.Now()

	app.Get("/health", func(c *fiber.Ctx) error {
		var m runtime.MemStats
		runtime.ReadMemStats(&m)

		return c.JSON(fiber.Map{
			"status":     "ok",
			"engine":     "Golang Fiber v2",
			"uptime":     time.Since(startTime).String(),
			"clients":    realtimeHub.ClientCount(),
			"alloc_mb":   fmt.Sprintf("%.2f MB", float64(m.Alloc)/1024/1024),
			"sys_mb":     fmt.Sprintf("%.2f MB", float64(m.Sys)/1024/1024),
			"goroutines": runtime.NumGoroutine(),
		})
	})

	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		realtimeHub.Register(c)
		defer realtimeHub.Unregister(c)

		welcomeEvent := EventPayload{
			Channel:   "system",
			Action:    "connected",
			Data:      fiber.Map{"message": "Terhubung ke Mizan Realtime Engine"},
			Timestamp: time.Now().Format(time.RFC3339),
		}
		welcomeBytes, _ := json.Marshal(welcomeEvent)
		_ = c.WriteMessage(websocket.TextMessage, welcomeBytes)

		for {
			messageType, message, err := c.ReadMessage()
			if err != nil {
				break
			}
			if messageType == websocket.TextMessage {
				realtimeHub.BroadcastMessage(message)
			}
		}
	}))

	api := app.Group("/api")

	api.Get("/data", handlers.GetData)

	api.Post("/auth/login", handlers.Login(cfg))
	api.Get("/auth/me", handlers.GetMe(cfg))
	api.Post("/auth/update-password", handlers.UpdatePassword)

	api.Get("/santri", handlers.GetSantri)
	api.Post("/santri", handlers.CreateSantri)
	api.Patch("/santri", handlers.UpdateSantri)
	api.Delete("/santri", handlers.DeleteSantri)

	api.Get("/classes", handlers.GetClasses)
	api.Post("/classes", handlers.CreateClass)
	api.Patch("/classes", handlers.UpdateClass)
	api.Delete("/classes", handlers.DeleteClass)

	api.Get("/categories", handlers.GetCategories)
	api.Post("/categories", handlers.CreateCategory)
	api.Post("/categories/unsur", handlers.CreateUnsur)

	api.Get("/absensi", handlers.GetAbsensi)
	api.Post("/absensi", handlers.CreateAbsensi(realtimeHub))
	api.Patch("/absensi", handlers.UpdateAbsensi(realtimeHub))
	api.Delete("/absensi", handlers.DeleteAbsensi)

	api.Get("/penilaian", handlers.GetPenilaian)
	api.Post("/penilaian", handlers.CreatePenilaian(realtimeHub))
	api.Delete("/penilaian", handlers.DeletePenilaian)

	api.Get("/users", handlers.GetUsers)
	api.Post("/users", handlers.CreateUser)
	api.Patch("/users", handlers.UpdateUser)
	api.Delete("/users", handlers.DeleteUser)

	api.Get("/settings", handlers.GetSettings)
	api.Post("/settings", handlers.UpdateSettings)

	api.Get("/share", handlers.GetShareCard)
	api.Post("/share", handlers.CreateShareCard)

	api.Get("/feedback", handlers.GetFeedback)
	api.Post("/feedback", handlers.CreateFeedback(realtimeHub))
	api.Patch("/feedback", handlers.UpdateFeedbackStatus)
	api.Delete("/feedback", handlers.DeleteFeedback)
	api.Post("/feedback/analyze", handlers.AnalyzeFeedback(cfg))

	api.Get("/notifications", handlers.GetNotifications)
	api.Post("/notifications", handlers.CreateNotification(realtimeHub))
	api.Patch("/notifications", handlers.UpdateNotification)
	api.Delete("/notifications", handlers.DeleteNotification)

	api.Get("/admin/backup", handlers.ExportBackup)
	api.Post("/upload-avatar", handlers.UploadAvatar)

	api.Post("/broadcast", func(c *fiber.Ctx) error {
		var payload EventPayload
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Payload tidak valid"})
		}
		if payload.Timestamp == "" {
			payload.Timestamp = time.Now().Format(time.RFC3339)
		}
		bytes, _ := json.Marshal(payload)
		realtimeHub.BroadcastMessage(bytes)
		return c.JSON(fiber.Map{"success": true, "clients": realtimeHub.ClientCount()})
	})

	if _, err := os.Stat(cfg.StaticWebDir); err == nil {
		app.Static("/", cfg.StaticWebDir, fiber.Static{
			Compress:  true,
			ByteRange: true,
			Browse:    false,
		})

		app.Use(func(c *fiber.Ctx) error {
			if strings.HasPrefix(c.Path(), "/api") || strings.HasPrefix(c.Path(), "/ws") {
				return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
					"success": false,
					"error":   "Endpoint tidak ditemukan",
				})
			}

			reqPath := strings.Trim(c.Path(), "/")
			if reqPath == "" {
				return c.SendFile(cfg.StaticWebDir + "/index.html")
			}

			htmlFile := cfg.StaticWebDir + "/" + reqPath + ".html"
			if _, err := os.Stat(htmlFile); err == nil {
				return c.SendFile(htmlFile)
			}

			directFile := cfg.StaticWebDir + "/" + reqPath
			if _, err := os.Stat(directFile); err == nil {
				return c.SendFile(directFile)
			}

			if strings.HasPrefix(reqPath, "guru/santri/") {
				if strings.HasSuffix(reqPath, ".txt") {
					return c.SendFile(cfg.StaticWebDir + "/guru/santri/detail.txt")
				}
				return c.SendFile(cfg.StaticWebDir + "/guru/santri/detail.html")
			}

			if strings.HasPrefix(reqPath, "bk/santri/") {
				if strings.HasSuffix(reqPath, ".txt") {
					return c.SendFile(cfg.StaticWebDir + "/bk/santri/detail.txt")
				}
				return c.SendFile(cfg.StaticWebDir + "/bk/santri/detail.html")
			}

			if strings.HasPrefix(reqPath, "admin/kategori-pelanggaran/") {
				if strings.HasSuffix(reqPath, ".txt") {
					return c.SendFile(cfg.StaticWebDir + "/admin/kategori-pelanggaran/detail.txt")
				}
				return c.SendFile(cfg.StaticWebDir + "/admin/kategori-pelanggaran/detail.html")
			}

			if strings.HasPrefix(reqPath, "admin/kelas/") {
				if strings.HasSuffix(reqPath, ".txt") {
					return c.SendFile(cfg.StaticWebDir + "/admin/kelas/detail.txt")
				}
				return c.SendFile(cfg.StaticWebDir + "/admin/kelas/detail.html")
			}

			if strings.HasPrefix(reqPath, "share/") {
				if strings.HasSuffix(reqPath, ".txt") {
					return c.SendFile(cfg.StaticWebDir + "/share/preview.txt")
				}
				return c.SendFile(cfg.StaticWebDir + "/share/preview.html")
			}

			nestedIndex := cfg.StaticWebDir + "/" + reqPath + "/index.html"
			if _, err := os.Stat(nestedIndex); err == nil {
				return c.SendFile(nestedIndex)
			}

			if strings.Contains(reqPath, ".") {
				return c.Status(fiber.StatusNotFound).SendString("File not found")
			}

			return c.SendFile(cfg.StaticWebDir + "/index.html")
		})
	}

	serverAddr := ":" + cfg.Port
	if err := app.Listen(serverAddr); err != nil {
		os.Exit(1)
	}
}
