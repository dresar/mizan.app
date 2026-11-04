package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/database"
	"gobackend/internal/hub"
	"gobackend/internal/models"
	"gobackend/internal/utils"
)

func GetAbsensi(c *fiber.Ctx) error {
	date := c.Query("date")
	class := c.Query("class")
	waktu := c.Query("waktuSholat")

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	sql := `
		SELECT 
			id, santri_id, santri_name, santri_class, gender, guru_id,
			guru_name, COALESCE(waktu_sholat, 'Subuh'), date, status, score_impact,
			notes, to_char(created_at, 'HH24:MI WIB')
		FROM absensi
		WHERE 1=1
	`
	var args []interface{}

	if date != "" {
		args = append(args, date)
		sql += fmt.Sprintf(" AND date = $%d", len(args))
	}
	if class != "" && class != "ALL" {
		args = append(args, class)
		sql += fmt.Sprintf(" AND santri_class = $%d", len(args))
	}
	if waktu != "" && waktu != "ALL" {
		args = append(args, waktu)
		sql += fmt.Sprintf(" AND waktu_sholat = $%d", len(args))
	}

	roleVal := c.Locals("role")
	role, _ := roleVal.(models.Role)
	if role == models.RoleOrtu {
		userIDVal := c.Locals("user_id")
		userID, _ := userIDVal.(string)
		santriID := strings.TrimPrefix(userID, "ortu-")
		args = append(args, santriID)
		sql += fmt.Sprintf(" AND (santri_id = $%d OR santri_id IN (SELECT id FROM santri WHERE id = $%d))", len(args), len(args))
	}

	sql += " ORDER BY created_at DESC LIMIT 2000"

	rows, err := pool.Query(ctx, sql, args...)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	var list []models.AbsensiRecord
	for rows.Next() {
		var a models.AbsensiRecord
		if err := rows.Scan(
			&a.ID, &a.SantriID, &a.SantriName, &a.SantriClass, &a.Gender,
			&a.GuruID, &a.GuruName, &a.WaktuSholat, &a.Date, &a.Status,
			&a.ScoreImpact, &a.Notes, &a.CreatedAt,
		); err == nil {
			list = append(list, a)
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"absensi": list,
	})
}

func CreateAbsensi(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		var payload models.BatchAbsensiPayload
		if err := c.BodyParser(&payload); err != nil {
			return utils.SendError(c, fiber.StatusBadRequest, "Payload absensi tidak valid")
		}

		if len(payload.Records) == 0 {
			return utils.SendError(c, fiber.StatusBadRequest, "Daftar santri absensi kosong")
		}

		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()

		tx, err := pool.Begin(ctx)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, "Gagal memulai transaksi database")
		}
		defer tx.Rollback(ctx)

		savedCount := 0
		nowStr := utils.NowWIB().Format("15:04 WIB")

		for _, rec := range payload.Records {
			var santriName string
			_ = tx.QueryRow(ctx, "SELECT name FROM santri WHERE id = $1", rec.SantriID).Scan(&santriName)
			if santriName == "" {
				santriName = "Santri"
			}

			id := fmt.Sprintf("abs-%d-%s", time.Now().UnixNano(), rec.SantriID)

			_, err := tx.Exec(ctx, `
				INSERT INTO absensi (
					id, santri_id, santri_name, santri_class, gender,
					guru_id, guru_name, waktu_sholat, date, status,
					score_impact, notes, created_at
				) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
				ON CONFLICT (id) DO NOTHING
			`, id, rec.SantriID, santriName, payload.Class, payload.Gender,
				payload.GuruID, payload.GuruName, payload.WaktuSholat, payload.Date,
				rec.Status, rec.ScoreImpact, rec.Notes)

			if err == nil {
				savedCount++
			}
		}

		if err := tx.Commit(ctx); err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, "Gagal menyimpan absensi")
		}

		wsEvent := map[string]interface{}{
			"channel":   "absensi:sholat",
			"action":    "batch_create",
			"count":     savedCount,
			"class":     payload.Class,
			"waktu":     payload.WaktuSholat,
			"date":      payload.Date,
			"time":      nowStr,
			"timestamp": time.Now().Format(time.RFC3339),
		}
		if eventBytes, err := json.Marshal(wsEvent); err == nil {
			h.BroadcastMessage(eventBytes)
		}

		return utils.SendSuccess(c, fiber.Map{"count": savedCount}, "Absensi berhasil disimpan")
	}
}

func UpdateAbsensi(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			ID     string  `json:"id"`
			Status string  `json:"status"`
			Notes  *string `json:"notes"`
		}
		if err := c.BodyParser(&req); err != nil || req.ID == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "ID absensi dibutuhkan")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		_, err := pool.Exec(ctx, `
			UPDATE absensi SET
				status = $1,
				notes = COALESCE($2, notes)
			WHERE id = $3
		`, req.Status, req.Notes, req.ID)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		wsEvent := map[string]interface{}{
			"channel":   "absensi:sholat",
			"action":    "update",
			"id":        req.ID,
			"status":    req.Status,
			"timestamp": time.Now().Format(time.RFC3339),
		}
		if eventBytes, err := json.Marshal(wsEvent); err == nil {
			h.BroadcastMessage(eventBytes)
		}

		return utils.SendSuccess(c, nil, "Absensi berhasil diperbarui")
	}
}

func DeleteAbsensi(c *fiber.Ctx) error {
	id := c.Query("id")
	idsStr := c.Query("ids")

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if idsStr != "" {
		ids := strings.Split(idsStr, ",")
		for _, singleID := range ids {
			trimmed := strings.TrimSpace(singleID)
			if trimmed != "" {
				_, _ = pool.Exec(ctx, "DELETE FROM absensi WHERE id = $1", trimmed)
			}
		}
		return utils.SendSuccess(c, nil, "Catatan absensi terpilih berhasil dihapus")
	}

	if id == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID absensi dibutuhkan")
	}

	_, err := pool.Exec(ctx, "DELETE FROM absensi WHERE id = $1", id)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Catatan absensi berhasil dihapus")
}
