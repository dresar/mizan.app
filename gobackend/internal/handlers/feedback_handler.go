package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"

	"gobackend/config"
	"gobackend/internal/database"
	"gobackend/internal/hub"
	"gobackend/internal/models"
	"gobackend/internal/utils"
)

func GetFeedback(c *fiber.Ctx) error {
	roleVal := c.Locals("role")
	if roleVal == nil || roleVal == "" {
		return c.JSON(fiber.Map{"success": true, "data": []models.FeedbackRecord{}})
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `
		SELECT 
			id, type, category, title, description,
			COALESCE(page_url, ''), COALESCE(user_id, ''),
			COALESCE(user_name, ''), COALESCE(user_role, ''),
			ai_analysis, COALESCE(custom_prompt, ''),
			status, COALESCE(admin_notes, ''),
			to_char(created_at, 'YYYY-MM-DD HH24:MI:SS'),
			to_char(updated_at, 'YYYY-MM-DD HH24:MI:SS')
		FROM feedbacks
		ORDER BY created_at DESC
	`)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	var list []models.FeedbackRecord
	for rows.Next() {
		var f models.FeedbackRecord
		var rawAI []byte
		if err := rows.Scan(
			&f.ID, &f.Type, &f.Category, &f.Title, &f.Description,
			&f.PageURL, &f.UserID, &f.UserName, &f.UserRole,
			&rawAI, &f.CustomPrompt, &f.Status, &f.AdminNotes,
			&f.CreatedAt, &f.UpdatedAt,
		); err == nil {
			if len(rawAI) > 0 {
				var ai models.AIAnalysisResult
				if err := json.Unmarshal(rawAI, &ai); err == nil {
					f.AIAnalysis = &ai
				}
			}
			list = append(list, f)
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    list,
	})
}

func CreateFeedback(h *hub.Hub) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req models.FeedbackRecord
		if err := c.BodyParser(&req); err != nil {
			return utils.SendError(c, fiber.StatusBadRequest, "Payload feedback tidak valid")
		}

		pool := database.GetPool()
		if pool == nil {
			return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
		}

		if req.ID == "" {
			req.ID = fmt.Sprintf("fb-%d", time.Now().UnixNano())
		}
		if req.Status == "" {
			req.Status = models.StatusNew
		}

		var rawAI []byte
		if req.AIAnalysis != nil {
			rawAI, _ = json.Marshal(req.AIAnalysis)
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		_, err := pool.Exec(ctx, `
			INSERT INTO feedbacks (
				id, type, category, title, description, page_url,
				user_id, user_name, user_role, ai_analysis, custom_prompt, status
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
			ON CONFLICT (id) DO UPDATE SET
				title = EXCLUDED.title,
				description = EXCLUDED.description,
				ai_analysis = EXCLUDED.ai_analysis,
				custom_prompt = EXCLUDED.custom_prompt,
				updated_at = NOW()
		`, req.ID, req.Type, req.Category, req.Title, req.Description,
			req.PageURL, req.UserID, req.UserName, req.UserRole,
			rawAI, req.CustomPrompt, req.Status)

		if err != nil {
			return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
		}

		wsEvent := map[string]interface{}{
			"channel":   "feedback:alert",
			"action":    "new_report",
			"id":        req.ID,
			"type":      req.Type,
			"title":     req.Title,
			"user":      req.UserName,
			"timestamp": time.Now().Format(time.RFC3339),
		}
		if eventBytes, err := json.Marshal(wsEvent); err == nil {
			h.BroadcastMessage(eventBytes)
		}

		req.CreatedAt = utils.FormatWIBDateTime(utils.NowWIB())
		return utils.SendSuccess(c, req, "Masukan berhasil terkirim")
	}
}

func UpdateFeedbackStatus(c *fiber.Ctx) error {
	var req struct {
		ID         string                `json:"id"`
		Status     models.FeedbackStatus `json:"status"`
		AdminNotes string                `json:"adminNotes"`
	}
	if err := c.BodyParser(&req); err != nil || req.ID == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID feedback dibutuhkan")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, `
		UPDATE feedbacks SET
			status = COALESCE(NULLIF($1, ''), status),
			admin_notes = COALESCE(NULLIF($2, ''), admin_notes),
			updated_at = NOW()
		WHERE id = $3
	`, req.Status, req.AdminNotes, req.ID)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Status feedback berhasil diperbarui")
}

func DeleteFeedback(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID feedback dibutuhkan")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, "DELETE FROM feedbacks WHERE id = $1", id)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Feedback berhasil dihapus")
}

func AnalyzeFeedback(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req models.AnalyzeRequest
		if err := c.BodyParser(&req); err != nil {
			return utils.SendError(c, fiber.StatusBadRequest, "Payload analisis tidak valid")
		}

		severity := "Sedang"
		affectedFiles := []string{"lib/mizan-context.tsx"}
		rootCause := "Inkonsistensi state atau timeout request asinkron."

		lower := strings.ToLower(req.Title + " " + req.Description + " " + req.Category)
		if strings.Contains(lower, "absen") || strings.Contains(lower, "sholat") {
			severity = "Tinggi"
			affectedFiles = []string{"internal/handlers/absensi_handler.go", "gobackend/internal/hub/hub.go"}
			rootCause = "Kepadatan transaksi konkuren pada jam sibuk sholat berjamaah atau parameter query absensi tidak lengkap."
		} else if strings.Contains(lower, "pdf") || strings.Contains(lower, "rapor") {
			severity = "Sedang"
			affectedFiles = []string{"lib/pdf-generator.ts", "components/ShareCard.tsx"}
			rootCause = "Resolusi elemen kanvas html2canvas melebihi kapasitas memori browser atau font gagal dimuat."
		} else if strings.Contains(lower, "login") || strings.Contains(lower, "sandi") || strings.Contains(lower, "auth") {
			severity = "Kritis"
			affectedFiles = []string{"internal/middleware/auth.go", "internal/handlers/auth_handler.go"}
			rootCause = "Kegagalan verifikasi HMAC SHA-256 session token atau masa berlaku cookie kedaluwarsa."
		}

		promptBuilder := fmt.Sprintf(`### PERBAIKAN BUG MIZAN APPS: %s
- Modul Terdampak: %s (%s)
- Tingkat Keparahan: %s
- Berkas Terkait: %s

#### Identifikasi Masalah:
%s

#### Analisis Akar Masalah:
%s

#### Instruksi Perbaikan Kode:
1. Periksa berkas %s.
2. Terapkan penanganan fallback terstruktur dan validasi payload sebelum mutasi data.
3. Pastikan waktu dicatat dalam zona WIB (Asia/Jakarta).
4. Patuhi aturan baku proyek: STRICT NOKOMEN (dilarang ada komentar kode) dan fungsi modular < 500 baris.
5. Verifikasi build lokal: go build.`,
			req.Title, req.Category, req.PageURL, severity, strings.Join(affectedFiles, ", "),
			req.Description, rootCause, affectedFiles[0])

		result := models.AIAnalysisResult{
			Summary:              fmt.Sprintf("Analisis bug pada modul %s: %s", req.Category, req.Title),
			RootCause:            rootCause,
			AffectedFiles:        affectedFiles,
			Severity:             severity,
			RecommendationPrompt: promptBuilder,
			GeneratedAt:          utils.FormatWIBDateTime(utils.NowWIB()),
		}

		if cfg.SumopodKey != "" {
			goCallAI(cfg.SumopodKey, req, &result)
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data":    result,
		})
	}
}

func goCallAI(apiKey string, req models.AnalyzeRequest, out *models.AIAnalysisResult) {
	client := &http.Client{Timeout: 6 * time.Second}
	sysPrompt := "Anda adalah Senior Go & React Architect Mizan Apps. Analisis bug berikut dan kembalikan JSON {summary, rootCause, affectedFiles, severity, recommendationPrompt}. Patuhi NOKOMEN."
	userPrompt := fmt.Sprintf("Kategori: %s, Halaman: %s, Judul: %s, Deskripsi: %s", req.Category, req.PageURL, req.Title, req.Description)

	bodyData := map[string]interface{}{
		"model": "deepseek-v4.1-flash:netra",
		"messages": []map[string]string{
			{"role": "system", "content": sysPrompt},
			{"role": "user", "content": userPrompt},
		},
		"temperature": 0.2,
	}

	bodyBytes, _ := json.Marshal(bodyData)
	httpReq, err := http.NewRequest("POST", "https://ai.sumopod.com/v1/chat/completions", bytes.NewReader(bodyBytes))
	if err != nil {
		return
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := client.Do(httpReq)
	if err != nil || resp.StatusCode != http.StatusOK {
		return
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return
	}

	var chatResp struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.Unmarshal(respBytes, &chatResp); err == nil && len(chatResp.Choices) > 0 {
		raw := chatResp.Choices[0].Message.Content
		raw = strings.ReplaceAll(raw, "```json", "")
		raw = strings.ReplaceAll(raw, "```", "")
		raw = strings.TrimSpace(raw)

		var parsed models.AIAnalysisResult
		if err := json.Unmarshal([]byte(raw), &parsed); err == nil && parsed.Summary != "" {
			out.Summary = parsed.Summary
			out.RootCause = parsed.RootCause
			if len(parsed.AffectedFiles) > 0 {
				out.AffectedFiles = parsed.AffectedFiles
			}
			if parsed.Severity != "" {
				out.Severity = parsed.Severity
			}
			if parsed.RecommendationPrompt != "" {
				out.RecommendationPrompt = parsed.RecommendationPrompt
			}
		}
	}
	_ = os.DevNull
}
