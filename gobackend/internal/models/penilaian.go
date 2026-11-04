package models

type PenilaianRecord struct {
	ID             string  `json:"id"`
	SantriID       string  `json:"santriId"`
	SantriName     string  `json:"santriName"`
	SantriClass    string  `json:"santriClass"`
	Gender         string  `json:"gender"`
	GuruID         string  `json:"guruId"`
	GuruName       string  `json:"guruName"`
	Type           string  `json:"type"`
	CategoryName   string  `json:"categoryName"`
	UnsurName      string  `json:"unsurName"`
	IndicatorText  string  `json:"indicatorText"`
	Tingkat        string  `json:"tingkat"`
	Score          float64 `json:"score"`
	Notes          string  `json:"notes"`
	ProofFileName  *string `json:"proofFileName,omitempty"`
	ProofFileSize  *int    `json:"proofFileSize,omitempty"`
	CreatedAt      string  `json:"createdAt"`
	DateKey        string  `json:"dateKey"`
	SanggahanText  *string `json:"sanggahanText,omitempty"`
	SanggahanBy    *string `json:"sanggahanBy,omitempty"`
	SanggahanAt    *string `json:"sanggahanAt,omitempty"`
	SanggahanState *string `json:"sanggahanStatus,omitempty"`
}

type Indikator struct {
	ID           string  `json:"id"`
	Text         string  `json:"text"`
	Type         string  `json:"type"`
	DefaultScore float64 `json:"defaultScore"`
	Tingkat      string  `json:"tingkat,omitempty"`
}

type Unsur struct {
	ID           string      `json:"id"`
	Name         string      `json:"name"`
	Type         string      `json:"type,omitempty"`
	CategoryName string      `json:"categoryName,omitempty"`
	Indicators   []Indikator `json:"indicators,omitempty"`
}

type Kategori struct {
	ID     string  `json:"id"`
	Code   string  `json:"code"`
	Name   string  `json:"name"`
	Unsurs []Unsur `json:"unsurs,omitempty"`
}
