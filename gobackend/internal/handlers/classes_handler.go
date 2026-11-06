package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/database"
	"gobackend/internal/models"
	"gobackend/internal/utils"
)

func GetClasses(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `
		SELECT 
			c.id, c.name, COALESCE(c.gender, 'Putra'),
			COALESCE(c.wali_kelas, ''), COALESCE(c.guru_id, ''),
			COALESCE(c.pendamping_wali, ''), COALESCE(c.pendamping_id, ''),
			COALESCE(c.asisten_wali, '[]'::jsonb),
			COUNT(s.id)::int, COALESCE(ROUND(AVG(s.current_score), 3), 70.000)
		FROM classes c
		LEFT JOIN santri s ON UPPER(s.class) = UPPER(c.name)
		GROUP BY c.id, c.name, c.gender, c.wali_kelas, c.guru_id, c.pendamping_wali, c.pendamping_id, c.asisten_wali
		ORDER BY c.name ASC
	`)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	var list []models.ClassInfo
	for rows.Next() {
		var cl models.ClassInfo
		var asistenRaw []byte
		if err := rows.Scan(
			&cl.ID, &cl.Name, &cl.Gender, &cl.WaliKelas, &cl.GuruID,
			&cl.PendampingWali, &cl.PendampingID, &asistenRaw,
			&cl.StudentCount, &cl.AvgScore,
		); err == nil {
			if len(asistenRaw) > 0 {
				_ = json.Unmarshal(asistenRaw, &cl.AsistenWali)
			}
			if cl.AsistenWali == nil {
				cl.AsistenWali = []string{}
			}
			list = append(list, cl)
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"classes": list,
	})
}

func CreateClass(c *fiber.Ctx) error {
	var req struct {
		Name           string   `json:"name"`
		Gender         string   `json:"gender"`
		WaliKelas      string   `json:"waliKelas"`
		GuruID         string   `json:"guruId"`
		PendampingWali string   `json:"pendampingWali"`
		PendampingID   string   `json:"pendampingId"`
		AsistenWali    []string `json:"asistenWali"`
	}
	if err := c.BodyParser(&req); err != nil || req.Name == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "Nama kelas wajib diisi")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	if req.Gender == "" {
		req.Gender = "Putra"
	}

	id := fmt.Sprintf("cls-%s-%d", req.Name, time.Now().Unix())

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	asistenJSON, _ := json.Marshal(req.AsistenWali)
	if len(req.AsistenWali) == 0 {
		asistenJSON = []byte("[]")
	}

	_, err := pool.Exec(ctx, `
		INSERT INTO classes (id, name, gender, wali_kelas, guru_id, pendamping_wali, pendamping_id, asisten_wali)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (name) DO UPDATE SET
			gender = EXCLUDED.gender,
			wali_kelas = EXCLUDED.wali_kelas,
			guru_id = EXCLUDED.guru_id,
			pendamping_wali = EXCLUDED.pendamping_wali,
			pendamping_id = EXCLUDED.pendamping_id,
			asisten_wali = EXCLUDED.asisten_wali
	`, id, req.Name, req.Gender, req.WaliKelas, req.GuruID, req.PendampingWali, req.PendampingID, asistenJSON)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Kelas berhasil ditambahkan")
}

func UpdateClass(c *fiber.Ctx) error {
	var req struct {
		Name           string    `json:"name"`
		NewName        string    `json:"newName"`
		Gender         string    `json:"gender"`
		WaliKelas      string    `json:"waliKelas"`
		GuruID         string    `json:"guruId"`
		PendampingWali string    `json:"pendampingWali"`
		PendampingID   string    `json:"pendampingId"`
		AsistenWali    *[]string `json:"asistenWali"`
	}
	if err := c.BodyParser(&req); err != nil || req.Name == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "Nama kelas asal wajib diisi")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	targetName := req.Name
	if req.NewName != "" {
		targetName = req.NewName
	}

	var asistenJSON []byte
	if req.AsistenWali != nil {
		asistenJSON, _ = json.Marshal(*req.AsistenWali)
	}

	_, err := pool.Exec(ctx, `
		UPDATE classes SET
			name = $1,
			gender = COALESCE(NULLIF($2, ''), gender),
			wali_kelas = COALESCE(NULLIF($3, ''), wali_kelas),
			guru_id = COALESCE(NULLIF($4, ''), guru_id),
			pendamping_wali = COALESCE(NULLIF($5, ''), pendamping_wali),
			pendamping_id = COALESCE(NULLIF($6, ''), pendamping_id),
			asisten_wali = CASE WHEN $7::jsonb IS NOT NULL THEN $7::jsonb ELSE asisten_wali END
		WHERE name = $8
	`, targetName, req.Gender, req.WaliKelas, req.GuruID, req.PendampingWali, req.PendampingID, asistenJSON, req.Name)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Kelas berhasil diperbarui")
}

func DeleteClass(c *fiber.Ctx) error {
	name := c.Query("name")
	var req struct {
		Names []string `json:"names"`
	}
	_ = c.BodyParser(&req)

	if name == "" && len(req.Names) == 0 {
		return utils.SendError(c, fiber.StatusBadRequest, "Nama kelas dibutuhkan")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if len(req.Names) > 0 {
		_, err := pool.Exec(ctx, "DELETE FROM classes WHERE name = ANY($1)", req.Names)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}
		return utils.SendSuccess(c, nil, "Kelas berhasil dihapus")
	}

	_, err := pool.Exec(ctx, "DELETE FROM classes WHERE name = $1", name)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Kelas berhasil dihapus")
}
