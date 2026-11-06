package handlers

import (
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/logger"
	"gobackend/internal/utils"
)

func GetLogs(logSvc *logger.LogService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		limitStr := c.Query("limit", "100")
		limit, _ := strconv.Atoi(limitStr)
		if limit <= 0 {
			limit = 100
		}

		level := c.Query("level", "")
		category := c.Query("category", "")
		search := c.Query("search", "")

		logs := logSvc.GetLogs(limit, level, category, search)
		stats := logSvc.GetStats()

		return utils.SendSuccess(c, fiber.Map{
			"logs":  logs,
			"stats": stats,
		})
	}
}

func CreateLog(logSvc *logger.LogService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var entry logger.LogEntry
		if err := c.BodyParser(&entry); err != nil {
			return utils.SendError(c, fiber.StatusBadRequest, "Invalid JSON payload")
		}

		if entry.Message == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "Message is required")
		}

		if entry.Actor.IP == "" {
			entry.Actor.IP = c.IP()
		}

		if uid, ok := c.Locals("user_id").(string); ok && uid != "" {
			if entry.Actor.ID == "" {
				entry.Actor.ID = uid
			}
		}
		if uname, ok := c.Locals("username").(string); ok && uname != "" {
			if entry.Actor.Name == "" {
				entry.Actor.Name = uname
			}
		}
		if urole, ok := c.Locals("role").(string); ok && urole != "" {
			if entry.Actor.Role == "" {
				entry.Actor.Role = urole
			}
		}

		if entry.Category == "" {
			entry.Category = "CLIENT"
		}

		logSvc.Log(entry)

		return utils.SendSuccess(c, fiber.Map{
			"logged": true,
			"id":     entry.ID,
		})
	}
}

func ClearLogs(logSvc *logger.LogService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		role, _ := c.Locals("role").(string)
		if role == "" {
			role = c.Get("X-User-Role")
		}

		if !strings.EqualFold(role, "SUPER_ADMIN") && !strings.EqualFold(role, "ADMIN") {
			return utils.SendError(c, fiber.StatusForbidden, "Akses khusus Super Admin")
		}

		logSvc.Clear()

		return utils.SendSuccess(c, fiber.Map{
			"cleared": true,
			"message": "Seluruh log 24 jam berhasil dibersihkan",
		})
	}
}

func GetLogStats(logSvc *logger.LogService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		stats := logSvc.GetStats()
		return utils.SendSuccess(c, stats)
	}
}
