package handlers

import (
	"context"
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/database"
	"gobackend/internal/utils"
)

func GetShareCard(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID share dibutuhkan")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var title, cardType, period, scope string
	var rawData []byte
	var createdAt time.Time

	err := pool.QueryRow(ctx, `
		SELECT title, type, period, scope, data, created_at
		FROM public_shares
		WHERE id = $1
		LIMIT 1
	`, id).Scan(&title, &cardType, &period, &scope, &rawData, &createdAt)

	if err != nil {
		return utils.SendError(c, fiber.StatusNotFound, "Kartu share tidak ditemukan")
	}

	var dataMap map[string]interface{}
	_ = json.Unmarshal(rawData, &dataMap)

	return c.JSON(fiber.Map{
		"success": true,
		"card": fiber.Map{
			"id":        id,
			"title":     title,
			"type":      cardType,
			"period":    period,
			"scope":     scope,
			"data":      dataMap,
			"createdAt": utils.FormatWIBDateTime(createdAt),
		},
	})
}

func CreateShareCard(c *fiber.Ctx) error {
	var req struct {
		ID     string                 `json:"id"`
		Title  string                 `json:"title"`
		Type   string                 `json:"type"`
		Period string                 `json:"period"`
		Scope  string                 `json:"scope"`
		Data   map[string]interface{} `json:"data"`
	}
	if err := c.BodyParser(&req); err != nil || req.ID == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "Data share card tidak lengkap")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	rawBytes, _ := json.Marshal(req.Data)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, `
		INSERT INTO public_shares (id, title, type, period, scope, data, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		ON CONFLICT (id) DO UPDATE SET
			title = EXCLUDED.title,
			data = EXCLUDED.data
	`, req.ID, req.Title, req.Type, req.Period, req.Scope, rawBytes)

	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, fiber.Map{"id": req.ID}, "Kartu share berhasil disimpan")
}
