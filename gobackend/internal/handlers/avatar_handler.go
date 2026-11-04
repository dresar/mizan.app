package handlers

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/database"
	"gobackend/internal/utils"
)

func UploadAvatar(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return utils.SendError(c, fiber.StatusBadRequest, "Berkas gambar tidak ditemukan")
	}

	userId := c.FormValue("userId")
	if userId == "" {
		userId = "anonymous"
	}

	uploadDir := "./web/avatars"
	_ = os.MkdirAll(uploadDir, 0755)

	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s-%d%s", userId, time.Now().Unix(), ext)
	dst := filepath.Join(uploadDir, filename)

	if err := c.SaveFile(file, dst); err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, "Gagal menyimpan berkas avatar")
	}

	avatarURL := "/avatars/" + filename

	pool := database.GetPool()
	if pool != nil && userId != "anonymous" {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_, _ = pool.Exec(ctx, "UPDATE users SET avatar_url = $1 WHERE id = $2", avatarURL, userId)
	}

	return utils.SendSuccess(c, fiber.Map{
		"avatarUrl": avatarURL,
	}, "Avatar berhasil diunggah")
}
