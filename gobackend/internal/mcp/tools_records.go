package mcp

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/modelcontextprotocol/go-sdk/mcp"

	"gobackend/internal/database"
	"gobackend/internal/models"
)

func (th *ToolHandlers) HandleListAbsensi(ctx context.Context, req *mcp.CallToolRequest, in ListAbsensiInput) (*mcp.CallToolResult, []models.AbsensiRecord, error) {
	pool := database.GetPool()
	if pool == nil {
		return nil, nil, fmt.Errorf("database belum terhubung")
	}

	limit := in.Limit
	if limit <= 0 || limit > 500 {
		limit = 50
	}

	var conditions []string
	var args []any
	argIndex := 1

	if in.Date != "" {
		conditions = append(conditions, fmt.Sprintf("date = $%d", argIndex))
		args = append(args, in.Date)
		argIndex++
	}

	if in.Class != "" {
		conditions = append(conditions, fmt.Sprintf("LOWER(santri_class) = LOWER($%d)", argIndex))
		args = append(args, in.Class)
		argIndex++
	}

	if in.WaktuSholat != "" {
		conditions = append(conditions, fmt.Sprintf("LOWER(waktu_sholat) = LOWER($%d)", argIndex))
		args = append(args, in.WaktuSholat)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT 
			id, santri_id, santri_name, santri_class, gender, guru_id,
			guru_name, COALESCE(waktu_sholat, 'Subuh'), date, status, score_impact,
			notes, to_char(created_at, 'HH24:MI WIB')
		FROM absensi
		%s
		ORDER BY created_at DESC
		LIMIT $%d
	`, whereClause, argIndex)
	args = append(args, limit)

	rows, err := pool.Query(ctx, query, args...)
	if err != nil {
		return nil, nil, err
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

	return nil, list, nil
}

func (th *ToolHandlers) HandleRecordAbsensi(ctx context.Context, req *mcp.CallToolRequest, in RecordAbsensiInput) (*mcp.CallToolResult, map[string]any, error) {
	pool := database.GetPool()
	if pool == nil {
		return nil, nil, fmt.Errorf("database belum terhubung")
	}

	var santriName, santriClass, santriGender string
	err := pool.QueryRow(ctx, `
		SELECT name, class, gender FROM santri WHERE id = $1
	`, in.SantriID).Scan(&santriName, &santriClass, &santriGender)
	if err != nil {
		return nil, nil, fmt.Errorf("santri ID %s tidak ditemukan", in.SantriID)
	}

	recordID := fmt.Sprintf("abs-%s-%d", in.SantriID, time.Now().UnixNano())
	guruName := in.GuruName
	if guruName == "" {
		guruName = "MCP-Agent"
	}

	var scoreImpact float64 = 0.0
	switch strings.ToLower(in.Status) {
	case "hadir":
		scoreImpact = 0.1
	case "alpa":
		scoreImpact = -0.5
	case "sakit", "izin":
		scoreImpact = 0.0
	}

	_, err = pool.Exec(ctx, `
		INSERT INTO absensi (
			id, santri_id, santri_name, santri_class, gender,
			guru_id, guru_name, waktu_sholat, date, status,
			score_impact, notes, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
	`, recordID, in.SantriID, santriName, santriClass, santriGender, "mcp-agent", guruName, in.WaktuSholat, in.Date, in.Status, scoreImpact, in.Notes)
	if err != nil {
		return nil, nil, fmt.Errorf("gagal menyimpan absensi: %w", err)
	}

	if strings.ToLower(in.Status) == "hadir" {
		_, _ = pool.Exec(ctx, `UPDATE santri SET total_hadir = total_hadir + 1 WHERE id = $1`, in.SantriID)
	} else if strings.ToLower(in.Status) == "alpa" {
		_, _ = pool.Exec(ctx, `UPDATE santri SET total_alpa = total_alpa + 1, current_score = GREATEST(0, current_score - 0.5) WHERE id = $1`, in.SantriID)
	}

	if th.hub != nil {
		event := map[string]any{
			"channel": "absensi",
			"action":  "created",
			"data": map[string]any{
				"id":          recordID,
				"santriId":    in.SantriID,
				"santriName":  santriName,
				"waktuSholat": in.WaktuSholat,
				"status":      in.Status,
			},
			"timestamp": time.Now().Format(time.RFC3339),
		}
		bytes, _ := json.Marshal(event)
		th.hub.BroadcastMessage(bytes)
	}

	return nil, map[string]any{
		"success":  true,
		"recordId": recordID,
		"santri":   santriName,
		"sholat":   in.WaktuSholat,
		"status":   in.Status,
	}, nil
}

func (th *ToolHandlers) HandleListPenilaian(ctx context.Context, req *mcp.CallToolRequest, in ListPenilaianInput) (*mcp.CallToolResult, []models.PenilaianRecord, error) {
	pool := database.GetPool()
	if pool == nil {
		return nil, nil, fmt.Errorf("database belum terhubung")
	}

	limit := in.Limit
	if limit <= 0 || limit > 500 {
		limit = 50
	}

	var conditions []string
	var args []any
	argIndex := 1

	if in.SantriID != "" {
		conditions = append(conditions, fmt.Sprintf("santri_id = $%d", argIndex))
		args = append(args, in.SantriID)
		argIndex++
	}

	if in.Type != "" {
		conditions = append(conditions, fmt.Sprintf("UPPER(type) = UPPER($%d)", argIndex))
		args = append(args, in.Type)
		argIndex++
	}

	if in.CategoryName != "" {
		conditions = append(conditions, fmt.Sprintf("LOWER(category_name) = LOWER($%d)", argIndex))
		args = append(args, in.CategoryName)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT 
			id, santri_id, santri_name, santri_class, gender,
			guru_id, guru_name, type, category_name, unsur_name,
			indicator_text, tingkat, score, notes, created_at, date_key
		FROM penilaian
		%s
		ORDER BY created_at DESC
		LIMIT $%d
	`, whereClause, argIndex)
	args = append(args, limit)

	rows, err := pool.Query(ctx, query, args...)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var list []models.PenilaianRecord
	for rows.Next() {
		var p models.PenilaianRecord
		if err := rows.Scan(
			&p.ID, &p.SantriID, &p.SantriName, &p.SantriClass, &p.Gender,
			&p.GuruID, &p.GuruName, &p.Type, &p.CategoryName, &p.UnsurName,
			&p.IndicatorText, &p.Tingkat, &p.Score, &p.Notes, &p.CreatedAt, &p.DateKey,
		); err == nil {
			list = append(list, p)
		}
	}

	return nil, list, nil
}

func (th *ToolHandlers) HandleRecordPenilaian(ctx context.Context, req *mcp.CallToolRequest, in RecordPenilaianInput) (*mcp.CallToolResult, map[string]any, error) {
	pool := database.GetPool()
	if pool == nil {
		return nil, nil, fmt.Errorf("database belum terhubung")
	}

	var santriName, santriClass, santriGender string
	err := pool.QueryRow(ctx, `
		SELECT name, class, gender FROM santri WHERE id = $1
	`, in.SantriID).Scan(&santriName, &santriClass, &santriGender)
	if err != nil {
		return nil, nil, fmt.Errorf("santri ID %s tidak ditemukan", in.SantriID)
	}

	recordID := fmt.Sprintf("pen-%s-%d", in.SantriID, time.Now().UnixNano())
	guruName := in.GuruName
	if guruName == "" {
		guruName = "MCP-Agent"
	}

	dateKey := time.Now().Format("2006-01-02")
	scoreDelta := in.Score
	if strings.ToUpper(in.Type) == "SAYYIAH" && scoreDelta > 0 {
		scoreDelta = -scoreDelta
	}

	_, err = pool.Exec(ctx, `
		INSERT INTO penilaian (
			id, santri_id, santri_name, santri_class, gender,
			guru_id, guru_name, type, category_name, unsur_name,
			indicator_text, tingkat, score, notes, created_at, date_key
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15)
	`, recordID, in.SantriID, santriName, santriClass, santriGender, "mcp-agent", guruName, strings.ToUpper(in.Type), in.CategoryName, in.UnsurName, in.IndicatorText, "MCP", scoreDelta, in.Notes, dateKey)
	if err != nil {
		return nil, nil, fmt.Errorf("gagal menyimpan penilaian: %w", err)
	}

	_, _ = pool.Exec(ctx, `
		UPDATE santri 
		SET current_score = GREATEST(0, LEAST(100, current_score + $1))
		WHERE id = $2
	`, scoreDelta, in.SantriID)

	if th.hub != nil {
		event := map[string]any{
			"channel": "penilaian",
			"action":  "created",
			"data": map[string]any{
				"id":         recordID,
				"santriId":   in.SantriID,
				"santriName": santriName,
				"type":       in.Type,
				"score":      scoreDelta,
			},
			"timestamp": time.Now().Format(time.RFC3339),
		}
		bytes, _ := json.Marshal(event)
		th.hub.BroadcastMessage(bytes)
	}

	return nil, map[string]any{
		"success":  true,
		"recordId": recordID,
		"santri":   santriName,
		"type":     in.Type,
		"score":    scoreDelta,
	}, nil
}

func (th *ToolHandlers) HandleListFeedback(ctx context.Context, req *mcp.CallToolRequest, in ListFeedbackInput) (*mcp.CallToolResult, []models.FeedbackRecord, error) {
	pool := database.GetPool()
	if pool == nil {
		return nil, nil, fmt.Errorf("database belum terhubung")
	}

	limit := in.Limit
	if limit <= 0 || limit > 200 {
		limit = 50
	}

	var conditions []string
	var args []any
	argIndex := 1

	if in.Type != "" {
		conditions = append(conditions, fmt.Sprintf("UPPER(type) = UPPER($%d)", argIndex))
		args = append(args, in.Type)
		argIndex++
	}

	if in.Status != "" {
		conditions = append(conditions, fmt.Sprintf("LOWER(status) = LOWER($%d)", argIndex))
		args = append(args, in.Status)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT 
			id, type, category, title, description,
			COALESCE(page_url, ''), COALESCE(user_id, ''),
			COALESCE(user_name, ''), COALESCE(user_role, ''),
			status, COALESCE(admin_notes, ''), created_at, updated_at
		FROM feedbacks
		%s
		ORDER BY created_at DESC
		LIMIT $%d
	`, whereClause, argIndex)
	args = append(args, limit)

	rows, err := pool.Query(ctx, query, args...)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var list []models.FeedbackRecord
	for rows.Next() {
		var f models.FeedbackRecord
		if err := rows.Scan(
			&f.ID, &f.Type, &f.Category, &f.Title, &f.Description,
			&f.PageURL, &f.UserID, &f.UserName, &f.UserRole,
			&f.Status, &f.AdminNotes, &f.CreatedAt, &f.UpdatedAt,
		); err == nil {
			list = append(list, f)
		}
	}

	return nil, list, nil
}

func (th *ToolHandlers) HandleBroadcast(ctx context.Context, req *mcp.CallToolRequest, in BroadcastMessageInput) (*mcp.CallToolResult, map[string]any, error) {
	if th.hub == nil {
		return nil, nil, fmt.Errorf("realtime WebSocket hub tidak aktif")
	}

	event := map[string]any{
		"channel":   in.Channel,
		"action":    in.Action,
		"data":      in.Message,
		"id":        uuid.New().String(),
		"timestamp": time.Now().Format(time.RFC3339),
	}

	bytes, err := json.Marshal(event)
	if err != nil {
		return nil, nil, err
	}

	th.hub.BroadcastMessage(bytes)

	return nil, map[string]any{
		"success": true,
		"channel": in.Channel,
		"action":  in.Action,
		"clients": th.hub.ClientCount(),
	}, nil
}
