package models

type Santri struct {
	ID                  string  `json:"id"`
	NIS                 string  `json:"nis"`
	Name                string  `json:"name"`
	Gender              string  `json:"gender"`
	Class               string  `json:"class"`
	Asrama              string  `json:"asrama"`
	Kamar               string  `json:"kamar"`
	BaseScore           float64 `json:"baseScore"`
	CurrentScore        float64 `json:"currentScore"`
	Status              string  `json:"status"`
	Avatar              string  `json:"avatar"`
	WaliName            string  `json:"waliName,omitempty"`
	WaliPhone           string  `json:"waliPhone,omitempty"`
	TotalHadir          int     `json:"totalHadir"`
	TotalAlpa           int     `json:"totalAlpa"`
	MusyrifID           string  `json:"musyrifId,omitempty"`
	MusyrifName         string  `json:"musyrifName,omitempty"`
	MusyrifPhone        string  `json:"musyrifPhone,omitempty"`
	RiwayatAlergi       string  `json:"riwayatAlergi,omitempty"`
	RiwayatPenyakit     string  `json:"riwayatPenyakit,omitempty"`
	DailyPocketLimit    float64 `json:"dailyPocketLimit,omitempty"`
	PocketBalance       float64 `json:"pocketBalance,omitempty"`
	CurrentHealthStatus string  `json:"currentHealthStatus,omitempty"`
}

type ClassInfo struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	Gender         string   `json:"gender"`
	WaliKelas      string   `json:"waliKelas"`
	GuruID         string   `json:"guruId"`
	PendampingWali string   `json:"pendampingWali"`
	PendampingID   string   `json:"pendampingId"`
	AsistenWali    []string `json:"asistenWali"`
	StudentCount   int      `json:"studentCount"`
	AvgScore       float64  `json:"avgScore"`
}

type GuruMonitoring struct {
	ID               string `json:"id"`
	Name             string `json:"name"`
	Gender           string `json:"gender"`
	AssignedClass    string `json:"assignedClass"`
	Asrama           string `json:"asrama"`
	LastLogin        string `json:"lastLogin"`
	ReportCountToday int    `json:"reportCountToday"`
	Status           string `json:"status"`
}
