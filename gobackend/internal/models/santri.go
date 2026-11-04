package models

type Santri struct {
	ID           string  `json:"id"`
	NIS          string  `json:"nis"`
	Name         string  `json:"name"`
	Gender       string  `json:"gender"`
	Class        string  `json:"class"`
	Asrama       string  `json:"asrama"`
	Kamar        string  `json:"kamar"`
	BaseScore    float64 `json:"baseScore"`
	CurrentScore float64 `json:"currentScore"`
	Status       string  `json:"status"`
	Avatar       string  `json:"avatar"`
	WaliName     string  `json:"waliName,omitempty"`
	WaliPhone    string  `json:"waliPhone,omitempty"`
	TotalHadir   int     `json:"totalHadir"`
	TotalAlpa    int     `json:"totalAlpa"`
}

type ClassInfo struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	Gender       string  `json:"gender"`
	WaliKelas    string  `json:"waliKelas"`
	GuruID       string  `json:"guruId"`
	StudentCount int     `json:"studentCount"`
	AvgScore     float64 `json:"avgScore"`
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
