package config

import (
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL   string
	Port          string
	SessionSecret string
	SumopodKey    string
	ByNaraKey     string
	StaticWebDir  string
}

func LoadConfig() *Config {
	_ = godotenv.Load("../.env.local")
	_ = godotenv.Load("../.env")
	_ = godotenv.Load(".env")
	_ = godotenv.Load(".env.local")

	if exe, err := os.Executable(); err == nil {
		exeDir := filepath.Dir(exe)
		_ = godotenv.Load(filepath.Join(exeDir, ".env.local"))
		_ = godotenv.Load(filepath.Join(exeDir, ".env"))
		_ = godotenv.Load(filepath.Join(exeDir, "..", ".env.local"))
		_ = godotenv.Load(filepath.Join(exeDir, "..", ".env"))
	}

	_ = godotenv.Load("/opt/data/home/mizan.apps/.env.local")
	_ = godotenv.Load("/opt/data/home/mizan.apps/.env")

	port := os.Getenv("PORT")
	if port == "" {
		port = os.Getenv("GO_PORT")
	}
	if port == "" {
		port = "3000"
	}

	secret := os.Getenv("SESSION_SECRET")
	if secret == "" {
		secret = "mizan-pesantren-sec-key-2026-auth-secure"
	}

	webDir := os.Getenv("STATIC_WEB_DIR")
	if webDir == "" {
		candidates := []string{
			"./web",
			"./gobackend/web",
			"/opt/data/home/mizan.apps/gobackend/web",
		}
		if exe, err := os.Executable(); err == nil {
			exeDir := filepath.Dir(exe)
			candidates = append([]string{filepath.Join(exeDir, "web")}, candidates...)
		}
		for _, cand := range candidates {
			if info, err := os.Stat(cand); err == nil && info.IsDir() {
				webDir = cand
				break
			}
		}
		if webDir == "" {
			webDir = "./web"
		}
	}

	sumopodKey := os.Getenv("SUMOPOD_API_KEY")
	if sumopodKey == "" {
		sumopodKey = "sk-4itm0rxnVD9ng2dyPI3x3A"
	}

	bynaraKey := os.Getenv("BYNARA_API_KEY")
	if bynaraKey == "" {
		bynaraKey = "sk-nry-0KAezWyaGVZKiUSPmcBpT44F84a7jocNlZCCY7bLn9g"
	}

	return &Config{
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		Port:          port,
		SessionSecret: secret,
		SumopodKey:    sumopodKey,
		ByNaraKey:     bynaraKey,
		StaticWebDir:  webDir,
	}
}
