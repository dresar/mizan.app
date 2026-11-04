package config

import (
	"os"

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

	port := os.Getenv("PORT")
	if port == "" {
		port = os.Getenv("GO_PORT")
	}
	if port == "" {
		port = "4000"
	}

	secret := os.Getenv("SESSION_SECRET")
	if secret == "" {
		secret = "mizan-pesantren-sec-key-2026-auth-secure"
	}

	webDir := os.Getenv("STATIC_WEB_DIR")
	if webDir == "" {
		webDir = "./web"
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
