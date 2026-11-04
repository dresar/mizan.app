package models

type MizanNotification struct {
	ID         string `json:"id"`
	Title      string `json:"title"`
	Message    string `json:"message"`
	Time       string `json:"time,omitempty"`
	Category   string `json:"category"`
	Type       string `json:"type"`
	Link       string `json:"link,omitempty"`
	IsActive   bool   `json:"isActive"`
	TargetRole string `json:"targetRole,omitempty"`
	CreatedAt  string `json:"createdAt,omitempty"`
	UpdatedAt  string `json:"updatedAt,omitempty"`
}
