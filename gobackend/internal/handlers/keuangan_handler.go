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

func GetKeuangan(c *fiber.Ctx) error {
	santriID := c.Query("santriId")
	kategori := c.Query("kategori")

	roleVal := c.Locals("role")
	role, _ := roleVal.(models.Role)
	if role == models.RoleGuru {
		return utils.SendError(c, fiber.StatusForbidden, "Akses ditolak: Guru tidak memiliki akses ke modul finansial")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	sql := `
		SELECT 
			id, santri_id, santri_name, gender, kategori,
			jenis, nominal, saldo_terakhir, deskripsi,
			metode_pembayaran, COALESCE(referensi_kode, ''),
			COALESCE(petugas_id, ''), COALESCE(petugas_nama, ''),
			tanggal, status, to_char(created_at, 'YYYY-MM-DD HH24:MI')
		FROM transaksi_keuangan
		WHERE 1=1
	`
	var args []interface{}

	if santriID != "" {
		args = append(args, santriID)
		sql += fmt.Sprintf(" AND santri_id = $%d", len(args))
	}
	if kategori != "" && kategori != "ALL" {
		args = append(args, kategori)
		sql += fmt.Sprintf(" AND kategori = $%d", len(args))
	}

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

	var list []models.TransaksiKeuangan
	for rows.Next() {
		var tx models.TransaksiKeuangan
		if err := rows.Scan(
			&tx.ID, &tx.SantriID, &tx.SantriName, &tx.Gender, &tx.Kategori,
			&tx.Jenis, &tx.Nominal, &tx.SaldoTerakhir, &tx.Deskripsi,
			&tx.MetodePembayaran, &tx.ReferensiKode,
			&tx.PetugasID, &tx.PetugasNama,
			&tx.Tanggal, &tx.Status, &tx.CreatedAt,
		); err == nil {
			list = append(list, tx)
		}
	}

	return c.JSON(fiber.Map{
		"success":   true,
		"transaksi": list,
	})
}

func CreateTransaksiKeuangan(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleVal := c.Locals("role")
		role, _ := roleVal.(models.Role)
		if role == models.RoleGuru {
			return utils.SendError(c, fiber.StatusForbidden, "Akses ditolak: Guru tidak memiliki akses ke modul finansial")
		}

		var t models.TransaksiKeuangan
		if err := c.BodyParser(&t); err != nil {
			return utils.SendError(c, fiber.StatusBadRequest, "Payload transaksi tidak valid")
		}

		if t.SantriID == "" || t.Nominal <= 0 || t.Jenis == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "Data santri, nominal, dan jenis transaksi wajib diisi")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		dbTx, err := pool.Begin(ctx)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, "Gagal memulai transaksi database")
		}
		defer dbTx.Rollback(ctx)

		var curBalance float64
		err = dbTx.QueryRow(ctx, "SELECT COALESCE(pocket_balance, 0) FROM santri WHERE id = $1 FOR UPDATE", t.SantriID).Scan(&curBalance)
		if err != nil {
			return utils.SendError(c, fiber.StatusNotFound, "Santri tidak ditemukan")
		}

		newBalance := curBalance
		if t.Jenis == "IN" {
			newBalance = curBalance + t.Nominal
		} else if t.Jenis == "OUT" {
			if curBalance < t.Nominal {
				return utils.SendError(c, fiber.StatusBadRequest, fmt.Sprintf("Saldo tidak mencukupi (Sisa: Rp %.0f)", curBalance))
			}
			newBalance = curBalance - t.Nominal
		}

		if t.ID == "" {
			t.ID = randomToken("trx")
		}
		if t.Tanggal == "" {
			t.Tanggal = time.Now().Format("2006-01-02")
		}
		if t.Status == "" {
			t.Status = "BERHASIL"
		}
		t.SaldoTerakhir = newBalance

		usernameVal := c.Locals("username")
		t.PetugasNama, _ = usernameVal.(string)

		_, err = dbTx.Exec(ctx, `
			INSERT INTO transaksi_keuangan (
				id, santri_id, santri_name, gender, kategori,
				jenis, nominal, saldo_terakhir, deskripsi,
				metode_pembayaran, referensi_kode, petugas_id,
				petugas_nama, tanggal, status
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
		`, t.ID, t.SantriID, t.SantriName, t.Gender, t.Kategori,
			t.Jenis, t.Nominal, t.SaldoTerakhir, t.Deskripsi,
			t.MetodePembayaran, t.ReferensiKode, t.PetugasID,
			t.PetugasNama, t.Tanggal, t.Status)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		_, err = dbTx.Exec(ctx, `
			UPDATE santri SET pocket_balance = $1 WHERE id = $2
		`, newBalance, t.SantriID)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		if err := dbTx.Commit(ctx); err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, "Gagal menyelesaikan transaksi")
		}

		if h != nil {
			payload, _ := json.Marshal(fiber.Map{
				"channel": "keuangan",
				"action":  "created",
				"data":    t,
			})
			h.BroadcastMessage(payload)
		}

		return utils.SendSuccess(c, t, "Transaksi uang saku berhasil dicatat")
	}
}

func GetTagihanSPP(c *fiber.Ctx) error {
	santriID := c.Query("santriId")
	status := c.Query("status")

	roleVal := c.Locals("role")
	role, _ := roleVal.(models.Role)
	if role == models.RoleGuru {
		return utils.SendError(c, fiber.StatusForbidden, "Akses ditolak: Guru tidak memiliki akses ke modul finansial")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	sql := `
		SELECT 
			id, santri_id, santri_name, gender, bulan,
			tahun, nominal, status, jatuh_tempo,
			COALESCE(tgl_bayar, ''), COALESCE(kuitansi_nomor, ''),
			to_char(created_at, 'YYYY-MM-DD HH24:MI')
		FROM tagihan_spp
		WHERE 1=1
	`
	var args []interface{}

	if santriID != "" {
		args = append(args, santriID)
		sql += fmt.Sprintf(" AND santri_id = $%d", len(args))
	}
	if status != "" && status != "ALL" {
		args = append(args, status)
		sql += fmt.Sprintf(" AND status = $%d", len(args))
	}

	if role == models.RoleOrtu {
		userIDVal := c.Locals("user_id")
		userID, _ := userIDVal.(string)
		childID := strings.TrimPrefix(userID, "ortu-")
		args = append(args, childID)
		sql += fmt.Sprintf(" AND (santri_id = $%d OR santri_id IN (SELECT id FROM santri WHERE id = $%d OR LOWER(nis) = LOWER($%d)))", len(args), len(args), len(args))
	}

	sql += " ORDER BY tahun DESC, bulan DESC LIMIT 500"

	rows, err := pool.Query(ctx, sql, args...)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	var list []models.TagihanSPP
	for rows.Next() {
		var s models.TagihanSPP
		if err := rows.Scan(
			&s.ID, &s.SantriID, &s.SantriName, &s.Gender, &s.Bulan,
			&s.Tahun, &s.Nominal, &s.Status, &s.JatuhTempo,
			&s.TglBayar, &s.KuitansiNomor, &s.CreatedAt,
		); err == nil {
			list = append(list, s)
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"tagihan": list,
	})
}

func PayTagihanSPP(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleVal := c.Locals("role")
		role, _ := roleVal.(models.Role)
		if role == models.RoleGuru {
			return utils.SendError(c, fiber.StatusForbidden, "Akses ditolak: Guru tidak memiliki akses ke modul finansial")
		}

		type Req struct {
			ID string `json:"id"`
		}
		var r Req
		if err := c.BodyParser(&r); err != nil || r.ID == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "ID Tagihan SPP dibutuhkan")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		today := time.Now().Format("2006-01-02")
		kuitansi := fmt.Sprintf("KW-SPP-%s-%d", time.Now().Format("200601"), time.Now().Unix()%100000)

		res, err := pool.Exec(ctx, `
			UPDATE tagihan_spp SET
				status = 'LUNAS',
				tgl_bayar = $1,
				kuitansi_nomor = $2
			WHERE id = $3
		`, today, kuitansi, r.ID)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}
		if res.RowsAffected() == 0 {
			return utils.SendError(c, fiber.StatusNotFound, "Tagihan SPP tidak ditemukan")
		}

		if h != nil {
			payload, _ := json.Marshal(fiber.Map{
				"channel": "spp",
				"action":  "paid",
				"data":    fiber.Map{"id": r.ID, "status": "LUNAS", "kuitansi": kuitansi},
			})
			h.BroadcastMessage(payload)
		}

		return utils.SendSuccess(c, fiber.Map{"kuitansiNomor": kuitansi}, "Pembayaran SPP berhasil disahkan")
	}
}

func CreateTagihanSPP(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleVal := c.Locals("role")
		role, _ := roleVal.(models.Role)
		if role != models.RoleSuperAdmin && role != models.RolePengasuhan {
			return utils.SendError(c, fiber.StatusForbidden, "Akses ditolak: Hanya pengasuhan atau admin yang dapat membuat tagihan SPP")
		}

		var s models.TagihanSPP
		if err := c.BodyParser(&s); err != nil {
			return utils.SendError(c, fiber.StatusBadRequest, "Payload tagihan tidak valid")
		}

		if s.SantriID == "" || s.Bulan == "" || s.Nominal <= 0 {
			return utils.SendError(c, fiber.StatusBadRequest, "Data santri, bulan, dan nominal wajib diisi")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		if s.ID == "" {
			s.ID = randomToken("spp")
		}
		if s.Tahun == 0 {
			s.Tahun = time.Now().Year()
		}
		if s.Status == "" {
			s.Status = "BELUM_LUNAS"
		}
		if s.JatuhTempo == "" {
			s.JatuhTempo = fmt.Sprintf("%d-%02d-10", s.Tahun, time.Now().Month())
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		_, err := pool.Exec(ctx, `
			INSERT INTO tagihan_spp (
				id, santri_id, santri_name, gender, bulan,
				tahun, nominal, status, jatuh_tempo
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		`, s.ID, s.SantriID, s.SantriName, s.Gender, s.Bulan,
			s.Tahun, s.Nominal, s.Status, s.JatuhTempo)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		if h != nil {
			payload, _ := json.Marshal(fiber.Map{
				"channel": "spp",
				"action":  "created",
				"data":    s,
			})
			h.BroadcastMessage(payload)
		}

		return utils.SendSuccess(c, s, "Tagihan SPP berhasil dibuat")
	}
}

func DeleteTransaksiKeuangan(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Query("id")
		if id == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "ID transaksi dibutuhkan")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		var santriID, jenis string
		var nominal float64
		err := pool.QueryRow(ctx, "SELECT santri_id, jenis, nominal FROM transaksi_keuangan WHERE id = $1", id).Scan(&santriID, &jenis, &nominal)
		if err != nil {
			return utils.SendError(c, fiber.StatusNotFound, "Transaksi tidak ditemukan")
		}

		_, err = pool.Exec(ctx, "DELETE FROM transaksi_keuangan WHERE id = $1", id)
		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		if jenis == "TOPUP" {
			_, _ = pool.Exec(ctx, "UPDATE santri SET pocket_balance = GREATEST(0, pocket_balance - $1) WHERE id = $2", nominal, santriID)
		} else if jenis == "BELANJA" || jenis == "TARIK" {
			_, _ = pool.Exec(ctx, "UPDATE santri SET pocket_balance = pocket_balance + $1 WHERE id = $2", nominal, santriID)
		}

		if h != nil {
			payload, _ := json.Marshal(fiber.Map{
				"channel": "keuangan",
				"action":  "deleted",
				"data":    fiber.Map{"id": id, "santriId": santriID},
			})
			h.BroadcastMessage(payload)
		}

		return utils.SendSuccess(c, nil, "Transaksi keuangan berhasil dihapus dan saldo diperbarui")
	}
}

func DeleteTagihanSPP(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID tagihan SPP dibutuhkan")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, "DELETE FROM tagihan_spp WHERE id = $1", id)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Tagihan SPP berhasil dihapus")
}
