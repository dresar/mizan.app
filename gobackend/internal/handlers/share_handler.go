package handlers

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
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
	var expiresAt *time.Time

	err := pool.QueryRow(ctx, `
		SELECT title, type, period, scope, data, created_at, expires_at
		FROM public_shares
		WHERE id = $1
		LIMIT 1
	`, id).Scan(&title, &cardType, &period, &scope, &rawData, &createdAt, &expiresAt)

	if err != nil {
		return utils.SendError(c, fiber.StatusNotFound, "Kartu share tidak ditemukan")
	}

	if expiresAt != nil && time.Now().After(*expiresAt) {
		return utils.SendError(c, fiber.StatusGone, "Kartu berbagi ini telah kedaluwarsa")
	}

	var dataMap map[string]interface{}
	_ = json.Unmarshal(rawData, &dataMap)

	shareObj := fiber.Map{
		"id":        id,
		"title":     title,
		"type":      cardType,
		"period":    period,
		"scope":     scope,
		"data":      dataMap,
		"createdAt": utils.FormatWIBDateTime(createdAt),
	}

	if expiresAt != nil {
		shareObj["expiresAt"] = utils.FormatWIBDateTime(*expiresAt)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"share":   shareObj,
		"card":    shareObj,
	})
}

func CreateShareCard(c *fiber.Ctx) error {
	var req struct {
		Title  string                 `json:"title"`
		Type   string                 `json:"type"`
		Period string                 `json:"period"`
		Scope  string                 `json:"scope"`
		Data   map[string]interface{} `json:"data"`
	}
	if err := c.BodyParser(&req); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Data share card tidak lengkap")
	}

	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Gagal membuat ID share")
	}
	shareID := fmt.Sprintf("stat-%x", b)

	if req.Title == "" {
		req.Title = "Kartu Statistik Mizan"
	}
	if req.Type == "" {
		req.Type = "SHOLAT"
	}
	if req.Period == "" {
		req.Period = "HARI_INI"
	}
	if req.Scope == "" {
		req.Scope = "ALL"
	}

	expiryDays := 30
	if envDays := os.Getenv("SHARE_EXPIRY_DAYS"); envDays != "" {
		if d, err := strconv.Atoi(envDays); err == nil && d > 0 {
			expiryDays = d
		}
	}
	expiresAt := time.Now().Add(time.Duration(expiryDays) * 24 * time.Hour)

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	rawBytes, _ := json.Marshal(req.Data)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, `
		INSERT INTO public_shares (id, title, type, period, scope, data, created_at, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
	`, shareID, req.Title, req.Type, req.Period, req.Scope, rawBytes, expiresAt)

	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	shareObj := fiber.Map{
		"id":        shareID,
		"title":     req.Title,
		"type":      req.Type,
		"period":    req.Period,
		"scope":     req.Scope,
		"data":      req.Data,
		"expiresAt": utils.FormatWIBDateTime(expiresAt),
	}

	return c.JSON(fiber.Map{
		"success": true,
		"share":   shareObj,
		"card":    shareObj,
		"message": "Kartu share berhasil disimpan",
	})
}
