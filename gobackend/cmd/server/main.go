package main

import (
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/adaptor"
	"github.com/modelcontextprotocol/go-sdk/mcp"

	"gobackend/config"
	"gobackend/internal/database"
	"gobackend/internal/handlers"
	"gobackend/internal/hub"
	"gobackend/internal/logger"
	mizanserver "gobackend/internal/mcp"
	"gobackend/internal/middleware"
	"gobackend/internal/models"
	"gobackend/internal/utils"
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

	logSvc := logger.InitLogger("data/system_logs.json", realtimeHub)
	logSvc.Log(logger.LogEntry{
		Level:    "INFO",
		Category: "SYSTEM",
		Action:   "SERVER_INIT",
		Actor: logger.LogActor{
			Name: "Mizan Core Engine",
			Role: "SYSTEM",
			IP:   "127.0.0.1",
		},
		Message: "Backend engine Mizan Go siap melayani",
	})

	app.Use(func(c *fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		duration := time.Since(start)

		p := c.Path()
		method := c.Method()
		status := c.Response().StatusCode()

		if strings.HasPrefix(p, "/api/") && p != "/api/logs" && p != "/health" {
			level := "INFO"
			category := "HTTP"

			if strings.Contains(p, "auth") {
				category = "AUTH"
			} else if strings.Contains(p, "absensi") {
				category = "PRESENSI"
			} else if strings.Contains(p, "penilaian") {
				category = "PENILAIAN"
			} else if strings.Contains(p, "santri") {
				category = "SANTRI"
			} else if strings.Contains(p, "classes") {
				category = "KELAS"
			} else if strings.Contains(p, "categories") {
				category = "KATEGORI"
			} else if strings.Contains(p, "feedback") {
				category = "FEEDBACK"
			}

			if status >= 500 {
				level = "ERROR"
			} else if status >= 400 {
				level = "WARN"
			}

			if method != "GET" || status >= 400 {
				actorName := "Guest"
				actorRole := "PUBLIC"
				actorID := ""
				if uname, ok := c.Locals("username").(string); ok && uname != "" {
					actorName = uname
				}
				if urole, ok := c.Locals("role").(string); ok && urole != "" {
					actorRole = urole
				}
				if uid, ok := c.Locals("user_id").(string); ok && uid != "" {
					actorID = uid
				}

				errMsg := ""
				if err != nil {
					errMsg = err.Error()
				}

				logSvc.Log(logger.LogEntry{
					Level:    level,
					Category: category,
					Action:   method + " " + p,
					Actor: logger.LogActor{
						ID:   actorID,
						Name: actorName,
						Role: actorRole,
						IP:   c.IP(),
					},
					Message: fmt.Sprintf("[%d] %s %s (%dms)", status, method, p, duration.Milliseconds()),
					Details: map[string]interface{}{
						"method":      method,
						"path":        p,
						"status":      status,
						"duration_ms": duration.Milliseconds(),
						"error":       errMsg,
						"user_agent":  c.Get("User-Agent"),
					},
				})
			}
		}
		return err
	})

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

	mcpServer := mizanserver.NewMizanMCPServer(realtimeHub)
	mcpHandler := mcp.NewStreamableHTTPHandler(func(r *http.Request) *mcp.Server {
		return mcpServer
	}, nil)

	mcpAuth := func(c *fiber.Ctx) error {
		mcpKey := os.Getenv("MCP_API_KEY")
		if mcpKey == "" {
			return utils.SendError(c, fiber.StatusUnauthorized, "Akses MCP dinonaktifkan")
		}

		authHeader := c.Get("Authorization")
		var bearerToken string
		if strings.HasPrefix(authHeader, "Bearer ") {
			bearerToken = strings.TrimPrefix(authHeader, "Bearer ")
			if len(bearerToken) == len(mcpKey) && subtle.ConstantTimeCompare([]byte(bearerToken), []byte(mcpKey)) == 1 {
				return c.Next()
			}
		}

		sessionToken := c.Cookies("mizan_session")
		if sessionToken == "" && bearerToken != "" {
			sessionToken = bearerToken
		}

		if sessionToken != "" {
			payload, err := middleware.VerifySessionToken(sessionToken, cfg.SessionSecret)
			if err == nil && payload.Role == models.RoleSuperAdmin {
				return c.Next()
			}
		}

		return utils.SendError(c, fiber.StatusUnauthorized, "Autentikasi MCP diperlukan")
	}

	app.All("/mcp*", mcpAuth, adaptor.HTTPHandler(mcpHandler))

	app.Use("/ws", func(c *fiber.Ctx) error {
		if !websocket.IsWebSocketUpgrade(c) {
			return fiber.ErrUpgradeRequired
		}
		token := c.Cookies("mizan_session")
		if token == "" {
			authHeader := c.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				token = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}
		if token == "" {
			token = c.Query("token")
		}
		if token == "" {
			return fiber.ErrUnauthorized
		}
		if _, err := middleware.VerifySessionToken(token, cfg.SessionSecret); err != nil {
			return fiber.ErrUnauthorized
		}
		return c.Next()
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

	publicV1 := app.Group("/api/v1/public")
	publicV1.Get("/website-settings", handlers.GetPublicWebsiteSettings)
	publicV1.Get("/hero-section", handlers.GetPublicHeroSection)
	publicV1.Get("/visi-misi", handlers.GetPublicVisiMisi)
	publicV1.Get("/fasilitas", handlers.GetPublicFasilitas)
	publicV1.Get("/tenaga-pengajar", handlers.GetPublicTenagaPengajar)
	publicV1.Get("/posts", handlers.GetPublicPosts)
	publicV1.Get("/posts/:slug", handlers.GetPublicPostBySlug)
	publicV1.Post("/psb/daftar", handlers.PostPublicPSBDaftar)
	publicV1.Get("/psb/daftar", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusMethodNotAllowed).JSON(fiber.Map{
			"error": "Method Not Allowed",
		})
	})
	publicV1.All("/"+string('*'), func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Not Found",
		})
	})

	core := app.Group("/api/core")
	core.Get("/settings", handlers.GetPublicWebsiteSettings)
	core.Get("/hero", handlers.GetPublicHeroSection)
	core.Get("/visi-misi", handlers.GetPublicVisiMisi)
	core.Get("/fasilitas", handlers.GetPublicFasilitas)
	core.Get("/tenaga-pengajar", handlers.GetPublicTenagaPengajar)
	core.Get("/programs", handlers.GetPublicPrograms)
	core.Get("/program-pendidikan", handlers.GetPublicProgramPendidikan)
	core.Get("/sejarah-timeline", handlers.GetPublicSejarahTimeline)
	core.Get("/ekstrakurikuler", handlers.GetPublicEkstrakurikuler)
	core.Get("/jadwal-harian", handlers.GetPublicJadwalHarian)
	core.Get("/persyaratan", handlers.GetPublicPersyaratan)
	core.Get("/alur-pendaftaran", handlers.GetPublicAlurPendaftaran)
	core.Get("/registration-flow", handlers.GetPublicAlurPendaftaran)
	core.Get("/biaya-pendidikan", handlers.GetPublicBiayaPendidikan)
	core.Get("/statistik", handlers.GetPublicStatistik)
	core.Get("/founders", handlers.GetPublicFounders)
	core.Get("/struktur-organisasi", handlers.GetPublicStrukturOrganisasi)
	core.Get("/form-config", handlers.GetPublicFormConfig)
	core.Get("/last-updates", handlers.GetPublicLastUpdates)
	core.Post("/contact", handlers.PostPublicContact)

	blog := app.Group("/api/blog")
	blog.Get("/posts", handlers.GetPublicPosts)
	blog.Get("/posts/:slug", handlers.GetPublicPostBySlug)
	blog.Get("/categories", handlers.GetPublicBlogCategories)
	blog.Get("/tags", handlers.GetPublicBlogTags)
	blog.Get("/announcements", handlers.GetPublicBlogAnnouncements)
	blog.Get("/testimonials", handlers.GetPublicBlogTestimonials)

	psb := app.Group("/api/psb")
	psb.Post("/daftar", handlers.PostPublicPSBDaftar)
	psb.Post("/register", handlers.PostPublicPSBDaftar)

	app.Post("/api/v1/auth/login", middleware.AdminLogin(cfg.SessionSecret))

	adminV1 := app.Group("/api/v1/admin", middleware.AdminJWTAuth(cfg.SessionSecret))
	adminV1.Get("/cms/:section", handlers.GetAdminCMSList)
	adminV1.Get("/cms/:section/:id", handlers.GetAdminCMSDetail)
	adminV1.Post("/cms/:section", handlers.PostAdminCMSItem)
	adminV1.Put("/cms/:section/:id", handlers.PutAdminCMSItem)
	adminV1.Delete("/cms/:section/:id", handlers.DeleteAdminCMSItem)
	adminV1.Post("/cms/:section/bulk-delete", handlers.PostAdminCMSBulkDelete)
	adminV1.Get("/blog/posts", handlers.GetAdminBlogPosts)
	adminV1.Post("/blog/posts", handlers.PostAdminBlogPost)
	adminV1.Put("/blog/posts/:id", handlers.PutAdminBlogPost)
	adminV1.Delete("/blog/posts/:id", handlers.DeleteAdminBlogPost)
	adminV1.Get("/psb/pendaftar", handlers.GetAdminPSBPendaftar)
	adminV1.Get("/psb/pendaftar/:id", handlers.GetAdminPSBPendaftarDetail)
	adminV1.Put("/psb/pendaftar/:id", handlers.PutAdminPSBPendaftar)
	adminV1.Post("/psb/pendaftar/bulk-action", handlers.PostAdminPSBApplicantBulkAction)

	api := app.Group("/api")

	api.Post("/auth/login", middleware.DualAuthLogin(handlers.Login(cfg), cfg.SessionSecret))
	api.Get("/auth/me", handlers.GetMe(cfg))
	api.Get("/share", handlers.GetShareCard)
	api.Get("/data", middleware.OptionalAuth(cfg.SessionSecret), handlers.GetData)
	api.Get("/feedback", middleware.OptionalAuth(cfg.SessionSecret), handlers.GetFeedback)
	api.Get("/notifications", middleware.OptionalAuth(cfg.SessionSecret), handlers.GetNotifications)
	api.Get("/classes", handlers.GetClasses)
	api.Get("/categories", handlers.GetCategories)
	api.Get("/logs", handlers.GetLogs(logSvc))
	api.Post("/logs", handlers.CreateLog(logSvc))
	api.Get("/logs/stats", handlers.GetLogStats(logSvc))
	api.Delete("/logs", handlers.ClearLogs(logSvc))

	api.Use(middleware.AuthRequired(cfg.SessionSecret))

	api.Post("/auth/update-password", handlers.UpdatePassword)

	api.Get("/santri", handlers.GetSantri)
	api.Post("/santri", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleGuru), handlers.CreateSantri)
	api.Patch("/santri", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleGuru), handlers.UpdateSantri)
	api.Delete("/santri", middleware.RequireRoles(models.RoleSuperAdmin), handlers.DeleteSantri)

	api.Post("/classes", middleware.RequireRoles(models.RoleSuperAdmin), handlers.CreateClass)
	api.Patch("/classes", middleware.RequireRoles(models.RoleSuperAdmin), handlers.UpdateClass)
	api.Delete("/classes", middleware.RequireRoles(models.RoleSuperAdmin), handlers.DeleteClass)

	api.Post("/categories", middleware.RequireRoles(models.RoleSuperAdmin), handlers.CreateCategory)
	api.Post("/categories/unsur", middleware.RequireRoles(models.RoleSuperAdmin), handlers.CreateUnsur)
	api.Post("/categories/indicator", middleware.RequireRoles(models.RoleSuperAdmin), handlers.CreateIndicator)
	api.Put("/categories/indicator", middleware.RequireRoles(models.RoleSuperAdmin), handlers.UpdateIndicator)
	api.Delete("/categories/indicator/:id", middleware.RequireRoles(models.RoleSuperAdmin), handlers.DeleteIndicator)

	api.Get("/absensi", handlers.GetAbsensi)
	api.Post("/absensi", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleGuru), handlers.CreateAbsensi(realtimeHub))
	api.Patch("/absensi", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleGuru), handlers.UpdateAbsensi(realtimeHub))
	api.Delete("/absensi", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleGuru), handlers.DeleteAbsensi)

	api.Get("/penilaian", handlers.GetPenilaian)
	api.Post("/penilaian", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleGuru), handlers.CreatePenilaian(realtimeHub))
	api.Delete("/penilaian", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleGuru), handlers.DeletePenilaian)

	api.Get("/users", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleGuru), handlers.GetUsers)
	api.Post("/users", middleware.RequireRoles(models.RoleSuperAdmin), handlers.CreateUser)
	api.Patch("/users", middleware.RequireRoles(models.RoleSuperAdmin), handlers.UpdateUser)
	api.Delete("/users", middleware.RequireRoles(models.RoleSuperAdmin), handlers.DeleteUser)

	api.Get("/settings", handlers.GetSettings)
	api.Post("/settings", middleware.RequireRoles(models.RoleSuperAdmin), handlers.UpdateSettings)

	api.Post("/share", handlers.CreateShareCard)

	api.Get("/monitoring/tahfidz", handlers.GetTahfidz)
	api.Post("/monitoring/tahfidz", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.CreateTahfidz(realtimeHub))
	api.Delete("/monitoring/tahfidz", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.DeleteTahfidz)

	api.Get("/monitoring/kesehatan", handlers.GetKesehatan)
	api.Post("/monitoring/kesehatan", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.CreateKesehatan(realtimeHub))
	api.Delete("/monitoring/kesehatan", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.DeleteKesehatan)

	api.Get("/monitoring/perizinan", handlers.GetPerizinan)
	api.Post("/monitoring/perizinan", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleOrtu), handlers.CreatePerizinan(realtimeHub))
	api.Put("/monitoring/perizinan", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.UpdatePerizinan(realtimeHub))
	api.Delete("/monitoring/perizinan", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.DeletePerizinan)
	api.Patch("/monitoring/perizinan/approve", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.ApprovePerizinan(realtimeHub))
	api.Post("/monitoring/perizinan/verify", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleSatpam), handlers.VerifyPerizinanQR(realtimeHub))

	api.Get("/monitoring/sambangan", handlers.GetSambangan)
	api.Post("/monitoring/sambangan", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleOrtu), handlers.CreateSambangan(realtimeHub))
	api.Delete("/monitoring/sambangan", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.DeleteSambangan)

	api.Get("/monitoring/catatan-musyrif", handlers.GetCatatanMusyrif)
	api.Post("/monitoring/catatan-musyrif", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.CreateCatatanMusyrif(realtimeHub))

	api.Get("/monitoring/keuangan", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleOrtu), handlers.GetKeuangan)
	api.Post("/monitoring/keuangan", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.CreateTransaksiKeuangan(realtimeHub))
	api.Delete("/monitoring/keuangan", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.DeleteTransaksiKeuangan(realtimeHub))

	api.Get("/monitoring/spp", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleOrtu), handlers.GetTagihanSPP)
	api.Post("/monitoring/spp", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.CreateTagihanSPP(realtimeHub))
	api.Delete("/monitoring/spp", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.DeleteTagihanSPP)
	api.Patch("/monitoring/spp/pay", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan), handlers.PayTagihanSPP(realtimeHub))

	api.Post("/feedback", handlers.CreateFeedback(realtimeHub))
	api.Patch("/feedback", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleGuru), handlers.UpdateFeedbackStatus)
	api.Delete("/feedback", middleware.RequireRoles(models.RoleSuperAdmin), handlers.DeleteFeedback)
	api.Post("/feedback/analyze", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleGuru), handlers.AnalyzeFeedback(cfg))

	api.Post("/notifications", middleware.RequireRoles(models.RoleSuperAdmin), handlers.CreateNotification(realtimeHub))
	api.Patch("/notifications", middleware.RequireRoles(models.RoleSuperAdmin), handlers.UpdateNotification)
	api.Delete("/notifications", middleware.RequireRoles(models.RoleSuperAdmin), handlers.DeleteNotification)

	api.Get("/admin/backup", middleware.RequireRoles(models.RoleSuperAdmin), handlers.ExportBackup)
	api.Post("/upload-avatar", handlers.UploadAvatar)

	api.Post("/broadcast", middleware.RequireRoles(models.RoleSuperAdmin, models.RolePengasuhan, models.RoleGuru), func(c *fiber.Ctx) error {
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

	app.Use(func(c *fiber.Ctx) error {
		p := c.Path()
		if p == "/sw.js" || p == "/manifest.json" || p == "/site.webmanifest" {
			c.Set("Cache-Control", "no-cache, no-store, must-revalidate")
		} else if strings.HasPrefix(p, "/_next/static/") || strings.HasPrefix(p, "/assets/") {
			c.Set("Cache-Control", "public, max-age=31536000, immutable")
		} else if p == "/" || strings.HasSuffix(p, ".html") {
			c.Set("Cache-Control", "no-cache, no-store, must-revalidate")
		}
		return c.Next()
	})

	if _, err := os.Stat(cfg.StaticPublicWebDir + "/assets"); err == nil {
		app.Static("/assets", cfg.StaticPublicWebDir+"/assets", fiber.Static{
			Compress:      true,
			ByteRange:     true,
			Browse:        false,
			MaxAge:        31536000,
			CacheDuration: 365 * 24 * time.Hour,
		})
	}

	app.Get("/robots.txt", func(c *fiber.Ctx) error {
		robotsFile := cfg.StaticPublicWebDir + "/robots.txt"
		if _, err := os.Stat(robotsFile); err == nil {
			c.Set("Content-Type", "text/plain; charset=utf-8")
			return c.SendFile(robotsFile)
		}
		return c.Status(fiber.StatusNotFound).SendString("User-agent: *\nAllow: /\n")
	})

	app.Get("/sitemap.xml", func(c *fiber.Ctx) error {
		sitemapFile := cfg.StaticPublicWebDir + "/sitemap.xml"
		if _, err := os.Stat(sitemapFile); err == nil {
			c.Set("Content-Type", "application/xml; charset=utf-8")
			return c.SendFile(sitemapFile)
		}
		return c.Status(fiber.StatusNotFound).SendString("Sitemap not found")
	})

	cmsHandler := func(c *fiber.Ctx) error {
		cmsFile := cfg.StaticPublicWebDir + "/admin.html"
		if _, err := os.Stat(cmsFile); err == nil {
			c.Set("Cache-Control", "no-cache, no-store, must-revalidate")
			return c.SendFile(cmsFile)
		}
		return c.Status(fiber.StatusNotFound).SendString("CMS admin.html not found")
	}

	app.Get("/admin.html", cmsHandler)
	app.Get("/admin-cms", cmsHandler)
	app.Get("/admin-cms/"+string('*'), cmsHandler)

	if _, err := os.Stat(cfg.StaticWebDir); err == nil {
		app.Static("/", cfg.StaticWebDir, fiber.Static{
			Compress:  true,
			ByteRange: true,
			Browse:    false,
			Next: func(c *fiber.Ctx) bool {
				return strings.Trim(c.Path(), "/") == ""
			},
		})
	}

	app.Use(func(c *fiber.Ctx) error {
		p := c.Path()
		if strings.Contains(p, "..") {
			return c.Status(fiber.StatusForbidden).SendString("Forbidden")
		}
		if strings.HasPrefix(p, "/api") || strings.HasPrefix(p, "/ws") || strings.HasPrefix(p, "/mcp") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "Endpoint tidak ditemukan",
			})
		}

		reqPath := strings.Trim(p, "/")
		if reqPath == "" {
			publicIndex := cfg.StaticPublicWebDir + "/index.html"
			if _, err := os.Stat(publicIndex); err == nil {
				return c.SendFile(publicIndex)
			}
			return c.SendFile(cfg.StaticWebDir + "/index.html")
		}

		if reqPath == "admin-cms" || strings.HasPrefix(reqPath, "admin-cms/") || reqPath == "admin.html" {
			cmsFile := cfg.StaticPublicWebDir + "/admin.html"
			if _, err := os.Stat(cmsFile); err == nil {
				c.Set("Cache-Control", "no-cache, no-store, must-revalidate")
				return c.SendFile(cmsFile)
			}
			return c.Status(fiber.StatusNotFound).SendString("CMS admin.html not found")
		}

		if reqPath == "login" || reqPath == "register" {
			publicIndex := cfg.StaticPublicWebDir + "/index.html"
			if _, err := os.Stat(publicIndex); err == nil {
				return c.SendFile(publicIndex)
			}
			return c.SendFile(cfg.StaticWebDir + "/login.html")
		}

		isMizanRoute := reqPath == "admin" || strings.HasPrefix(reqPath, "admin/") ||
			reqPath == "bk" || strings.HasPrefix(reqPath, "bk/") ||
			reqPath == "guru" || strings.HasPrefix(reqPath, "guru/") ||
			reqPath == "santri" || strings.HasPrefix(reqPath, "santri/") ||
			reqPath == "ortu" || strings.HasPrefix(reqPath, "ortu/") ||
			reqPath == "satpam" || strings.HasPrefix(reqPath, "satpam/") ||
			reqPath == "share" || strings.HasPrefix(reqPath, "share/") ||
			strings.HasPrefix(reqPath, "_next")

		if isMizanRoute {
			isRSC := c.Get("RSC") == "1" || c.Get("Next-Router-Prefetch") == "1" || c.Query("_rsc") != ""
			if isRSC {
				txtFile := cfg.StaticWebDir + "/" + reqPath + ".txt"
				if _, err := os.Stat(txtFile); err == nil {
					c.Set("Content-Type", "text/x-component; charset=utf-8")
					c.Set("Cache-Control", "public, max-age=1800, stale-while-revalidate=86400")
					return c.SendFile(txtFile)
				}
				nestedTxt := cfg.StaticWebDir + "/" + reqPath + "/__next._full.txt"
				if _, err := os.Stat(nestedTxt); err == nil {
					c.Set("Content-Type", "text/x-component; charset=utf-8")
					c.Set("Cache-Control", "public, max-age=1800, stale-while-revalidate=86400")
					return c.SendFile(nestedTxt)
				}
			}

			htmlFile := cfg.StaticWebDir + "/" + reqPath + ".html"
			if _, err := os.Stat(htmlFile); err == nil {
				c.Set("Cache-Control", "public, max-age=1800, stale-while-revalidate=86400")
				return c.SendFile(htmlFile)
			}

			directFile := cfg.StaticWebDir + "/" + reqPath
			if !strings.HasPrefix(filepath.Clean(directFile), filepath.Clean(cfg.StaticWebDir)+string(filepath.Separator)) {
				return c.Status(fiber.StatusForbidden).SendString("Forbidden")
			}
			if info, err := os.Stat(directFile); err == nil && !info.IsDir() {
				if strings.HasSuffix(reqPath, ".txt") {
					c.Set("Content-Type", "text/x-component; charset=utf-8")
					c.Set("Cache-Control", "public, max-age=1800, stale-while-revalidate=86400")
				}
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
				if strings.HasSuffix(reqPath, ".css") {
					c.Set("Content-Type", "text/css; charset=utf-8")
					return c.Status(fiber.StatusNotFound).SendString("")
				}
				if strings.HasSuffix(reqPath, ".js") {
					c.Set("Content-Type", "application/javascript; charset=utf-8")
					return c.Status(fiber.StatusNotFound).SendString("")
				}
				return c.Status(fiber.StatusNotFound).SendString("File not found")
			}

			if strings.HasPrefix(reqPath, "admin/") {
				cmsFile := cfg.StaticPublicWebDir + "/admin.html"
				if _, err := os.Stat(cmsFile); err == nil {
					return c.SendFile(cmsFile)
				}
			}
			return c.SendFile(cfg.StaticWebDir + "/index.html")
		}

		publicDirect := cfg.StaticPublicWebDir + "/" + reqPath
		if !strings.HasPrefix(filepath.Clean(publicDirect), filepath.Clean(cfg.StaticPublicWebDir)+string(filepath.Separator)) {
			return c.Status(fiber.StatusForbidden).SendString("Forbidden")
		}
		if info, err := os.Stat(publicDirect); err == nil && !info.IsDir() {
			return c.SendFile(publicDirect)
		}

		if strings.Contains(reqPath, ".") {
			return c.Status(fiber.StatusNotFound).SendString("File not found")
		}

		publicIndex := cfg.StaticPublicWebDir + "/index.html"
		if _, err := os.Stat(publicIndex); err == nil {
			return c.SendFile(publicIndex)
		}

		return c.SendFile(cfg.StaticWebDir + "/index.html")
	})

	serverAddr := ":" + cfg.Port
	if err := app.Listen(serverAddr); err != nil {
		os.Exit(1)
	}
}
