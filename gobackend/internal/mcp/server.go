package mcp

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/modelcontextprotocol/go-sdk/mcp"

	"gobackend/internal/database"
	"gobackend/internal/hub"
)

func NewMizanMCPServer(h *hub.Hub) *mcp.Server {
	impl := &mcp.Implementation{
		Name:        "mizan-mcp",
		Title:       "Mizan Apps MCP Server",
		Description: "Official Model Context Protocol server for Pesantren Modern Raudhatussalam Mahato (Mizan Apps)",
		Version:     "1.0.0",
	}

	opts := &mcp.ServerOptions{
		Instructions: "Mizan MCP provides tools and resources to interact with Mizan Apps backend, database, student records, prayer attendance, behavioral points, and realtime WebSocket notifications.",
	}

	server := mcp.NewServer(impl, opts)
	handlers := NewToolHandlers(h)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "mizan_health",
		Description: "Get the current health, uptime, memory statistics, and database status of the Mizan backend.",
	}, handlers.HandleHealth)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "mizan_list_santri",
		Description: "List santri records with optional filters for class, gender, name/NIS search query, and record limit.",
	}, handlers.HandleListSantri)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "mizan_get_santri_detail",
		Description: "Get complete details for a specific santri, including profile, violations list, achievements list, and recent prayer attendance.",
	}, handlers.HandleGetSantriDetail)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "mizan_list_classes",
		Description: "List all classes with details on gender, assigned homeroom teacher (wali kelas), student count, and average score.",
	}, handlers.HandleListClasses)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "mizan_list_absensi",
		Description: "Query prayer attendance records (Subuh, Dzuhur, Ashar, Maghrib, Isya, Tahajjud, Dhuha) by date, class, or prayer session.",
	}, handlers.HandleListAbsensi)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "mizan_record_absensi",
		Description: "Record or update prayer attendance for a santri and broadcast a realtime event to active WebSocket clients.",
	}, handlers.HandleRecordAbsensi)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "mizan_list_penilaian",
		Description: "List behavioral records (hasanah/prestasi or sayyiah/pelanggaran) with optional filters for santri ID, type, and category.",
	}, handlers.HandleListPenilaian)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "mizan_record_penilaian",
		Description: "Record a behavioral achievement or violation for a santri, update current score, and broadcast a realtime event.",
	}, handlers.HandleRecordPenilaian)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "mizan_list_feedback",
		Description: "List user feedback, bug reports, and suggestions with filters for type and status.",
	}, handlers.HandleListFeedback)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "mizan_broadcast_message",
		Description: "Broadcast a live WebSocket event to connected web clients across channels (absensi, penilaian, feedback, system).",
	}, handlers.HandleBroadcast)

	mcp.AddTool(server, &mcp.Tool{
		Name:        "mizan_sql_read",
		Description: "Execute a read-only SELECT query against the Neon PostgreSQL database for ad-hoc inspection and reporting.",
	}, handlers.HandleSafeSQLRead)

	server.AddResource(&mcp.Resource{
		URI:         "mizan://health",
		Name:        "System Health Status",
		Description: "Current health and runtime metrics of Mizan backend",
		MIMEType:    "application/json",
	}, func(ctx context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		_, healthOut, err := handlers.HandleHealth(ctx, nil, HealthInput{})
		if err != nil {
			return nil, err
		}
		rawBytes, _ := json.MarshalIndent(healthOut, "", "  ")
		return &mcp.ReadResourceResult{
			Contents: []*mcp.ResourceContents{
				{
					URI:      "mizan://health",
					MIMEType: "application/json",
					Text:     string(rawBytes),
				},
			},
		}, nil
	})

	server.AddResource(&mcp.Resource{
		URI:         "mizan://classes",
		Name:        "Classes Master Data",
		Description: "List of classes, homeroom teachers, and student counts",
		MIMEType:    "application/json",
	}, func(ctx context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		_, classesOut, err := handlers.HandleListClasses(ctx, nil, ListClassesInput{})
		if err != nil {
			return nil, err
		}
		rawBytes, _ := json.MarshalIndent(classesOut, "", "  ")
		return &mcp.ReadResourceResult{
			Contents: []*mcp.ResourceContents{
				{
					URI:      "mizan://classes",
					MIMEType: "application/json",
					Text:     string(rawBytes),
				},
			},
		}, nil
	})

	server.AddResource(&mcp.Resource{
		URI:         "mizan://stats/summary",
		Name:        "Statistics Summary",
		Description: "High-level statistics on santri, attendance, and feedback counts",
		MIMEType:    "application/json",
	}, func(ctx context.Context, req *mcp.ReadResourceRequest) (*mcp.ReadResourceResult, error) {
		pool := database.GetPool()
		if pool == nil {
			return nil, fmt.Errorf("database belum terhubung")
		}

		var totalSantri, totalHadirToday, totalFeedbackNew int
		today := time.Now().Format("2006-01-02")
		_ = pool.QueryRow(ctx, "SELECT COUNT(*) FROM santri").Scan(&totalSantri)
		_ = pool.QueryRow(ctx, "SELECT COUNT(*) FROM absensi WHERE date = $1 AND status = 'Hadir'", today).Scan(&totalHadirToday)
		_ = pool.QueryRow(ctx, "SELECT COUNT(*) FROM feedbacks WHERE status = 'Baru'").Scan(&totalFeedbackNew)

		stats := map[string]any{
			"date":              today,
			"totalSantri":       totalSantri,
			"totalHadirToday":   totalHadirToday,
			"pendingFeedbacks":  totalFeedbackNew,
			"timestamp":         time.Now().Format(time.RFC3339),
		}
		rawBytes, _ := json.MarshalIndent(stats, "", "  ")
		return &mcp.ReadResourceResult{
			Contents: []*mcp.ResourceContents{
				{
					URI:      "mizan://stats/summary",
					MIMEType: "application/json",
					Text:     string(rawBytes),
				},
			},
		}, nil
	})

	server.AddPrompt(&mcp.Prompt{
		Name:        "santri-evaluation",
		Description: "Generate a comprehensive pastoral and behavioral evaluation for a santri.",
		Arguments: []*mcp.PromptArgument{
			{
				Name:        "santri_id",
				Description: "ID or NIS of the santri to evaluate",
				Required:    true,
			},
		},
	}, func(ctx context.Context, req *mcp.GetPromptRequest) (*mcp.GetPromptResult, error) {
		santriID := ""
		if req != nil && req.Params != nil && req.Params.Arguments != nil {
			santriID = req.Params.Arguments["santri_id"]
		}
		promptText := fmt.Sprintf("Mohon buatkan laporan evaluasi komprehensif untuk santri dengan ID/NIS '%s'. Gunakan tool mizan_get_santri_detail untuk memeriksa riwayat kedisiplinan, skor adab saat ini, absensi sholat, serta prestasi (hasanah) dan pelanggaran (sayyiah). Berikan rekomendasi pembinaan yang solutif.", santriID)

		return &mcp.GetPromptResult{
			Description: "Pastoral and behavioral evaluation prompt",
			Messages: []*mcp.PromptMessage{
				{
					Role: "user",
					Content: &mcp.TextContent{
						Text: promptText,
					},
				},
			},
		}, nil
	})

	server.AddPrompt(&mcp.Prompt{
		Name:        "attendance-digest",
		Description: "Generate a daily prayer attendance analysis report for a given date.",
		Arguments: []*mcp.PromptArgument{
			{
				Name:        "date",
				Description: "Date to evaluate in YYYY-MM-DD format (defaults to today)",
				Required:    false,
			},
		},
	}, func(ctx context.Context, req *mcp.GetPromptRequest) (*mcp.GetPromptResult, error) {
		dateStr := time.Now().Format("2006-01-02")
		if req != nil && req.Params != nil && req.Params.Arguments != nil && req.Params.Arguments["date"] != "" {
			dateStr = req.Params.Arguments["date"]
		}
		promptText := fmt.Sprintf("Buatkan ringkasan kehadiran sholat berjamaah untuk tanggal '%s'. Gunakan tool mizan_list_absensi untuk menganalisis tingkat kehadiran jamaah santri (Subuh s/d Tahajjud), serta identifikasi santri yang sakit, izin, atau alpa.", dateStr)

		return &mcp.GetPromptResult{
			Description: "Prayer attendance digest prompt",
			Messages: []*mcp.PromptMessage{
				{
					Role: "user",
					Content: &mcp.TextContent{
						Text: promptText,
					},
				},
			},
		}, nil
	})

	server.AddPrompt(&mcp.Prompt{
		Name:        "bug-investigation",
		Description: "Analyze a reported bug or issue from feedback and propose a fix.",
		Arguments: []*mcp.PromptArgument{
			{
				Name:        "type",
				Description: "Filter type: BUG or SARAN",
				Required:    false,
			},
		},
	}, func(ctx context.Context, req *mcp.GetPromptRequest) (*mcp.GetPromptResult, error) {
		promptText := "Gunakan tool mizan_list_feedback untuk mengambil daftar laporan bug terbaru dengan status 'Baru'. Untuk setiap bug, analisis deskripsi dan halaman terkait, lalu susun diagnosis akar masalah dan langkah perbaikan kode."

		return &mcp.GetPromptResult{
			Description: "Bug investigation prompt",
			Messages: []*mcp.PromptMessage{
				{
					Role: "user",
					Content: &mcp.TextContent{
						Text: promptText,
					},
				},
			},
		}, nil
	})

	return server
}
