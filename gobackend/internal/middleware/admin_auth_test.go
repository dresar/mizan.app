package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestAdminJWTGenerationAndVerification(t *testing.T) {
	secret := "test-secret-key-12345"
	claims := AdminClaims{
		ID:          1,
		Username:    "admin",
		Email:       "admin@pesantren.com",
		Role:        "superadmin",
		IsSuperuser: true,
		Exp:         time.Now().Add(1 * time.Hour).Unix(),
	}

	token, err := GenerateAdminJWT(claims, secret)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	verified, err := VerifyAdminJWT(token, secret)
	assert.NoError(t, err)
	assert.Equal(t, claims.ID, verified.ID)
	assert.Equal(t, claims.Username, verified.Username)
	assert.Equal(t, claims.Role, verified.Role)
	assert.True(t, verified.IsSuperuser)

	_, err = VerifyAdminJWT(token, "wrong-secret")
	assert.Error(t, err)

	expiredClaims := claims
	expiredClaims.Exp = time.Now().Add(-1 * time.Hour).Unix()
	expiredToken, err := GenerateAdminJWT(expiredClaims, secret)
	assert.NoError(t, err)

	_, err = VerifyAdminJWT(expiredToken, secret)
	assert.Error(t, err)
}

func TestAdminJWTAuthMiddleware(t *testing.T) {
	secret := "test-secret-key-12345"
	app := fiber.New()

	app.Get("/protected", AdminJWTAuth(secret), func(c *fiber.Ctx) error {
		user := c.Locals("admin_user").(*AdminClaims)
		return c.JSON(fiber.Map{"status": "ok", "user": user.Username})
	})

	reqNoToken := httptest.NewRequest("GET", "/protected", nil)
	resp, err := app.Test(reqNoToken)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)

	reqInvalidToken := httptest.NewRequest("GET", "/protected", nil)
	reqInvalidToken.Header.Set("Authorization", "Bearer invalidtoken")
	resp, err = app.Test(reqInvalidToken)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)

	reqNonBearer := httptest.NewRequest("GET", "/protected", nil)
	reqNonBearer.Header.Set("Authorization", "Token something")
	resp, err = app.Test(reqNonBearer)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)

	claims := AdminClaims{
		ID:          1,
		Username:    "admin",
		Email:       "admin@pesantren.com",
		Role:        "superadmin",
		IsSuperuser: true,
		Exp:         time.Now().Add(1 * time.Hour).Unix(),
	}
	validToken, _ := GenerateAdminJWT(claims, secret)

	reqValid := httptest.NewRequest("GET", "/protected", nil)
	reqValid.Header.Set("Authorization", "Bearer "+validToken)
	resp, err = app.Test(reqValid)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}
