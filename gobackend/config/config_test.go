package config

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoadConfig(t *testing.T) {
	cfg := LoadConfig()
	assert.NotNil(t, cfg)
	assert.NotEmpty(t, cfg.Port)
	assert.NotEmpty(t, cfg.SessionSecret)
	assert.NotEmpty(t, cfg.StaticWebDir)
	assert.NotEmpty(t, cfg.StaticPublicWebDir)
}

func TestStaticPublicWebDirEnvOverride(t *testing.T) {
	orig := os.Getenv("STATIC_PUBLIC_WEB_DIR")
	defer func() {
		if orig != "" {
			_ = os.Setenv("STATIC_PUBLIC_WEB_DIR", orig)
		} else {
			_ = os.Unsetenv("STATIC_PUBLIC_WEB_DIR")
		}
	}()

	customDir := filepath.Join(os.TempDir(), "test_web_public")
	_ = os.Setenv("STATIC_PUBLIC_WEB_DIR", customDir)

	cfg := LoadConfig()
	assert.Equal(t, customDir, cfg.StaticPublicWebDir)
}
