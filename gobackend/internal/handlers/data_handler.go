package handlers

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/database"
	"gobackend/internal/models"
	"gobackend/internal/utils"
)

func GetData(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	roleVal := c.Locals("role")
	role, _ := roleVal.(models.Role)
	userIDVal := c.Locals("user_id")
	userID, _ := userIDVal.(string)

	if role == "" {
		var settingsMap map[string]interface{}
		row := pool.QueryRow(ctx, `SELECT value FROM app_settings WHERE key = 'general' LIMIT 1`)
		var rawSettings []byte
		if err := row.Scan(&rawSettings); err == nil {
			_ = json.Unmarshal(rawSettings, &settingsMap)
		}

		return c.JSON(fiber.Map{
			"success":       true,
			"authenticated": false,
			"santri":        []models.Santri{},
			"users":         []models.UserProfile{},
			"classes":       []models.ClassInfo{},
			"guruList":      []models.GuruMonitoring{},
			"absensiList":   []models.AbsensiRecord{},
			"penilaianList": []models.PenilaianRecord{},
			"settings":      settingsMap,
		})
	}

	if role == models.RoleOrtu {
		santriID := strings.TrimPrefix(userID, "ortu-")
		usernameVal := c.Locals("username")
		username, _ := usernameVal.(string)

		santriRows, err := pool.Query(ctx, `
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
			WHERE id = $1 OR LOWER(nis) = LOWER($2)
			ORDER BY name ASC
		`, santriID, username)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}
		defer santriRows.Close()

		var santriList []models.Santri
		for santriRows.Next() {
			var s models.Santri
			if err := santriRows.Scan(
				&s.ID, &s.NIS, &s.Name, &s.Gender, &s.Class, &s.Asrama, &s.Kamar,
				&s.BaseScore, &s.CurrentScore, &s.Status, &s.Avatar,
				&s.WaliName, &s.WaliPhone, &s.TotalHadir, &s.TotalAlpa,
				&s.MusyrifID, &s.MusyrifName, &s.MusyrifPhone,
				&s.RiwayatAlergi, &s.RiwayatPenyakit,
				&s.DailyPocketLimit, &s.PocketBalance, &s.CurrentHealthStatus,
			); err == nil {
				santriList = append(santriList, s)
			}
		}

		absRows, _ := pool.Query(ctx, `
			SELECT 
				id, santri_id, santri_name, santri_class, gender, guru_id,
				guru_name, COALESCE(waktu_sholat, 'Subuh'), date, status, score_impact,
				notes, to_char(created_at, 'HH24:MI WIB')
			FROM absensi 
			WHERE santri_id = $1 OR santri_id IN (SELECT id FROM santri WHERE id = $1 OR LOWER(nis) = LOWER($2))
			ORDER BY created_at DESC LIMIT 2000
		`, santriID, username)
		var absList []models.AbsensiRecord
		if absRows != nil {
			defer absRows.Close()
			for absRows.Next() {
				var a models.AbsensiRecord
				if err := absRows.Scan(
					&a.ID, &a.SantriID, &a.SantriName, &a.SantriClass, &a.Gender,
					&a.GuruID, &a.GuruName, &a.WaktuSholat, &a.Date, &a.Status,
					&a.ScoreImpact, &a.Notes, &a.CreatedAt,
				); err == nil {
					absList = append(absList, a)
				}
			}
		}

		penRows, _ := pool.Query(ctx, `
			SELECT 
				id, santri_id, santri_name, santri_class, guru_id,
				guru_name, type, COALESCE(category, ''), unsur_name, indicator_text,
				tingkat, score, notes, proof_file_name, proof_file_size,
				to_char(created_at, 'YYYY-MM-DD HH24:MI:SS'), date_key
			FROM penilaian 
			WHERE santri_id = $1 OR santri_id IN (SELECT id FROM santri WHERE id = $1 OR LOWER(nis) = LOWER($2))
			ORDER BY created_at DESC LIMIT 300
		`, santriID, username)
		var penList []models.PenilaianRecord
		if penRows != nil {
			defer penRows.Close()
			for penRows.Next() {
				var p models.PenilaianRecord
				if err := penRows.Scan(
					&p.ID, &p.SantriID, &p.SantriName, &p.SantriClass, &p.GuruID,
					&p.GuruName, &p.Type, &p.CategoryName, &p.UnsurName, &p.IndicatorText,
					&p.Tingkat, &p.Score, &p.Notes, &p.ProofFileName, &p.ProofFileSize,
					&p.CreatedAt, &p.DateKey,
				); err == nil {
					penList = append(penList, p)
				}
			}
		}

		var settingsMap map[string]interface{}
		row := pool.QueryRow(ctx, `SELECT value FROM app_settings WHERE key = 'general' LIMIT 1`)
		var rawSettings []byte
		if err := row.Scan(&rawSettings); err == nil {
			_ = json.Unmarshal(rawSettings, &settingsMap)
		}

		return c.JSON(fiber.Map{
			"success":       true,
			"santri":        santriList,
			"users":         []models.UserProfile{},
			"classes":       []models.ClassInfo{},
			"guruList":      []models.GuruMonitoring{},
			"absensiList":   absList,
			"penilaianList": penList,
			"settings":      settingsMap,
		})
	}

	santriRows, err := pool.Query(ctx, `
		SELECT 
			id, nis, name, gender, class, asrama, kamar, 
			base_score, current_score, status, avatar,
			COALESCE(wali_name, ''), COALESCE(wali_phone, ''),
			COALESCE(total_hadir, 28), COALESCE(total_alpa, 0),
			COALESCE(musyrif_id, ''), COALESCE(musyrif_name, ''), COALESCE(musyrif_phone, ''),
			COALESCE(riwayat_alergi, ''), COALESCE(riwayat_penyakit, ''),
			COALESCE(daily_pocket_limit, 25000), COALESCE(pocket_balance, 0),
			COALESCE(current_health_status, 'Sehat')
		FROM santri ORDER BY name ASC
	`)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer santriRows.Close()

	var santriList []models.Santri
	for santriRows.Next() {
		var s models.Santri
		if err := santriRows.Scan(
			&s.ID, &s.NIS, &s.Name, &s.Gender, &s.Class, &s.Asrama, &s.Kamar,
			&s.BaseScore, &s.CurrentScore, &s.Status, &s.Avatar,
			&s.WaliName, &s.WaliPhone, &s.TotalHadir, &s.TotalAlpa,
			&s.MusyrifID, &s.MusyrifName, &s.MusyrifPhone,
			&s.RiwayatAlergi, &s.RiwayatPenyakit,
			&s.DailyPocketLimit, &s.PocketBalance, &s.CurrentHealthStatus,
		); err == nil {
			santriList = append(santriList, s)
		}
	}

	userRows, _ := pool.Query(ctx, `
		SELECT 
			id, username, name, role, COALESCE(role_title, ''), 
			COALESCE(avatar_initials, ''), COALESCE(avatar_url, ''), 
			gender, COALESCE(assigned_class, ''), is_active
		FROM users 
		WHERE is_active = true 
		ORDER BY name ASC
	`)
	var userList []models.UserProfile
	if userRows != nil {
		defer userRows.Close()
		for userRows.Next() {
			var u models.UserProfile
			if err := userRows.Scan(
				&u.ID, &u.Username, &u.Name, &u.Role, &u.RoleTitle,
				&u.AvatarInitials, &u.AvatarURL, &u.Gender, &u.AssignedClass, &u.IsActive,
			); err == nil {
				userList = append(userList, u)
			}
		}
	}

	classRows, _ := pool.Query(ctx, `
		SELECT 
			c.id, c.name, COALESCE(c.gender, 'Putra'),
			COALESCE(c.wali_kelas, ''), COALESCE(c.guru_id, ''),
			COUNT(s.id)::int, COALESCE(ROUND(AVG(s.current_score), 3), 70.000)
		FROM classes c
		LEFT JOIN santri s ON UPPER(s.class) = UPPER(c.name)
		GROUP BY c.id, c.name, c.gender, c.wali_kelas, c.guru_id
		ORDER BY c.name ASC
	`)
	var classList []models.ClassInfo
	if classRows != nil {
		defer classRows.Close()
		for classRows.Next() {
			var cl models.ClassInfo
			if err := classRows.Scan(
				&cl.ID, &cl.Name, &cl.Gender, &cl.WaliKelas, &cl.GuruID,
				&cl.StudentCount, &cl.AvgScore,
			); err == nil {
				classList = append(classList, cl)
			}
		}
	}

	guruRows, _ := pool.Query(ctx, `
		SELECT 
			COALESCE(u.id, gm.id), u.name, u.gender,
			COALESCE(gm.assigned_class, u.assigned_class, '1A'),
			COALESCE(gm.asrama, CASE WHEN u.gender = 'Putri' THEN 'Asrama Khadijah' ELSE 'Asrama Salman Al-Farisi' END),
			COALESCE(gm.last_login, 'Aktif'),
			COALESCE(gm.report_count_today, 0),
			COALESCE(gm.status, 'Belum Lapor')
		FROM users u
		LEFT JOIN guru_monitoring gm ON (gm.name = u.name OR gm.id = u.id OR gm.id = 'guru-' || u.id)
		WHERE u.role IN ('GURU', 'PENGASUHAN') AND u.is_active = true
		ORDER BY u.name ASC
	`)
	var guruList []models.GuruMonitoring
	if guruRows != nil {
		defer guruRows.Close()
		for guruRows.Next() {
			var g models.GuruMonitoring
			if err := guruRows.Scan(
				&g.ID, &g.Name, &g.Gender, &g.AssignedClass, &g.Asrama,
				&g.LastLogin, &g.ReportCountToday, &g.Status,
			); err == nil {
				guruList = append(guruList, g)
			}
		}
	}

	absRows, _ := pool.Query(ctx, `
		SELECT 
			id, santri_id, santri_name, santri_class, gender, guru_id,
			guru_name, COALESCE(waktu_sholat, 'Subuh'), date, status, score_impact,
			notes, to_char(created_at, 'HH24:MI WIB')
		FROM absensi ORDER BY created_at DESC LIMIT 2000
	`)
	var absList []models.AbsensiRecord
	if absRows != nil {
		defer absRows.Close()
		for absRows.Next() {
			var a models.AbsensiRecord
			if err := absRows.Scan(
				&a.ID, &a.SantriID, &a.SantriName, &a.SantriClass, &a.Gender,
				&a.GuruID, &a.GuruName, &a.WaktuSholat, &a.Date, &a.Status,
				&a.ScoreImpact, &a.Notes, &a.CreatedAt,
			); err == nil {
				absList = append(absList, a)
			}
		}
	}

	penRows, _ := pool.Query(ctx, `
		SELECT 
			id, santri_id, santri_name, santri_class, guru_id,
			guru_name, type, COALESCE(category, ''), unsur_name, indicator_text,
			tingkat, score, notes, proof_file_name, proof_file_size,
			to_char(created_at, 'YYYY-MM-DD HH24:MI:SS'), date_key
		FROM penilaian ORDER BY created_at DESC LIMIT 300
	`)
	var penList []models.PenilaianRecord
	if penRows != nil {
		defer penRows.Close()
		for penRows.Next() {
			var p models.PenilaianRecord
			if err := penRows.Scan(
				&p.ID, &p.SantriID, &p.SantriName, &p.SantriClass, &p.GuruID,
				&p.GuruName, &p.Type, &p.CategoryName, &p.UnsurName, &p.IndicatorText,
				&p.Tingkat, &p.Score, &p.Notes, &p.ProofFileName, &p.ProofFileSize,
				&p.CreatedAt, &p.DateKey,
			); err == nil {
				penList = append(penList, p)
			}
		}
	}

	var settingsMap map[string]interface{}
	row := pool.QueryRow(ctx, `SELECT value FROM app_settings WHERE key = 'general' LIMIT 1`)
	var rawSettings []byte
	if err := row.Scan(&rawSettings); err == nil {
		_ = json.Unmarshal(rawSettings, &settingsMap)
	}

	var kelasListStrings []string
	for _, c := range classList {
		kelasListStrings = append(kelasListStrings, c.Name)
	}

	type rawUnsur struct {
		id, catName, name, uType string
	}
	var allUnsurs []rawUnsur
	unsurRows, _ := pool.Query(ctx, "SELECT id, category_name, name, COALESCE(type, 'HASANAH') FROM unsurs ORDER BY id ASC")
	if unsurRows != nil {
		defer unsurRows.Close()
		for unsurRows.Next() {
			var u rawUnsur
			if err := unsurRows.Scan(&u.id, &u.catName, &u.name, &u.uType); err == nil {
				allUnsurs = append(allUnsurs, u)
			}
		}
	}

	type rawInd struct {
		id, unsurID, text, iType, tingkat string
		score                             float64
	}
	var allInds []rawInd
	indRows, _ := pool.Query(ctx, "SELECT id, unsur_id, text, type, default_score, tingkat FROM indicators ORDER BY id ASC")
	if indRows != nil {
		defer indRows.Close()
		for indRows.Next() {
			var i rawInd
			if err := indRows.Scan(&i.id, &i.unsurID, &i.text, &i.iType, &i.score, &i.tingkat); err == nil {
				allInds = append(allInds, i)
			}
		}
	}

	var categoriesList []models.Kategori
	catRows, _ := pool.Query(ctx, "SELECT id, code, name FROM categories ORDER BY code ASC")
	if catRows != nil {
		defer catRows.Close()
		for catRows.Next() {
			var cat models.Kategori
			if err := catRows.Scan(&cat.ID, &cat.Code, &cat.Name); err == nil {
				for _, u := range allUnsurs {
					if u.catName == cat.Name {
						unsur := models.Unsur{
							ID:   u.id,
							Name: u.name,
							Type: u.uType,
						}
						for _, ind := range allInds {
							if ind.unsurID == u.id {
								unsur.Indicators = append(unsur.Indicators, models.Indikator{
									ID:           ind.id,
									Text:         ind.text,
									Type:         ind.iType,
									DefaultScore: ind.score,
									Tingkat:      ind.tingkat,
								})
							}
						}
						cat.Unsurs = append(cat.Unsurs, unsur)
					}
				}
				categoriesList = append(categoriesList, cat)
			}
		}
	}

	return c.JSON(fiber.Map{
		"success":       true,
		"santri":        santriList,
		"users":         userList,
		"classes":       classList,
		"classList":     classList,
		"kelasList":     kelasListStrings,
		"guruList":      guruList,
		"absensiList":   absList,
		"penilaianList": penList,
		"categories":    categoriesList,
		"settings":      settingsMap,
	})
}
