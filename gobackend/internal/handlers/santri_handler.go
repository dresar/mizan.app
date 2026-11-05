package handlers

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/database"
	"gobackend/internal/models"
	"gobackend/internal/utils"
)

func GetSantri(c *fiber.Ctx) error {
	gender := c.Query("gender")
	className := c.Query("class")

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	sql := `
		SELECT 
			id, nis, name, gender, class, asrama, kamar, 
			base_score, current_score, status, avatar,
			COALESCE(wali_name, ''), COALESCE(wali_phone, ''),
			COALESCE(total_hadir, 28), COALESCE(total_alpa, 0),
			COALESCE(musyrif_id, ''), COALESCE(musyrif_name, ''), COALESCE(musyrif_phone, ''),
			COALESCE(riwayat_alergi, ''), COALESCE(riwayat_penyakit, ''),
			COALESCE(daily_pocket_limit, 25000), COALESCE(pocket_balance, 0),
			COALESCE(current_health_status, 'Sehat')
		FROM santri
		WHERE 1=1
	`
	var args []interface{}

	if gender != "" && gender != "ALL" {
		args = append(args, gender)
		sql += fmt.Sprintf(" AND gender = $%d", len(args))
	}

	if className != "" && className != "ALL" {
		args = append(args, className)
		sql += fmt.Sprintf(" AND class = $%d", len(args))
	}

	roleVal := c.Locals("role")
	role, _ := roleVal.(models.Role)
	if role == models.RoleOrtu {
		userIDVal := c.Locals("user_id")
		userID, _ := userIDVal.(string)
		santriID := strings.TrimPrefix(userID, "ortu-")
		usernameVal := c.Locals("username")
		username, _ := usernameVal.(string)
		args = append(args, santriID, username)
		sql += fmt.Sprintf(" AND (id = $%d OR LOWER(nis) = LOWER($%d))", len(args)-1, len(args))
	}

	sql += " ORDER BY name ASC"

	rows, err := pool.Query(ctx, sql, args...)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	var list []models.Santri
	for rows.Next() {
		var s models.Santri
		if err := rows.Scan(
			&s.ID, &s.NIS, &s.Name, &s.Gender, &s.Class, &s.Asrama, &s.Kamar,
			&s.BaseScore, &s.CurrentScore, &s.Status, &s.Avatar,
			&s.WaliName, &s.WaliPhone, &s.TotalHadir, &s.TotalAlpa,
			&s.MusyrifID, &s.MusyrifName, &s.MusyrifPhone,
			&s.RiwayatAlergi, &s.RiwayatPenyakit,
			&s.DailyPocketLimit, &s.PocketBalance, &s.CurrentHealthStatus,
		); err == nil {
			list = append(list, s)
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"santri":  list,
	})
}

func CreateSantri(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	var rawPayload []models.Santri
	if err := c.BodyParser(&rawPayload); err == nil && len(rawPayload) > 0 {
		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()

		count := 0
		for _, s := range rawPayload {
			if s.ID == "" {
				s.ID = "santri-" + s.NIS
			}
			avatar := "SN"
			if len(s.Name) > 1 {
				avatar = strings.ToUpper(s.Name[:2])
			}
			if s.BaseScore == 0 {
				s.BaseScore = 70.0
			}
			if s.CurrentScore == 0 {
				s.CurrentScore = 70.0
			}
			if s.Status == "" {
				s.Status = "Aman"
			}

			_, err := pool.Exec(ctx, `
				INSERT INTO santri (
					id, nis, name, gender, class, asrama, kamar,
					base_score, current_score, status, avatar,
					wali_name, wali_phone
				) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
				ON CONFLICT (id) DO UPDATE SET
					name = EXCLUDED.name,
					gender = EXCLUDED.gender,
					class = EXCLUDED.class,
					asrama = EXCLUDED.asrama,
					kamar = EXCLUDED.kamar
			`, s.ID, s.NIS, s.Name, s.Gender, s.Class, s.Asrama, s.Kamar,
				s.BaseScore, s.CurrentScore, s.Status, avatar,
				s.WaliName, s.WaliPhone)
			if err == nil {
				count++
			}
		}

		return utils.SendSuccess(c, fiber.Map{"count": count}, fmt.Sprintf("Berhasil menambahkan %d santri", count))
	}

	var s models.Santri
	if err := c.BodyParser(&s); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Format payload tidak valid")
	}

	if s.ID == "" {
		s.ID = "santri-" + s.NIS
	}
	avatar := "SN"
	if len(s.Name) > 1 {
		avatar = strings.ToUpper(s.Name[:2])
	}
	if s.BaseScore == 0 {
		s.BaseScore = 70.0
	}
	if s.CurrentScore == 0 {
		s.CurrentScore = 70.0
	}
	if s.Status == "" {
		s.Status = "Aman"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, `
		INSERT INTO santri (
			id, nis, name, gender, class, asrama, kamar,
			base_score, current_score, status, avatar,
			wali_name, wali_phone
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
	`, s.ID, s.NIS, s.Name, s.Gender, s.Class, s.Asrama, s.Kamar,
		s.BaseScore, s.CurrentScore, s.Status, avatar,
		s.WaliName, s.WaliPhone)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, s, "Data santri berhasil ditambahkan")
}

func UpdateSantri(c *fiber.Ctx) error {
	var s models.Santri
	if err := c.BodyParser(&s); err != nil || s.ID == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID Santri dibutuhkan")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, `
		UPDATE santri SET
			name = COALESCE(NULLIF($1, ''), name),
			gender = COALESCE(NULLIF($2, ''), gender),
			class = COALESCE(NULLIF($3, ''), class),
			asrama = COALESCE(NULLIF($4, ''), asrama),
			kamar = COALESCE(NULLIF($5, ''), kamar),
			current_score = CASE WHEN $6 > 0 THEN $6 ELSE current_score END,
			status = COALESCE(NULLIF($7, ''), status),
			wali_name = COALESCE(NULLIF($8, ''), wali_name),
			wali_phone = COALESCE(NULLIF($9, ''), wali_phone),
			musyrif_id = COALESCE(NULLIF($10, ''), musyrif_id),
			musyrif_name = COALESCE(NULLIF($11, ''), musyrif_name),
			musyrif_phone = COALESCE(NULLIF($12, ''), musyrif_phone),
			riwayat_alergi = COALESCE(NULLIF($13, ''), riwayat_alergi),
			riwayat_penyakit = COALESCE(NULLIF($14, ''), riwayat_penyakit),
			daily_pocket_limit = CASE WHEN $15 > 0 THEN $15 ELSE daily_pocket_limit END,
			pocket_balance = CASE WHEN $16 >= 0 THEN $16 ELSE pocket_balance END,
			current_health_status = COALESCE(NULLIF($17, ''), current_health_status)
		WHERE id = $18
	`, s.Name, s.Gender, s.Class, s.Asrama, s.Kamar, s.CurrentScore, s.Status, s.WaliName, s.WaliPhone,
		s.MusyrifID, s.MusyrifName, s.MusyrifPhone, s.RiwayatAlergi, s.RiwayatPenyakit,
		s.DailyPocketLimit, s.PocketBalance, s.CurrentHealthStatus, s.ID)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Data santri berhasil diperbarui")
}

func DeleteSantri(c *fiber.Ctx) error {
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
				_, _ = pool.Exec(ctx, "DELETE FROM santri WHERE id = $1", trimmed)
			}
		}
		return utils.SendSuccess(c, nil, "Santri terpilih berhasil dihapus")
	}

	if id == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID Santri dibutuhkan")
	}

	_, err := pool.Exec(ctx, "DELETE FROM santri WHERE id = $1", id)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Santri berhasil dihapus")
}
