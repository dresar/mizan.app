package mcp

import (
	"gobackend/internal/models"
)

type HealthInput struct{}

type HealthOutput struct {
	Status     string `json:"status"`
	Engine     string `json:"engine"`
	Uptime     string `json:"uptime"`
	Clients    int    `json:"clients"`
	AllocMB    string `json:"allocMb"`
	SysMB      string `json:"sysMb"`
	Goroutines int    `json:"goroutines"`
	DBStatus   string `json:"dbStatus"`
}

type ListSantriInput struct {
	Class  string `json:"class,omitempty" jsonschema:"Filter santri by class name, e.g. 5A, 5B, 6A"`
	Gender string `json:"gender,omitempty" jsonschema:"Filter santri by gender: Putra or Putri"`
	Query  string `json:"query,omitempty" jsonschema:"Search query for santri name or NIS"`
	Limit  int    `json:"limit,omitempty" jsonschema:"Maximum number of records to return (default 50, max 200)"`
}

type GetSantriDetailInput struct {
	SantriID string `json:"santri_id" jsonschema:"Santri ID (e.g. santri-221488) or NIS (e.g. 221488)"`
}

type SantriDetailOutput struct {
	Santri       models.Santri            `json:"santri"`
	Violations   []models.PenilaianRecord `json:"violations"`
	Achievements []models.PenilaianRecord `json:"achievements"`
	RecentAbsen  []models.AbsensiRecord   `json:"recentAbsensi"`
}

type ListClassesInput struct{}

type ListAbsensiInput struct {
	Date        string `json:"date,omitempty" jsonschema:"Attendance date in YYYY-MM-DD format"`
	Class       string `json:"class,omitempty" jsonschema:"Optional class filter"`
	WaktuSholat string `json:"waktu_sholat,omitempty" jsonschema:"Optional prayer time: Subuh, Dzuhur, Ashar, Maghrib, Isya, Tahajjud, Dhuha"`
	Limit       int    `json:"limit,omitempty" jsonschema:"Maximum records to return (default 50)"`
}

type RecordAbsensiInput struct {
	SantriID    string `json:"santri_id" jsonschema:"Santri ID (required)"`
	Date        string `json:"date" jsonschema:"Date in YYYY-MM-DD format (required)"`
	WaktuSholat string `json:"waktu_sholat" jsonschema:"Prayer session: Subuh, Dzuhur, Ashar, Maghrib, Isya, Tahajjud, Dhuha (required)"`
	Status      string `json:"status" jsonschema:"Attendance status: Hadir, Sakit, Izin, Alpa (required)"`
	GuruName    string `json:"guru_name,omitempty" jsonschema:"Name of recording teacher/pembina"`
	Notes       string `json:"notes,omitempty" jsonschema:"Optional attendance notes"`
}

type ListPenilaianInput struct {
	SantriID     string `json:"santri_id,omitempty" jsonschema:"Optional santri ID filter"`
	Type         string `json:"type,omitempty" jsonschema:"Filter type: HASANAH or SAYYIAH"`
	CategoryName string `json:"category_name,omitempty" jsonschema:"Optional category name filter"`
	Limit        int    `json:"limit,omitempty" jsonschema:"Maximum records to return (default 50)"`
}

type RecordPenilaianInput struct {
	SantriID      string  `json:"santri_id" jsonschema:"Santri ID (required)"`
	Type          string  `json:"type" jsonschema:"Assessment type: HASANAH or SAYYIAH (required)"`
	CategoryName  string  `json:"category_name" jsonschema:"Category name (required)"`
	UnsurName     string  `json:"unsur_name,omitempty" jsonschema:"Unsur name"`
	IndicatorText string  `json:"indicator_text" jsonschema:"Indicator description or violation detail (required)"`
	Score         float64 `json:"score" jsonschema:"Score impact points (required)"`
	Notes         string  `json:"notes,omitempty" jsonschema:"Notes or context"`
	GuruName      string  `json:"guru_name,omitempty" jsonschema:"Name of teacher/pembina"`
}

type ListFeedbackInput struct {
	Type   string `json:"type,omitempty" jsonschema:"Feedback type filter: BUG or SARAN"`
	Status string `json:"status,omitempty" jsonschema:"Status filter: Baru, Ditinjau, Diproses, Selesai, Ditolak"`
	Limit  int    `json:"limit,omitempty" jsonschema:"Maximum records to return (default 50)"`
}

type BroadcastMessageInput struct {
	Channel string `json:"channel" jsonschema:"WebSocket channel: absensi, penilaian, feedback, system (required)"`
	Action  string `json:"action" jsonschema:"Action name: created, updated, alert (required)"`
	Message string `json:"message" jsonschema:"Message or event data (required)"`
}

type SafeSQLReadInput struct {
	Query string `json:"query" jsonschema:"Safe read-only SQL query starting with SELECT"`
}
