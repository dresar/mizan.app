package models

type Role string

const (
	RoleSuperAdmin Role = "SUPER_ADMIN"
	RolePengasuhan Role = "PENGASUHAN"
	RoleGuru       Role = "GURU"
	RoleOrtu       Role = "ORTU"
	RoleSatpam     Role = "SATPAM"
)

type UserProfile struct {
	ID             string `json:"id"`
	Username       string `json:"username"`
	Name           string `json:"name"`
	Role           Role   `json:"role"`
	RoleTitle      string `json:"roleTitle"`
	AvatarInitials string `json:"avatarInitials"`
	AvatarURL      string `json:"avatarUrl,omitempty"`
	Gender         string `json:"gender"`
	AssignedClass  string `json:"assignedClass"`
	IsActive       bool   `json:"isActive"`
	SantriID       string `json:"santriId,omitempty"`
}

type UserWithPassword struct {
	UserProfile
	Password string `json:"password,omitempty"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type UpdatePasswordRequest struct {
	UserID      string `json:"userId"`
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

type SessionPayload struct {
	UserID   string `json:"userId"`
	Username string `json:"username"`
	Role     Role   `json:"role"`
	Exp      int64  `json:"exp"`
}
