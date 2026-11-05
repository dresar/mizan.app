package database

import (
	"context"
	_ "embed"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed schema.sql
var schemaSQL string

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
	if schemaSQL != "" {
		_, _ = pool.Exec(ctx, schemaSQL)
	}

	queries := []string{
		`ALTER TABLE public_shares ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;`,
		`UPDATE public_shares SET expires_at = NOW() + INTERVAL '30 days' WHERE expires_at IS NULL;`,
		`ALTER TABLE santri ADD COLUMN IF NOT EXISTS musyrif_id VARCHAR(64) DEFAULT '';`,
		`ALTER TABLE santri ADD COLUMN IF NOT EXISTS musyrif_name VARCHAR(128) DEFAULT '';`,
		`ALTER TABLE santri ADD COLUMN IF NOT EXISTS musyrif_phone VARCHAR(32) DEFAULT '';`,
		`ALTER TABLE santri ADD COLUMN IF NOT EXISTS riwayat_alergi TEXT DEFAULT '';`,
		`ALTER TABLE santri ADD COLUMN IF NOT EXISTS riwayat_penyakit TEXT DEFAULT '';`,
		`ALTER TABLE santri ADD COLUMN IF NOT EXISTS daily_pocket_limit NUMERIC(12,2) DEFAULT 25000;`,
		`ALTER TABLE santri ADD COLUMN IF NOT EXISTS pocket_balance NUMERIC(12,2) DEFAULT 0;`,
		`ALTER TABLE santri ADD COLUMN IF NOT EXISTS current_health_status VARCHAR(32) DEFAULT 'Sehat';`,
	}

	for _, q := range queries {
		_, _ = pool.Exec(ctx, q)
	}
	return nil
}
