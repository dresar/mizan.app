package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
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

func randomToken(prefix string) string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%s-%d-%s", prefix, time.Now().Unix(), hex.EncodeToString(b))
}

func GetTahfidz(c *fiber.Ctx) error {
	santriID := c.Query("santriId")
	gender := c.Query("gender")

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	sql := `
		SELECT 
			id, santri_id, santri_name, gender, surah_name,
			ayat_start, ayat_end, halaman, juz, predikat,
			target_juz, realisasi_juz, COALESCE(catatan_ustadz, ''),
			COALESCE(ustadz_id, ''), COALESCE(ustadz_name, ''),
			date, to_char(created_at, 'YYYY-MM-DD HH24:MI')
		FROM tahfidz_records
		WHERE 1=1
	`
	var args []interface{}

	if santriID != "" {
		args = append(args, santriID)
		sql += fmt.Sprintf(" AND santri_id = $%d", len(args))
	}
	if gender != "" && gender != "ALL" {
		args = append(args, gender)
		sql += fmt.Sprintf(" AND gender = $%d", len(args))
	}

	roleVal := c.Locals("role")
	role, _ := roleVal.(models.Role)
	if role == models.RoleOrtu {
		userIDVal := c.Locals("user_id")
		userID, _ := userIDVal.(string)
		childID := strings.TrimPrefix(userID, "ortu-")
		args = append(args, childID)
		sql += fmt.Sprintf(" AND (santri_id = $%d OR santri_id IN (SELECT id FROM santri WHERE id = $%d OR LOWER(nis) = LOWER($%d)))", len(args), len(args), len(args))
	}

	sql += " ORDER BY created_at DESC LIMIT 500"

	rows, err := pool.Query(ctx, sql, args...)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	var list []models.TahfidzRecord
	for rows.Next() {
		var t models.TahfidzRecord
		if err := rows.Scan(
			&t.ID, &t.SantriID, &t.SantriName, &t.Gender, &t.SurahName,
			&t.AyatStart, &t.AyatEnd, &t.Halaman, &t.Juz, &t.Predikat,
			&t.TargetJuz, &t.RealisasiJuz, &t.CatatanUstadz,
			&t.UstadzID, &t.UstadzName, &t.Date, &t.CreatedAt,
		); err == nil {
			list = append(list, t)
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"tahfidz": list,
	})
}

func CreateTahfidz(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var t models.TahfidzRecord
		if err := c.BodyParser(&t); err != nil {
			return utils.SendError(c, fiber.StatusBadRequest, "Payload tahfidz tidak valid")
		}

		if t.SantriID == "" || t.SurahName == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "Data santri dan surat wajib diisi")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		if t.ID == "" {
			t.ID = randomToken("thf")
		}
		if t.Date == "" {
			t.Date = time.Now().Format("2006-01-02")
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		_, err := pool.Exec(ctx, `
			INSERT INTO tahfidz_records (
				id, santri_id, santri_name, gender, surah_name,
				ayat_start, ayat_end, halaman, juz, predikat,
				target_juz, realisasi_juz, catatan_ustadz,
				ustadz_id, ustadz_name, date
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
		`, t.ID, t.SantriID, t.SantriName, t.Gender, t.SurahName,
			t.AyatStart, t.AyatEnd, t.Halaman, t.Juz, t.Predikat,
			t.TargetJuz, t.RealisasiJuz, t.CatatanUstadz,
			t.UstadzID, t.UstadzName, t.Date)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		if h != nil {
			payload, _ := json.Marshal(fiber.Map{
				"channel": "tahfidz",
				"action":  "created",
				"data":    t,
			})
			h.BroadcastMessage(payload)
		}

		return utils.SendSuccess(c, t, "Setoran tahfidz berhasil dicatat")
	}
}

func DeleteTahfidz(c *fiber.Ctx) error {
	id := c.Query("id")
	idsStr := c.Query("ids")
	var req struct {
		IDs []string `json:"ids"`
	}
	_ = c.BodyParser(&req)

	var targetIDs []string
	if len(req.IDs) > 0 {
		targetIDs = req.IDs
	} else if idsStr != "" {
		for _, part := range strings.Split(idsStr, ",") {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				targetIDs = append(targetIDs, trimmed)
			}
		}
	} else if id != "" {
		targetIDs = []string{id}
	}

	if len(targetIDs) == 0 {
		return utils.SendError(c, fiber.StatusBadRequest, "ID Tahfidz dibutuhkan")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if len(targetIDs) == 1 {
		_, err := pool.Exec(ctx, "DELETE FROM tahfidz_records WHERE id = $1", targetIDs[0])
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}
	} else {
		_, err := pool.Exec(ctx, "DELETE FROM tahfidz_records WHERE id = ANY($1)", targetIDs)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}
	}

	return utils.SendSuccess(c, nil, "Catatan tahfidz berhasil dihapus")
}

func GetKesehatan(c *fiber.Ctx) error {
	santriID := c.Query("santriId")
	gender := c.Query("gender")

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	sql := `
		SELECT 
			id, santri_id, santri_name, gender, tanggal,
			keluhan, diagnosa, tindakan_obat, status_rawat,
			petugas_nama, COALESCE(catatan, ''), to_char(created_at, 'YYYY-MM-DD HH24:MI')
		FROM kesehatan_records
		WHERE 1=1
	`
	var args []interface{}

	if santriID != "" {
		args = append(args, santriID)
		sql += fmt.Sprintf(" AND santri_id = $%d", len(args))
	}
	if gender != "" && gender != "ALL" {
		args = append(args, gender)
		sql += fmt.Sprintf(" AND gender = $%d", len(args))
	}

	roleVal := c.Locals("role")
	role, _ := roleVal.(models.Role)
	if role == models.RoleOrtu {
		userIDVal := c.Locals("user_id")
		userID, _ := userIDVal.(string)
		childID := strings.TrimPrefix(userID, "ortu-")
		args = append(args, childID)
		sql += fmt.Sprintf(" AND (santri_id = $%d OR santri_id IN (SELECT id FROM santri WHERE id = $%d OR LOWER(nis) = LOWER($%d)))", len(args), len(args), len(args))
	}

	sql += " ORDER BY created_at DESC LIMIT 500"

	rows, err := pool.Query(ctx, sql, args...)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	var list []models.KesehatanRecord
	for rows.Next() {
		var k models.KesehatanRecord
		if err := rows.Scan(
			&k.ID, &k.SantriID, &k.SantriName, &k.Gender, &k.Tanggal,
			&k.Keluhan, &k.Diagnosa, &k.TindakanObat, &k.StatusRawat,
			&k.PetugasNama, &k.Catatan, &k.CreatedAt,
		); err == nil {
			list = append(list, k)
		}
	}

	return c.JSON(fiber.Map{
		"success":   true,
		"kesehatan": list,
	})
}

func CreateKesehatan(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var k models.KesehatanRecord
		if err := c.BodyParser(&k); err != nil {
			return utils.SendError(c, fiber.StatusBadRequest, "Payload kesehatan tidak valid")
		}

		if k.SantriID == "" || k.Keluhan == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "Data santri dan keluhan wajib diisi")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		if k.ID == "" {
			k.ID = randomToken("med")
		}
		if k.Tanggal == "" {
			k.Tanggal = time.Now().Format("2006-01-02")
		}
		if k.StatusRawat == "" {
			k.StatusRawat = "Rawat Jalan"
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		_, err := pool.Exec(ctx, `
			INSERT INTO kesehatan_records (
				id, santri_id, santri_name, gender, tanggal,
				keluhan, diagnosa, tindakan_obat, status_rawat,
				petugas_nama, catatan
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
		`, k.ID, k.SantriID, k.SantriName, k.Gender, k.Tanggal,
			k.Keluhan, k.Diagnosa, k.TindakanObat, k.StatusRawat,
			k.PetugasNama, k.Catatan)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		_, _ = pool.Exec(ctx, `
			UPDATE santri SET current_health_status = $1 WHERE id = $2
		`, k.StatusRawat, k.SantriID)

		if h != nil {
			payload, _ := json.Marshal(fiber.Map{
				"channel": "kesehatan",
				"action":  "created",
				"data":    k,
			})
			h.BroadcastMessage(payload)
		}

		return utils.SendSuccess(c, k, "Catatan poskestren berhasil disimpan")
	}
}

func DeleteKesehatan(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID Rekam Medis dibutuhkan")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, "DELETE FROM kesehatan_records WHERE id = $1", id)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Catatan poskestren berhasil dihapus")
}

func GetPerizinan(c *fiber.Ctx) error {
	santriID := c.Query("santriId")
	status := c.Query("status")
	token := c.Query("token")

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	sql := `
		SELECT 
			id, santri_id, santri_name, santri_class, gender,
			jenis_izin, alasan, tgl_keluar, tgl_kembali, status,
			diajukan_oleh, COALESCE(disetujui_oleh, ''), qr_code_token,
			COALESCE(bukti_surat_url, ''),
			to_char(waktu_keluar_riil, 'YYYY-MM-DD HH24:MI'),
			to_char(waktu_kembali_riil, 'YYYY-MM-DD HH24:MI'),
			COALESCE(petugas_gerbang, ''),
			to_char(created_at, 'YYYY-MM-DD HH24:MI')
		FROM perizinan_records
		WHERE 1=1
	`
	var args []interface{}

	if token != "" {
		args = append(args, token)
		sql += fmt.Sprintf(" AND qr_code_token = $%d", len(args))
	}
	if santriID != "" {
		args = append(args, santriID)
		sql += fmt.Sprintf(" AND santri_id = $%d", len(args))
	}
	if status != "" && status != "ALL" {
		args = append(args, status)
		sql += fmt.Sprintf(" AND status = $%d", len(args))
	}

	roleVal := c.Locals("role")
	role, _ := roleVal.(models.Role)
	if role == models.RoleOrtu {
		userIDVal := c.Locals("user_id")
		userID, _ := userIDVal.(string)
		childID := strings.TrimPrefix(userID, "ortu-")
		args = append(args, childID)
		sql += fmt.Sprintf(" AND (santri_id = $%d OR santri_id IN (SELECT id FROM santri WHERE id = $%d OR LOWER(nis) = LOWER($%d)))", len(args), len(args), len(args))
	}

	sql += " ORDER BY created_at DESC LIMIT 500"

	rows, err := pool.Query(ctx, sql, args...)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	var list []models.PerizinanRecord
	for rows.Next() {
		var p models.PerizinanRecord
		var wKeluar, wKembali *string
		if err := rows.Scan(
			&p.ID, &p.SantriID, &p.SantriName, &p.SantriClass, &p.Gender,
			&p.JenisIzin, &p.Alasan, &p.TglKeluar, &p.TglKembali, &p.Status,
			&p.DiajukanOleh, &p.DisetujuiOleh, &p.QRCodeToken,
			&p.BuktiSuratURL, &wKeluar, &wKembali,
			&p.PetugasGerbang, &p.CreatedAt,
		); err == nil {
			p.WaktuKeluarRiil = wKeluar
			p.WaktuKembaliRiil = wKembali
			list = append(list, p)
		}
	}

	return c.JSON(fiber.Map{
		"success":   true,
		"perizinan": list,
	})
}

func CreatePerizinan(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var p models.PerizinanRecord
		if err := c.BodyParser(&p); err != nil {
			return utils.SendError(c, fiber.StatusBadRequest, "Payload perizinan tidak valid")
		}

		if p.SantriID == "" || p.JenisIzin == "" || p.TglKeluar == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "Data santri, jenis izin, dan tanggal wajib diisi")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		if p.ID == "" {
			p.ID = randomToken("izn")
		}
		if p.QRCodeToken == "" {
			p.QRCodeToken = randomToken("QR")
		}

		roleVal := c.Locals("role")
		role, _ := roleVal.(models.Role)
		if role == models.RoleOrtu {
			p.Status = "MENUNGGU"
		} else if p.Status == "" {
			p.Status = "DISETUJUI"
			usernameVal := c.Locals("username")
			p.DisetujuiOleh, _ = usernameVal.(string)
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		_, err := pool.Exec(ctx, `
			INSERT INTO perizinan_records (
				id, santri_id, santri_name, santri_class, gender,
				jenis_izin, alasan, tgl_keluar, tgl_kembali, status,
				diajukan_oleh, disetujui_oleh, qr_code_token, bukti_surat_url
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
		`, p.ID, p.SantriID, p.SantriName, p.SantriClass, p.Gender,
			p.JenisIzin, p.Alasan, p.TglKeluar, p.TglKembali, p.Status,
			p.DiajukanOleh, p.DisetujuiOleh, p.QRCodeToken, p.BuktiSuratURL)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		if h != nil {
			payload, _ := json.Marshal(fiber.Map{
				"channel": "perizinan",
				"action":  "created",
				"data":    p,
			})
			h.BroadcastMessage(payload)
		}

		return utils.SendSuccess(c, p, "Permohonan izin berhasil diajukan")
	}
}

func ApprovePerizinan(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		type Req struct {
			ID     string `json:"id"`
			Status string `json:"status"`
		}
		var r Req
		if err := c.BodyParser(&r); err != nil || r.ID == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "ID perizinan dibutuhkan")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		usernameVal := c.Locals("username")
		approvedBy, _ := usernameVal.(string)
		if r.Status == "" {
			r.Status = "DISETUJUI"
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		_, err := pool.Exec(ctx, `
			UPDATE perizinan_records SET
				status = $1,
				disetujui_oleh = $2
			WHERE id = $3
		`, r.Status, approvedBy, r.ID)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		if h != nil {
			payload, _ := json.Marshal(fiber.Map{
				"channel": "perizinan",
				"action":  "status_updated",
				"data":    fiber.Map{"id": r.ID, "status": r.Status, "approvedBy": approvedBy},
			})
			h.BroadcastMessage(payload)
		}

		return utils.SendSuccess(c, nil, "Status perizinan berhasil diperbarui")
	}
}

func VerifyPerizinanQR(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req models.VerifyPassRequest
		if err := c.BodyParser(&req); err != nil || req.Token == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "Token QR Code dibutuhkan")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		var p models.PerizinanRecord
		var wKeluar, wKembali *string
		err := pool.QueryRow(ctx, `
			SELECT 
				id, santri_id, santri_name, santri_class, gender,
				jenis_izin, alasan, tgl_keluar, tgl_kembali, status,
				diajukan_oleh, COALESCE(disetujui_oleh, ''), qr_code_token,
				COALESCE(bukti_surat_url, ''),
				to_char(waktu_keluar_riil, 'YYYY-MM-DD HH24:MI'),
				to_char(waktu_kembali_riil, 'YYYY-MM-DD HH24:MI'),
				COALESCE(petugas_gerbang, ''),
				to_char(created_at, 'YYYY-MM-DD HH24:MI')
			FROM perizinan_records
			WHERE qr_code_token = $1
		`, req.Token).Scan(
			&p.ID, &p.SantriID, &p.SantriName, &p.SantriClass, &p.Gender,
			&p.JenisIzin, &p.Alasan, &p.TglKeluar, &p.TglKembali, &p.Status,
			&p.DiajukanOleh, &p.DisetujuiOleh, &p.QRCodeToken,
			&p.BuktiSuratURL, &wKeluar, &wKembali,
			&p.PetugasGerbang, &p.CreatedAt,
		)
		if err != nil {
			return utils.SendError(c, fiber.StatusNotFound, "Kartu izin tidak ditemukan atau QR Code tidak valid")
		}
		p.WaktuKeluarRiil = wKeluar
		p.WaktuKembaliRiil = wKembali

		usernameVal := c.Locals("username")
		officerName, _ := usernameVal.(string)

		if req.Action == "KELUAR" {
			if strings.ToUpper(p.Status) != "DISETUJUI" {
				return utils.SendError(c, fiber.StatusBadRequest, fmt.Sprintf("Izin belum disetujui (Status: %s)", p.Status))
			}
			nowStr := time.Now().Format("2006-01-02 15:04")
			_, _ = pool.Exec(ctx, `
				UPDATE perizinan_records SET
					waktu_keluar_riil = NOW(),
					status = 'BERJALAN',
					petugas_gerbang = $1
				WHERE id = $2
			`, officerName, p.ID)
			p.Status = "BERJALAN"
			p.WaktuKeluarRiil = &nowStr
			p.PetugasGerbang = officerName
		} else if req.Action == "KEMBALI" {
			nowStr := time.Now().Format("2006-01-02 15:04")
			_, _ = pool.Exec(ctx, `
				UPDATE perizinan_records SET
					waktu_kembali_riil = NOW(),
					status = 'SELESAI',
					petugas_gerbang = $1
				WHERE id = $2
			`, officerName, p.ID)
			p.Status = "SELESAI"
			p.WaktuKembaliRiil = &nowStr
			p.PetugasGerbang = officerName
		}

		if h != nil {
			payload, _ := json.Marshal(fiber.Map{
				"channel": "perizinan",
				"action":  "gate_verified",
				"data":    p,
			})
			h.BroadcastMessage(payload)
		}

		return utils.SendSuccess(c, p, "Verifikasi izin gerbang berhasil")
	}
}

func GetSambangan(c *fiber.Ctx) error {
	santriID := c.Query("santriId")

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	sql := `
		SELECT 
			id, santri_id, santri_name, gender, wali_name,
			tanggal_sambang, sesi_waktu, jumlah_pengunjung, status,
			COALESCE(catatan, ''), to_char(created_at, 'YYYY-MM-DD HH24:MI')
		FROM sambangan_records
		WHERE 1=1
	`
	var args []interface{}

	if santriID != "" {
		args = append(args, santriID)
		sql += fmt.Sprintf(" AND santri_id = $%d", len(args))
	}

	roleVal := c.Locals("role")
	role, _ := roleVal.(models.Role)
	if role == models.RoleOrtu {
		userIDVal := c.Locals("user_id")
		userID, _ := userIDVal.(string)
		childID := strings.TrimPrefix(userID, "ortu-")
		args = append(args, childID)
		sql += fmt.Sprintf(" AND (santri_id = $%d OR santri_id IN (SELECT id FROM santri WHERE id = $%d OR LOWER(nis) = LOWER($%d)))", len(args), len(args), len(args))
	}

	sql += " ORDER BY tanggal_sambang ASC, created_at DESC LIMIT 500"

	rows, err := pool.Query(ctx, sql, args...)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	var list []models.SambanganRecord
	for rows.Next() {
		var s models.SambanganRecord
		if err := rows.Scan(
			&s.ID, &s.SantriID, &s.SantriName, &s.Gender, &s.WaliName,
			&s.TanggalSambang, &s.SesiWaktu, &s.JumlahPengunjung, &s.Status,
			&s.Catatan, &s.CreatedAt,
		); err == nil {
			list = append(list, s)
		}
	}

	return c.JSON(fiber.Map{
		"success":   true,
		"sambangan": list,
	})
}

func CreateSambangan(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var s models.SambanganRecord
		if err := c.BodyParser(&s); err != nil {
			return utils.SendError(c, fiber.StatusBadRequest, "Payload sambangan tidak valid")
		}

		if s.SantriID == "" || s.TanggalSambang == "" || s.SesiWaktu == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "Data santri, tanggal, dan sesi wajib diisi")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		if s.ID == "" {
			s.ID = randomToken("smb")
		}
		if s.Status == "" {
			s.Status = "TERKONFIRMASI"
		}
		if s.JumlahPengunjung <= 0 {
			s.JumlahPengunjung = 2
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		_, err := pool.Exec(ctx, `
			INSERT INTO sambangan_records (
				id, santri_id, santri_name, gender, wali_name,
				tanggal_sambang, sesi_waktu, jumlah_pengunjung, status, catatan
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		`, s.ID, s.SantriID, s.SantriName, s.Gender, s.WaliName,
			s.TanggalSambang, s.SesiWaktu, s.JumlahPengunjung, s.Status, s.Catatan)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		if h != nil {
			payload, _ := json.Marshal(fiber.Map{
				"channel": "sambangan",
				"action":  "created",
				"data":    s,
			})
			h.BroadcastMessage(payload)
		}

		return utils.SendSuccess(c, s, "Reservasi sambangan berhasil dijadwalkan")
	}
}

func GetCatatanMusyrif(c *fiber.Ctx) error {
	santriID := c.Query("santriId")

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	sql := `
		SELECT 
			id, santri_id, santri_name, gender, musyrif_id,
			musyrif_name, periode, adab_sosial_skor, kemandirian_skor,
			kebersihan_kamar_skor, catatan_perkembangan,
			COALESCE(rekomendasi_untuk_wali, ''),
			to_char(created_at, 'YYYY-MM-DD HH24:MI')
		FROM catatan_musyrif
		WHERE 1=1
	`
	var args []interface{}

	if santriID != "" {
		args = append(args, santriID)
		sql += fmt.Sprintf(" AND santri_id = $%d", len(args))
	}

	roleVal := c.Locals("role")
	role, _ := roleVal.(models.Role)
	if role == models.RoleOrtu {
		userIDVal := c.Locals("user_id")
		userID, _ := userIDVal.(string)
		childID := strings.TrimPrefix(userID, "ortu-")
		args = append(args, childID)
		sql += fmt.Sprintf(" AND (santri_id = $%d OR santri_id IN (SELECT id FROM santri WHERE id = $%d OR LOWER(nis) = LOWER($%d)))", len(args), len(args), len(args))
	}

	sql += " ORDER BY created_at DESC LIMIT 200"

	rows, err := pool.Query(ctx, sql, args...)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	var list []models.CatatanMusyrif
	for rows.Next() {
		var m models.CatatanMusyrif
		if err := rows.Scan(
			&m.ID, &m.SantriID, &m.SantriName, &m.Gender, &m.MusyrifID,
			&m.MusyrifName, &m.Periode, &m.AdabSosialSkor, &m.KemandirianSkor,
			&m.KebersihanKamarSkor, &m.CatatanPerkembangan,
			&m.RekomendasiUntukWali, &m.CreatedAt,
		); err == nil {
			list = append(list, m)
		}
	}

	return c.JSON(fiber.Map{
		"success":        true,
		"catatanMusyrif": list,
	})
}

func CreateCatatanMusyrif(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var m models.CatatanMusyrif
		if err := c.BodyParser(&m); err != nil {
			return utils.SendError(c, fiber.StatusBadRequest, "Payload catatan musyrif tidak valid")
		}

		if m.SantriID == "" || m.CatatanPerkembangan == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "Data santri dan catatan perkembangan wajib diisi")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		if m.ID == "" {
			m.ID = randomToken("not")
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		_, err := pool.Exec(ctx, `
			INSERT INTO catatan_musyrif (
				id, santri_id, santri_name, gender, musyrif_id,
				musyrif_name, periode, adab_sosial_skor, kemandirian_skor,
				kebersihan_kamar_skor, catatan_perkembangan, rekomendasi_untuk_wali
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
		`, m.ID, m.SantriID, m.SantriName, m.Gender, m.MusyrifID,
			m.MusyrifName, m.Periode, m.AdabSosialSkor, m.KemandirianSkor,
			m.KebersihanKamarSkor, m.CatatanPerkembangan, m.RekomendasiUntukWali)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		if h != nil {
			payload, _ := json.Marshal(fiber.Map{
				"channel": "catatan_musyrif",
				"action":  "created",
				"data":    m,
			})
			h.BroadcastMessage(payload)
		}

		return utils.SendSuccess(c, m, "Catatan ulasan musyrif berhasil disimpan")
	}
}

func DeletePerizinan(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID perizinan dibutuhkan")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, "DELETE FROM perizinan_records WHERE id = $1", id)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Data perizinan berhasil dihapus")
}

func UpdatePerizinan(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req struct {
			ID            string `json:"id"`
			JenisIzin     string `json:"jenisIzin"`
			Alasan        string `json:"alasan"`
			TglKeluar     string `json:"tglKeluar"`
			TglKembali    string `json:"tglKembali"`
			Status        string `json:"status"`
			BuktiSuratURL string `json:"buktiSuratUrl"`
		}
		if err := c.BodyParser(&req); err != nil || req.ID == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "Data perizinan tidak valid")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		_, err := pool.Exec(ctx, `
			UPDATE perizinan_records SET
				jenis_izin = COALESCE(NULLIF($1, ''), jenis_izin),
				alasan = COALESCE(NULLIF($2, ''), alasan),
				tgl_keluar = COALESCE(NULLIF($3, ''), tgl_keluar),
				tgl_kembali = COALESCE(NULLIF($4, ''), tgl_kembali),
				status = COALESCE(NULLIF($5, ''), status),
				bukti_surat_url = COALESCE(NULLIF($6, ''), bukti_surat_url)
			WHERE id = $7
		`, req.JenisIzin, req.Alasan, req.TglKeluar, req.TglKembali, req.Status, req.BuktiSuratURL, req.ID)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		if h != nil {
			payload, _ := json.Marshal(fiber.Map{
				"channel": "monitoring",
				"action":  "perizinan_updated",
				"data":    req,
			})
			h.BroadcastMessage(payload)
		}

		return utils.SendSuccess(c, req, "Perizinan santri berhasil diperbarui")
	}
}

func DeleteSambangan(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID sambangan dibutuhkan")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, "DELETE FROM sambangan_records WHERE id = $1", id)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Jadwal sambangan berhasil dihapus")
}
