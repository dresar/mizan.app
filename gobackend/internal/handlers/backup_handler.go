package handlers

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/database"
	"gobackend/internal/utils"
)

func ExportBackup(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	santriRows, _ := pool.Query(ctx, "SELECT id, nis, name, gender, class, asrama, kamar, base_score, current_score, status, avatar FROM santri")
	var santriList []map[string]interface{}
	if santriRows != nil {
		defer santriRows.Close()
		for santriRows.Next() {
			var id, nis, name, gender, class, asrama, kamar, status, avatar string
			var baseScore, currentScore float64
			if err := santriRows.Scan(&id, &nis, &name, &gender, &class, &asrama, &kamar, &baseScore, &currentScore, &status, &avatar); err == nil {
				santriList = append(santriList, map[string]interface{}{
					"id": id, "nis": nis, "name": name, "gender": gender, "class": class,
					"asrama": asrama, "kamar": kamar, "baseScore": baseScore, "currentScore": currentScore,
					"status": status, "avatar": avatar,
				})
			}
		}
	}

	absRows, _ := pool.Query(ctx, "SELECT id, santri_id, guru_name, waktu_sholat, date, status, score_impact FROM absensi LIMIT 2000")
	var absList []map[string]interface{}
	if absRows != nil {
		defer absRows.Close()
		for absRows.Next() {
			var id, santriID, guruName, waktu, date, status string
			var score float64
			if err := absRows.Scan(&id, &santriID, &guruName, &waktu, &date, &status, &score); err == nil {
				absList = append(absList, map[string]interface{}{
					"id": id, "santriId": santriID, "guruName": guruName, "waktuSholat": waktu,
					"date": date, "status": status, "scoreImpact": score,
				})
			}
		}
	}

	return c.JSON(fiber.Map{
		"success":   true,
		"timestamp": utils.FormatWIBDateTime(utils.NowWIB()),
		"data": fiber.Map{
			"santri":  santriList,
			"absensi": absList,
		},
	})
}
