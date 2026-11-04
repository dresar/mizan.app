package handlers

import (
	"context"
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/database"
	"gobackend/internal/utils"
)

func GetSettings(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var raw []byte
	err := pool.QueryRow(ctx, "SELECT value FROM app_settings WHERE key = 'general' LIMIT 1").Scan(&raw)
	if err != nil {
		return c.JSON(fiber.Map{"success": true, "settings": fiber.Map{}})
	}

	var parsed map[string]interface{}
	_ = json.Unmarshal(raw, &parsed)

	return c.JSON(fiber.Map{
		"success":  true,
		"settings": parsed,
	})
}

func UpdateSettings(c *fiber.Ctx) error {
	var body map[string]interface{}
	if err := c.BodyParser(&body); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Payload pengaturan tidak valid")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	bytesData, err := json.Marshal(body)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Gagal encode JSON")
	}

	_, err = pool.Exec(ctx, `
		INSERT INTO app_settings (key, value)
		VALUES ('general', $1)
		ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
	`, bytesData)

	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, body, "Pengaturan berhasil disimpan")
}
