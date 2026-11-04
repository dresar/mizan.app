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

func GetPenilaian(c *fiber.Ctx) error {
	santriID := c.Query("santriId")

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	sql := `
		SELECT 
			id, santri_id, santri_name, santri_class, guru_id,
			guru_name, type, COALESCE(category, ''), unsur_name, indicator_text,
			tingkat, score, notes, proof_file_name, proof_file_size,
			to_char(created_at, 'YYYY-MM-DD HH24:MI:SS'), date_key,
			sanggahan_reason, sanggahan_at, sanggahan_decision
		FROM penilaian
		WHERE 1=1
	`
	var args []interface{}
	if santriID != "" {
		args = append(args, santriID)
		sql += fmt.Sprintf(" AND santri_id = $%d", len(args))
	}
	sql += " ORDER BY created_at DESC LIMIT 300"

	rows, err := pool.Query(ctx, sql, args...)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	var list []models.PenilaianRecord
	for rows.Next() {
		var p models.PenilaianRecord
		if err := rows.Scan(
			&p.ID, &p.SantriID, &p.SantriName, &p.SantriClass, &p.GuruID,
			&p.GuruName, &p.Type, &p.CategoryName, &p.UnsurName, &p.IndicatorText,
			&p.Tingkat, &p.Score, &p.Notes, &p.ProofFileName, &p.ProofFileSize,
			&p.CreatedAt, &p.DateKey, &p.SanggahanText, &p.SanggahanAt, &p.SanggahanState,
		); err == nil {
			list = append(list, p)
		}
	}

	return c.JSON(fiber.Map{
		"success":   true,
		"penilaian": list,
	})
}

func CreatePenilaian(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var p models.PenilaianRecord
		if err := c.BodyParser(&p); err != nil {
			return utils.SendError(c, fiber.StatusBadRequest, "Payload penilaian tidak valid")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if p.ID == "" {
			p.ID = fmt.Sprintf("pen-%d", time.Now().UnixNano())
		}
		if p.DateKey == "" {
			p.DateKey = utils.NowWIB().Format("2006-01-02")
		}

		var santriName, santriClass, gender string
		var currentScore float64
		err := pool.QueryRow(ctx, "SELECT name, class, gender, current_score FROM santri WHERE id = $1", p.SantriID).
			Scan(&santriName, &santriClass, &gender, &currentScore)
		if err == nil {
			p.SantriName = santriName
			p.SantriClass = santriClass
			p.Gender = gender
		}

		newScore := currentScore + p.Score
		if newScore < 0 {
			newScore = 0
		} else if newScore > 100 {
			newScore = 100
		}

		_, err = pool.Exec(ctx, `
			INSERT INTO penilaian (
				id, santri_id, santri_name, santri_class, santri_asrama,
				guru_id, guru_name, type, category, unsur_name,
				indicator_text, tingkat, score, notes, proof_file_name,
				proof_file_size, created_at, date_key
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),$17)
		`, p.ID, p.SantriID, p.SantriName, p.SantriClass, "Asrama Kampus Mahato",
			p.GuruID, p.GuruName, p.Type, p.CategoryName, p.UnsurName,
			p.IndicatorText, p.Tingkat, p.Score, p.Notes, p.ProofFileName,
			p.ProofFileSize, p.DateKey)

		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		_, _ = pool.Exec(ctx, "UPDATE santri SET current_score = $1 WHERE id = $2", newScore, p.SantriID)

		wsEvent := map[string]interface{}{
			"channel":     "penilaian:sikap",
			"action":      "create",
			"santriId":    p.SantriID,
			"santriName":  p.SantriName,
			"scoreImpact": p.Score,
			"newScore":    newScore,
			"type":        p.Type,
			"timestamp":   time.Now().Format(time.RFC3339),
		}
		if eventBytes, err := json.Marshal(wsEvent); err == nil {
			h.BroadcastMessage(eventBytes)
		}

		p.CreatedAt = utils.FormatWIBDateTime(utils.NowWIB())
		return utils.SendSuccess(c, p, "Penilaian berhasil dicatat")
	}
}

func DeletePenilaian(c *fiber.Ctx) error {
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
				_, _ = pool.Exec(ctx, "DELETE FROM penilaian WHERE id = $1", trimmed)
			}
		}
		return utils.SendSuccess(c, nil, "Penilaian terpilih berhasil dihapus")
	}

	if id == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID penilaian dibutuhkan")
	}

	_, err := pool.Exec(ctx, "DELETE FROM penilaian WHERE id = $1", id)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Penilaian berhasil dihapus")
}
