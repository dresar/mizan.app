package middleware

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/models"
	"gobackend/internal/utils"
)

func GenerateSessionToken(user models.UserProfile, secret string) (string, error) {
	exp := time.Now().Add(24 * 7 * time.Hour).Unix()
	payload := models.SessionPayload{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		Exp:      exp,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	payloadB64 := base64.RawURLEncoding.EncodeToString(payloadBytes)

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payloadB64))
	sig := mac.Sum(nil)
	sigB64 := base64.RawURLEncoding.EncodeToString(sig)

	return payloadB64 + "." + sigB64, nil
}

func VerifySessionToken(tokenString string, secret string) (*models.SessionPayload, error) {
	parts := strings.Split(tokenString, ".")
	if len(parts) != 2 {
		return nil, fiber.ErrUnauthorized
	}

	payloadB64, sigB64 := parts[0], parts[1]

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payloadB64))
	expectedSig := mac.Sum(nil)
	expectedSigB64 := base64.RawURLEncoding.EncodeToString(expectedSig)

	if !hmac.Equal([]byte(sigB64), []byte(expectedSigB64)) {
		return nil, fiber.ErrUnauthorized
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(payloadB64)
	if err != nil {
		return nil, fiber.ErrUnauthorized
	}

	var payload models.SessionPayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return nil, fiber.ErrUnauthorized
	}

	if payload.Exp < time.Now().Unix() {
		return nil, fiber.ErrUnauthorized
	}

	return &payload, nil
}

func AuthRequired(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		token := c.Cookies("mizan_session")
		if token == "" {
			authHeader := c.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				token = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if token == "" {
			return utils.SendError(c, fiber.StatusUnauthorized, "Sesi tidak ditemukan")
		}

		payload, err := VerifySessionToken(token, secret)
		if err != nil {
			return utils.SendError(c, fiber.StatusUnauthorized, "Sesi tidak valid atau telah kedaluwarsa")
		}

		c.Locals("user_id", payload.UserID)
		c.Locals("username", payload.Username)
		c.Locals("role", payload.Role)

		return c.Next()
	}
}

func RequireRoles(allowedRoles ...models.Role) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleVal := c.Locals("role")
		role, ok := roleVal.(models.Role)
		if !ok {
			return utils.SendError(c, fiber.StatusForbidden, "Akses ditolak")
		}
		for _, r := range allowedRoles {
			if r == role {
				return c.Next()
			}
		}
		return utils.SendError(c, fiber.StatusForbidden, "Akses ditolak: Anda tidak memiliki wewenang")
	}
}
