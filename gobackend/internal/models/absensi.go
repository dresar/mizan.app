package models

type AbsensiRecord struct {
	ID           string  `json:"id"`
	SantriID     string  `json:"santriId"`
	SantriName   string  `json:"santriName"`
	SantriClass  string  `json:"santriClass"`
	Gender       string  `json:"gender"`
	GuruID       string  `json:"guruId"`
	GuruName     string  `json:"guruName"`
	WaktuSholat  string  `json:"waktuSholat"`
	Date         string  `json:"date"`
	Status       string  `json:"status"`
	ScoreImpact  float64 `json:"scoreImpact"`
	Notes        *string `json:"notes"`
	CreatedAt    string  `json:"createdAt"`
	RawCreatedAt string  `json:"rawCreatedAt,omitempty"`
}

type BatchAbsensiItem struct {
	SantriID    string  `json:"santriId"`
	Status      string  `json:"status"`
	Notes       *string `json:"notes,omitempty"`
	ScoreImpact float64 `json:"scoreImpact"`
}

type BatchAbsensiPayload struct {
	Date        string             `json:"date"`
	WaktuSholat string             `json:"waktuSholat"`
	GuruID      string             `json:"guruId"`
	GuruName    string             `json:"guruName"`
	Class       string             `json:"class"`
	Gender      string             `json:"gender"`
	Records     []BatchAbsensiItem `json:"records"`
}
