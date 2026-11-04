package models

type FeedbackType string
type FeedbackStatus string
type FeedbackSeverity string

const (
	FeedbackTypeSaran FeedbackType = "SARAN"
	FeedbackTypeBug   FeedbackType = "BUG"

	StatusNew       FeedbackStatus = "Baru"
	StatusReviewed  FeedbackStatus = "Ditinjau"
	StatusProcessed FeedbackStatus = "Diproses"
	StatusDone      FeedbackStatus = "Selesai"
	StatusRejected  FeedbackStatus = "Ditolak"
)

type AIAnalysisResult struct {
	Summary              string   `json:"summary"`
	RootCause            string   `json:"rootCause"`
	AffectedFiles        []string `json:"affectedFiles"`
	Severity             string   `json:"severity"`
	RecommendationPrompt string   `json:"recommendationPrompt"`
	GeneratedAt          string   `json:"generatedAt"`
}

type FeedbackRecord struct {
	ID           string            `json:"id"`
	Type         FeedbackType      `json:"type"`
	Category     string            `json:"category"`
	Title        string            `json:"title"`
	Description  string            `json:"description"`
	PageURL      string            `json:"pageUrl"`
	UserID       string            `json:"userId"`
	UserName     string            `json:"userName"`
	UserRole     string            `json:"userRole"`
	AIAnalysis   *AIAnalysisResult `json:"aiAnalysis,omitempty"`
	CustomPrompt string            `json:"customPrompt,omitempty"`
	Status       FeedbackStatus    `json:"status"`
	AdminNotes   string            `json:"adminNotes,omitempty"`
	CreatedAt    string            `json:"createdAt"`
	UpdatedAt    string            `json:"updatedAt,omitempty"`
}

type AnalyzeRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	PageURL     string `json:"pageUrl"`
	UserRole    string `json:"userRole"`
}
