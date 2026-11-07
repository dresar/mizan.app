<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🤖 Mizan Apps — Agent Instructions & Boundaries

## 1. Domain Separation (STRICT)
- **`mizan.agentai.my.id` (Mizan Internal)**:
  - Source: `app/` (Next.js 16, exported to `gobackend/web/`).
  - Roles: `SUPER_ADMIN`, `PENGASUHAN`, `GURU`, `SATPAM`, `ORTU`.
  - Routes: `/admin/*`, `/bk/*`, `/guru/*`, `/satpam`, `/ortu/*`, `/login`.
  - NEVER redirect to `agentai.my.id` except for `/admin-cms`.
- **`agentai.my.id` (Portal Publik & CMS)**:
  - Source: `portal/` (Vite React SPA, built to `gobackend/web_public/`).
  - Roles: `adminwebsite`, `author`/`penulis`, `santri`/PSB.
  - Routes: `/`, `/berita/*`, `/galeri`, `/fasilitas`, `/psb/*`, `/admin-cms`, `/author/*`.
  - Mizan routes (`/admin/*`, `/bk/*`, `/guru/*`, `/satpam`, `/ortu/*`) accessed here are 302 redirected to `https://mizan.agentai.my.id/...`.

## 2. Build & Resource Constraints (VPS cgroup 4GB RAM)
- **Next.js Static Export**: Always build with Webpack & 1 CPU thread to prevent cgroup OOM kills:
  `NEXT_CPU_COUNT=1 NODE_OPTIONS="--max-old-space-size=768" npx next build --webpack`
- After build, copy export to Go server:
  `cp -r out/* gobackend/web/`
- **Portal Vite Build**:
  `cd portal && npm run build` (outputs directly to `gobackend/web_public/`)
- **Go Server Binary**:
  `cd gobackend && go build -o mizan-server ./cmd/server`
  Restart: `kill $(pgrep -f "mizan-server" | head -n 1)` (auto-restarted by `scripts/run-server.sh`)

## 3. Code Standards
- **Zero Comments (NOKOMEN)** in Go, TypeScript, and TSX files.
- **Ponytail YAGNI**: Write the absolute minimum code to solve the problem. Standard library first.
