package handlers

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/database"
	"gobackend/internal/models"
	"gobackend/internal/utils"
)

func GetUsers(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `
		SELECT 
			id, username, name, role, COALESCE(role_title, ''), 
			COALESCE(avatar_initials, ''), COALESCE(avatar_url, ''), 
			gender, COALESCE(assigned_class, ''), is_active
		FROM users 
		ORDER BY name ASC
	`)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	var list []models.UserProfile
	for rows.Next() {
		var u models.UserProfile
		if err := rows.Scan(
			&u.ID, &u.Username, &u.Name, &u.Role, &u.RoleTitle,
			&u.AvatarInitials, &u.AvatarURL, &u.Gender, &u.AssignedClass, &u.IsActive,
		); err == nil {
			list = append(list, u)
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"users":   list,
	})
}

func CreateUser(c *fiber.Ctx) error {
	var u struct {
		Username      string      `json:"username"`
		Password      string      `json:"password"`
		Name          string      `json:"name"`
		Role          models.Role `json:"role"`
		RoleTitle     string      `json:"roleTitle"`
		Gender        string      `json:"gender"`
		AssignedClass string      `json:"assignedClass"`
	}
	if err := c.BodyParser(&u); err != nil || u.Username == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "Data pengguna tidak valid")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	if u.Password == "" {
		u.Password = "RDS123"
	}
	if u.Role == "" {
		u.Role = models.RoleGuru
	}
	initials := "US"
	if len(u.Name) >= 2 {
		initials = strings.ToUpper(u.Name[:2])
	}
	id := fmt.Sprintf("user-%s-%d", strings.ToLower(u.Username), time.Now().Unix())

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, `
		INSERT INTO users (
			id, username, password, name, role, role_title,
			avatar_initials, gender, assigned_class, is_active
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
	`, id, u.Username, u.Password, u.Name, u.Role, u.RoleTitle,
		initials, u.Gender, u.AssignedClass)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, fiber.Map{"id": id}, "Pengguna berhasil ditambahkan")
}

func UpdateUser(c *fiber.Ctx) error {
	var u struct {
		ID            string      `json:"id"`
		Name          string      `json:"name"`
		Role          models.Role `json:"role"`
		RoleTitle     string      `json:"roleTitle"`
		Gender        string      `json:"gender"`
		AssignedClass string      `json:"assignedClass"`
		Password      string      `json:"password"`
		IsActive      *bool       `json:"isActive"`
	}
	if err := c.BodyParser(&u); err != nil || u.ID == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID pengguna dibutuhkan")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, `
		UPDATE users SET
			name = COALESCE(NULLIF($1, ''), name),
			role = COALESCE(NULLIF($2, ''), role),
			role_title = COALESCE(NULLIF($3, ''), role_title),
			gender = COALESCE(NULLIF($4, ''), gender),
			assigned_class = COALESCE(NULLIF($5, ''), assigned_class),
			password = CASE WHEN $6 != '' THEN $6 ELSE password END,
			is_active = COALESCE($7, is_active)
		WHERE id = $8
	`, u.Name, u.Role, u.RoleTitle, u.Gender, u.AssignedClass, u.Password, u.IsActive, u.ID)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Pengguna berhasil diperbarui")
}

func DeleteUser(c *fiber.Ctx) error {
	id := c.Query("id")
	idsStr := c.Query("ids")

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if idsStr != "" {
		ids := strings.Split(idsStr, ",")
		for _, singleID := range ids {
			trimmed := strings.TrimSpace(singleID)
			if trimmed != "" {
				_, _ = pool.Exec(ctx, "DELETE FROM users WHERE id = $1", trimmed)
			}
		}
		return utils.SendSuccess(c, nil, "Pengguna terpilih berhasil dihapus")
	}

	if id == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID pengguna dibutuhkan")
	}

	_, err := pool.Exec(ctx, "DELETE FROM users WHERE id = $1", id)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, nil, "Pengguna berhasil dihapus")
}
