package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var globalPool *pgxpool.Pool

func InitDB(databaseURL string) (*pgxpool.Pool, error) {
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL kosong")
	}

	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}

	config.MaxConns = 10
	config.MinConns = 2
	config.MaxConnIdleTime = 30 * time.Second
	config.MaxConnLifetime = 1 * time.Hour

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, err
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, err
	}

	globalPool = pool
	_ = ensureTables(ctx, pool)

	return pool, nil
}

func GetPool() *pgxpool.Pool {
	return globalPool
}

func ensureTables(ctx context.Context, pool *pgxpool.Pool) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS feedbacks (
			id VARCHAR(64) PRIMARY KEY,
			type VARCHAR(16) NOT NULL,
			category VARCHAR(64) NOT NULL,
			title VARCHAR(255) NOT NULL,
			description TEXT NOT NULL,
			page_url VARCHAR(255),
			user_id VARCHAR(64),
			user_name VARCHAR(128),
			user_role VARCHAR(32),
			ai_analysis JSONB,
			custom_prompt TEXT,
			status VARCHAR(32) DEFAULT 'Baru',
			admin_notes TEXT,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS public_shares (
			id VARCHAR(64) PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			type VARCHAR(32) NOT NULL,
			period VARCHAR(64) NOT NULL,
			scope VARCHAR(64) NOT NULL,
			data JSONB NOT NULL,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			expires_at TIMESTAMPTZ
		);`,
		`ALTER TABLE public_shares ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;`,
		`UPDATE public_shares SET expires_at = NOW() + INTERVAL '30 days' WHERE expires_at IS NULL;`,
		`CREATE TABLE IF NOT EXISTS notifications (
			id VARCHAR(64) PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			message TEXT NOT NULL,
			time VARCHAR(64),
			category VARCHAR(64) NOT NULL,
			type VARCHAR(32) NOT NULL,
			link VARCHAR(255),
			is_active BOOLEAN DEFAULT true,
			target_role VARCHAR(32) DEFAULT 'ALL',
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		);`,
	}

	for _, q := range queries {
		_, _ = pool.Exec(ctx, q)
	}
	return nil
}
