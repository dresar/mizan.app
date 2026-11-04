package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/database"
	"gobackend/internal/hub"
	"gobackend/internal/models"
	"gobackend/internal/utils"
)

var (
	memNotifsLock sync.RWMutex
	memNotifs     = []models.MizanNotification{
		{
			ID:         "notif-rapor-eval",
			Title:      "Notifikasi Evaluasi Rapor Santri",
			Message:    "Terdapat santri dalam batas perhatian pembinaan khusus dan peraih predikat Mumtaz. Seluruh lembar rapor dapat langsung dicetak per santri atau massal.",
			Time:       "Baru saja",
			Type:       "info",
			Category:   "Evaluasi Rapor",
			Link:       "/admin/rapor",
			IsActive:   true,
			TargetRole: "ALL",
			CreatedAt:  "2026-11-04 08:00:00",
		},
		{
			ID:         "notif-eval-santri",
			Title:      "Evaluasi Pembinaan Santri",
			Message:    "Terdapat santri dalam batas perhatian pembinaan adab khusus pondok yang memerlukan bimbingan konseling.",
			Time:       "10m lalu",
			Type:       "urgent",
			Category:   "Peringatan Disiplin",
			Link:       "/admin/santri",
			IsActive:   true,
			TargetRole: "ALL",
			CreatedAt:  "2026-11-04 07:50:00",
		},
		{
			ID:         "notif-sholat-today",
			Title:      "Presensi Sholat Berjamaah",
			Message:    "Data kehadiran sholat 7 waktu santri hari ini telah tercatat tertib oleh seluruh asatidzah pembina.",
			Time:       "45m lalu",
			Type:       "success",
			Category:   "Presensi Sholat",
			Link:       "/admin/absensi",
			IsActive:   true,
			TargetRole: "ALL",
			CreatedAt:  "2026-11-04 07:15:00",
		},
		{
			ID:         "notif-hasanah-baru",
			Title:      "Apresiasi Capaian Hasanah",
			Message:    "Catatan kebaikan dan prestasi baru santri berhasil dicatat oleh pembina kamar.",
			Time:       "4j lalu",
			Type:       "success",
			Category:   "Peringatan Disiplin",
			Link:       "/admin/kategori-pelanggaran",
			IsActive:   true,
			TargetRole: "ALL",
			CreatedAt:  "2026-11-04 04:00:00",
		},
		{
			ID:         "notif-jadwal-disiplin",
			Title:      "Jadwal Evaluasi Disiplin Kamar",
			Message:    "Pemeriksaan kedisiplinan dan kerapian kamar santri pekan ini oleh mudabbir pengasuhan.",
			Time:       "1h lalu",
			Type:       "warning",
			Category:   "Peringatan Disiplin",
			Link:       "/admin/wali-kelas",
			IsActive:   true,
			TargetRole: "ALL",
			CreatedAt:  "2026-11-03 12:00:00",
		},
	}
)

func GetNotifications(c *fiber.Ctx) error {
	showAll := c.Query("all") == "1"
	pool := database.GetPool()

	if pool != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
		defer cancel()

		query := `SELECT id, title, message, COALESCE(time, ''), category, type, COALESCE(link, ''), is_active, COALESCE(target_role, 'ALL'), to_char(created_at, 'YYYY-MM-DD HH24:MI:SS'), to_char(updated_at, 'YYYY-MM-DD HH24:MI:SS') FROM notifications`
		if !showAll {
			query += ` WHERE is_active = true`
		}
		query += ` ORDER BY created_at DESC`

		rows, err := pool.Query(ctx, query)
		if err == nil {
			defer rows.Close()
			var list []models.MizanNotification
			for rows.Next() {
				var n models.MizanNotification
				if err := rows.Scan(
					&n.ID, &n.Title, &n.Message, &n.Time, &n.Category,
					&n.Type, &n.Link, &n.IsActive, &n.TargetRole,
					&n.CreatedAt, &n.UpdatedAt,
				); err == nil {
					list = append(list, n)
				}
			}
			if len(list) > 0 {
				return c.JSON(fiber.Map{
					"success": true,
					"data":    list,
				})
			}
		}
	}

	memNotifsLock.RLock()
	defer memNotifsLock.RUnlock()

	var result []models.MizanNotification
	for _, n := range memNotifs {
		if showAll || n.IsActive {
			result = append(result, n)
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

func CreateNotification(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req models.MizanNotification
		if err := c.BodyParser(&req); err != nil {
			return utils.SendError(c, fiber.StatusBadRequest, "Payload notifikasi tidak valid")
		}

		if strings.TrimSpace(req.Title) == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "Judul notifikasi wajib diisi")
		}
		if strings.TrimSpace(req.Message) == "" {
			return utils.SendError(c, fiber.StatusBadRequest, "Pesan notifikasi wajib diisi")
		}

		if req.ID == "" {
			req.ID = fmt.Sprintf("notif-%d", time.Now().UnixNano()/int64(time.Millisecond))
		}
		if req.Time == "" {
			req.Time = "Baru saja"
		}
		if req.Category == "" {
			req.Category = "Pengumuman Pondok"
		}
		if req.Type == "" {
			req.Type = "info"
		}
		if req.TargetRole == "" {
			req.TargetRole = "ALL"
		}
		nowStr := time.Now().Format("2006-01-02 15:04:05")
		req.CreatedAt = nowStr
		req.UpdatedAt = nowStr

		pool := database.GetPool()
		if pool != nil {
			ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
			defer cancel()

			_, _ = pool.Exec(ctx, `
				INSERT INTO notifications (id, title, message, time, category, type, link, is_active, target_role, created_at, updated_at)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
				ON CONFLICT (id) DO UPDATE 
				SET title = EXCLUDED.title, message = EXCLUDED.message, category = EXCLUDED.category, type = EXCLUDED.type, link = EXCLUDED.link, is_active = EXCLUDED.is_active, target_role = EXCLUDED.target_role, updated_at = NOW()
			`, req.ID, req.Title, req.Message, req.Time, req.Category, req.Type, req.Link, req.IsActive, req.TargetRole)
		}

		memNotifsLock.Lock()
		memNotifs = append([]models.MizanNotification{req}, memNotifs...)
		memNotifsLock.Unlock()

		if h != nil {
			eventBytes, _ := json.Marshal(fiber.Map{
				"channel":   "notifications",
				"action":    "created",
				"data":      req,
				"timestamp": time.Now().Format(time.RFC3339),
			})
			h.BroadcastMessage(eventBytes)
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"success": true,
			"data":    req,
			"message": "Notifikasi berhasil ditambahkan",
		})
	}
}

func UpdateNotification(c *fiber.Ctx) error {
	var body map[string]interface{}
	if err := c.BodyParser(&body); err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Payload tidak valid")
	}

	idRaw, ok := body["id"]
	if !ok {
		return utils.SendError(c, fiber.StatusBadRequest, "ID notifikasi diperlukan")
	}
	id := fmt.Sprintf("%v", idRaw)

	pool := database.GetPool()
	if pool != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
		defer cancel()

		var title, message, category, notifType, link, targetRole *string
		var isActive *bool

		if v, exists := body["title"]; exists && v != nil {
			s := fmt.Sprintf("%v", v)
			title = &s
		}
		if v, exists := body["message"]; exists && v != nil {
			s := fmt.Sprintf("%v", v)
			message = &s
		}
		if v, exists := body["category"]; exists && v != nil {
			s := fmt.Sprintf("%v", v)
			category = &s
		}
		if v, exists := body["type"]; exists && v != nil {
			s := fmt.Sprintf("%v", v)
			notifType = &s
		}
		if v, exists := body["link"]; exists && v != nil {
			s := fmt.Sprintf("%v", v)
			link = &s
		}
		if v, exists := body["targetRole"]; exists && v != nil {
			s := fmt.Sprintf("%v", v)
			targetRole = &s
		}
		if v, exists := body["isActive"]; exists && v != nil {
			b := v == true
			isActive = &b
		}

		_, _ = pool.Exec(ctx, `
			UPDATE notifications
			SET title = COALESCE($1, title),
			    message = COALESCE($2, message),
			    category = COALESCE($3, category),
			    type = COALESCE($4, type),
			    link = COALESCE($5, link),
			    is_active = COALESCE($6, is_active),
			    target_role = COALESCE($7, target_role),
			    updated_at = NOW()
			WHERE id = $8
		`, title, message, category, notifType, link, isActive, targetRole, id)
	}

	memNotifsLock.Lock()
	for i, n := range memNotifs {
		if n.ID == id {
			if v, exists := body["title"]; exists && v != nil {
				memNotifs[i].Title = fmt.Sprintf("%v", v)
			}
			if v, exists := body["message"]; exists && v != nil {
				memNotifs[i].Message = fmt.Sprintf("%v", v)
			}
			if v, exists := body["category"]; exists && v != nil {
				memNotifs[i].Category = fmt.Sprintf("%v", v)
			}
			if v, exists := body["type"]; exists && v != nil {
				memNotifs[i].Type = fmt.Sprintf("%v", v)
			}
			if v, exists := body["link"]; exists && v != nil {
				memNotifs[i].Link = fmt.Sprintf("%v", v)
			}
			if v, exists := body["targetRole"]; exists && v != nil {
				memNotifs[i].TargetRole = fmt.Sprintf("%v", v)
			}
			if v, exists := body["isActive"]; exists && v != nil {
				memNotifs[i].IsActive = v == true
			}
			memNotifs[i].UpdatedAt = time.Now().Format("2006-01-02 15:04:05")
			break
		}
	}
	memNotifsLock.Unlock()

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Notifikasi berhasil diperbarui",
	})
}

func DeleteNotification(c *fiber.Ctx) error {
	id := c.Query("id")
	var ids []string

	if id != "" {
		ids = append(ids, id)
	} else {
		var body struct {
			ID  string   `json:"id"`
			IDs []string `json:"ids"`
		}
		if err := c.BodyParser(&body); err == nil {
			if body.ID != "" {
				ids = append(ids, body.ID)
			}
			if len(body.IDs) > 0 {
				ids = append(ids, body.IDs...)
			}
		}
	}

	if len(ids) == 0 {
		return utils.SendError(c, fiber.StatusBadRequest, "ID notifikasi diperlukan")
	}

	pool := database.GetPool()
	if pool != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
		defer cancel()

		for _, itemID := range ids {
			_, _ = pool.Exec(ctx, `DELETE FROM notifications WHERE id = $1`, itemID)
		}
	}

	memNotifsLock.Lock()
	var remaining []models.MizanNotification
	for _, n := range memNotifs {
		toDelete := false
		for _, itemID := range ids {
			if n.ID == itemID {
				toDelete = true
				break
			}
		}
		if !toDelete {
			remaining = append(remaining, n)
		}
	}
	memNotifs = remaining
	memNotifsLock.Unlock()

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Notifikasi berhasil dihapus",
	})
}
