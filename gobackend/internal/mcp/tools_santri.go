package mcp

import (
	"context"
	"fmt"
	"runtime"
	"strings"
	"time"

	"github.com/modelcontextprotocol/go-sdk/mcp"

	"gobackend/internal/database"
	"gobackend/internal/hub"
	"gobackend/internal/models"
)

type ToolHandlers struct {
	hub       *hub.Hub
	startTime time.Time
}

func NewToolHandlers(h *hub.Hub) *ToolHandlers {
	return &ToolHandlers{
		hub:       h,
		startTime: time.Now(),
	}
}

func (th *ToolHandlers) HandleHealth(ctx context.Context, req *mcp.CallToolRequest, in HealthInput) (*mcp.CallToolResult, HealthOutput, error) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	clientCount := 0
	if th.hub != nil {
		clientCount = th.hub.ClientCount()
	}

	dbStatus := "connected"
	pool := database.GetPool()
	if pool == nil {
		dbStatus = "disconnected"
	} else {
		pingCtx, pingCancel := context.WithTimeout(ctx, 3*time.Second)
		defer pingCancel()
		if err := pool.Ping(pingCtx); err != nil {
			dbStatus = "ping_failed: " + err.Error()
		}
	}

	out := HealthOutput{
		Status:     "ok",
		Engine:     "Mizan Go Fiber v2 & MCP Engine",
		Uptime:     time.Since(th.startTime).String(),
		Clients:    clientCount,
		AllocMB:    fmt.Sprintf("%.2f MB", float64(m.Alloc)/1024/1024),
		SysMB:      fmt.Sprintf("%.2f MB", float64(m.Sys)/1024/1024),
		Goroutines: runtime.NumGoroutine(),
		DBStatus:   dbStatus,
	}

	return nil, out, nil
}

func (th *ToolHandlers) HandleListSantri(ctx context.Context, req *mcp.CallToolRequest, in ListSantriInput) (*mcp.CallToolResult, []models.Santri, error) {
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

	if in.Class != "" {
		conditions = append(conditions, fmt.Sprintf("LOWER(class) = LOWER($%d)", argIndex))
		args = append(args, in.Class)
		argIndex++
	}

	if in.Gender != "" {
		conditions = append(conditions, fmt.Sprintf("LOWER(gender) = LOWER($%d)", argIndex))
		args = append(args, in.Gender)
		argIndex++
	}

	if in.Query != "" {
		conditions = append(conditions, fmt.Sprintf("(name ILIKE $%d OR nis ILIKE $%d)", argIndex, argIndex))
		args = append(args, "%"+in.Query+"%")
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT 
			id, nis, name, gender, class, asrama, kamar, 
			base_score, current_score, status, avatar,
			COALESCE(wali_name, ''), COALESCE(wali_phone, ''),
			COALESCE(total_hadir, 28), COALESCE(total_alpa, 0)
		FROM santri
		%s
		ORDER BY name ASC
		LIMIT $%d
	`, whereClause, argIndex)
	args = append(args, limit)

	rows, err := pool.Query(ctx, query, args...)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var list []models.Santri
	for rows.Next() {
		var s models.Santri
		if err := rows.Scan(
			&s.ID, &s.NIS, &s.Name, &s.Gender, &s.Class, &s.Asrama, &s.Kamar,
			&s.BaseScore, &s.CurrentScore, &s.Status, &s.Avatar,
			&s.WaliName, &s.WaliPhone, &s.TotalHadir, &s.TotalAlpa,
		); err == nil {
			list = append(list, s)
		}
	}

	return nil, list, nil
}

func (th *ToolHandlers) HandleGetSantriDetail(ctx context.Context, req *mcp.CallToolRequest, in GetSantriDetailInput) (*mcp.CallToolResult, SantriDetailOutput, error) {
	pool := database.GetPool()
	if pool == nil {
		return nil, SantriDetailOutput{}, fmt.Errorf("database belum terhubung")
	}

	var s models.Santri
	err := pool.QueryRow(ctx, `
		SELECT 
			id, nis, name, gender, class, asrama, kamar, 
			base_score, current_score, status, avatar,
			COALESCE(wali_name, ''), COALESCE(wali_phone, ''),
			COALESCE(total_hadir, 28), COALESCE(total_alpa, 0)
		FROM santri
		WHERE id = $1 OR nis = $1
		LIMIT 1
	`, in.SantriID).Scan(
		&s.ID, &s.NIS, &s.Name, &s.Gender, &s.Class, &s.Asrama, &s.Kamar,
		&s.BaseScore, &s.CurrentScore, &s.Status, &s.Avatar,
		&s.WaliName, &s.WaliPhone, &s.TotalHadir, &s.TotalAlpa,
	)
	if err != nil {
		return nil, SantriDetailOutput{}, fmt.Errorf("santri tidak ditemukan: %w", err)
	}

	penilaianRows, err := pool.Query(ctx, `
		SELECT 
			id, santri_id, santri_name, santri_class, gender,
			guru_id, guru_name, type, category_name, unsur_name,
			indicator_text, tingkat, score, notes, created_at, date_key
		FROM penilaian
		WHERE santri_id = $1
		ORDER BY created_at DESC
		LIMIT 100
	`, s.ID)
	var violations []models.PenilaianRecord
	var achievements []models.PenilaianRecord
	if err == nil {
		defer penilaianRows.Close()
		for penilaianRows.Next() {
			var p models.PenilaianRecord
			if err := penilaianRows.Scan(
				&p.ID, &p.SantriID, &p.SantriName, &p.SantriClass, &p.Gender,
				&p.GuruID, &p.GuruName, &p.Type, &p.CategoryName, &p.UnsurName,
				&p.IndicatorText, &p.Tingkat, &p.Score, &p.Notes, &p.CreatedAt, &p.DateKey,
			); err == nil {
				if strings.ToUpper(p.Type) == "HASANAH" {
					achievements = append(achievements, p)
				} else {
					violations = append(violations, p)
				}
			}
		}
	}

	absenRows, err := pool.Query(ctx, `
		SELECT 
			id, santri_id, santri_name, santri_class, gender,
			guru_id, guru_name, waktu_sholat, date, status, score_impact,
			notes, created_at
		FROM absensi
		WHERE santri_id = $1
		ORDER BY date DESC, created_at DESC
		LIMIT 20
	`, s.ID)
	var recentAbsen []models.AbsensiRecord
	if err == nil {
		defer absenRows.Close()
		for absenRows.Next() {
			var a models.AbsensiRecord
			if err := absenRows.Scan(
				&a.ID, &a.SantriID, &a.SantriName, &a.SantriClass, &a.Gender,
				&a.GuruID, &a.GuruName, &a.WaktuSholat, &a.Date, &a.Status,
				&a.ScoreImpact, &a.Notes, &a.CreatedAt,
			); err == nil {
				recentAbsen = append(recentAbsen, a)
			}
		}
	}

	return nil, SantriDetailOutput{
		Santri:       s,
		Violations:   violations,
		Achievements: achievements,
		RecentAbsen:  recentAbsen,
	}, nil
}

func (th *ToolHandlers) HandleListClasses(ctx context.Context, req *mcp.CallToolRequest, in ListClassesInput) (*mcp.CallToolResult, []models.ClassInfo, error) {
	pool := database.GetPool()
	if pool == nil {
		return nil, nil, fmt.Errorf("database belum terhubung")
	}

	rows, err := pool.Query(ctx, `
		SELECT 
			c.id, c.name, COALESCE(c.gender, 'Putra'),
			COALESCE(c.wali_kelas, ''), COALESCE(c.guru_id, ''),
			COUNT(s.id)::int, COALESCE(ROUND(AVG(s.current_score), 3), 70.000)
		FROM classes c
		LEFT JOIN santri s ON UPPER(s.class) = UPPER(c.name)
		GROUP BY c.id, c.name, c.gender, c.wali_kelas, c.guru_id
		ORDER BY c.name ASC
	`)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var list []models.ClassInfo
	for rows.Next() {
		var cl models.ClassInfo
		if err := rows.Scan(
			&cl.ID, &cl.Name, &cl.Gender, &cl.WaliKelas, &cl.GuruID,
			&cl.StudentCount, &cl.AvgScore,
		); err == nil {
			list = append(list, cl)
		}
	}

	return nil, list, nil
}
