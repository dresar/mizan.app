# Project: Pesantren Hub & Golang Fiber Backend Integration

## Architecture
- Dual-Entrypoint Frontend (`pesantren-hub`):
  - Public portal entrypoint: `index.html` -> `src/main.tsx` -> `PublicApp.tsx`
  - Admin CMS entrypoint: `admin.html` -> `src/admin-main.tsx` -> `AdminApp.tsx` (using `React.lazy()` for admin pages to prevent memory exhaustion / OOM 137)
  - Vite bundler config (`vite.config.ts`) outputs dual entrypoints and hashed assets in `dist/assets/*`
  - Production build copied to `/opt/data/home/mizan.apps/gobackend/web_public/`
- Backend Server (`gobackend`):
  - Framework: Golang Fiber v2 (`cmd/server/main.go`, `config/config.go`)
  - Database: Neon PostgreSQL (`pgx/v5` connection pool)
  - Dual Static Serving:
    - Root `/` & public routes: `./web_public/index.html` (SPA fallback)
    - CMS routes: `/admin.html`, `/admin-cms`, `/admin-cms/*` -> `./web_public/admin.html`
    - Vite assets: `/assets/*` -> `./web_public/assets/*` (1-year immutable caching)
    - SEO endpoints: `/robots.txt` (`text/plain`), `/sitemap.xml` (`application/xml`) -> `./web_public/`
    - Operational Mizan Apps: `/admin/*`, `/bk/*`, `/guru/*`, `/santri/*`, `/login`, `/_next/*` -> `./web/` (strictly preserved)
  - API Endpoints (`internal/handlers/`):
    - Public Unauthenticated (`/api/v1/public/*` and legacy aliases)
    - Protected Admin CMS (`/api/v1/admin/*`) via HS256 JWT auth
  - Code Constraints:
    - Strict NOKOMEN (zero comments in Go and TypeScript/React code)
    - Strict app isolation: zero modifications to `/opt/data/home/mizan.apps/app/`

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dual-Entry Vite Build | Multi-page app outputting `index.html` and `admin.html` with memory-optimized lazy admin imports | M1 | R1, Survey 1 |
| 2 | Asset Integration | Copying Vite `dist/*` to `gobackend/web_public/` | M1 | R1, Survey 1 |
| 3 | Public Portal SEO Tags | Meta title, description, canonical link, Open Graph, and Twitter Cards | M1 | R4, Survey 1 |
| 4 | Schema.org Structured Data | Combined `WebSite` and `EducationalOrganization` JSON-LD schema in `index.html` | M1 | R4, Survey 1 |
| 5 | SEO Static Files | Direct delivery of `robots.txt` and `sitemap.xml` | M1 | R4, Survey 1 |
| 6 | Fiber Dual Static Serving | Routing root `/` to public portal and `/admin.html` / `/admin-cms` to CMS | M2 | R2, Survey 2 |
| 7 | Vite Asset Serving | Serving `/assets/*` with immutable cache without colliding with `/_next/*` | M2 | R2, Survey 2 |
| 8 | Mizan Operational Preservation | Preserving `/admin/*`, `/bk/*`, `/guru/*`, `/santri/*` serving from `./web` | M2 | R2, Survey 2 |
| 9 | Database Schema Initialization | Embedding & executing `portal_schema.sql` for `core_*`, `blog_*`, `admissions_*`, `users_user` | M3 | R3, Survey 3 |
| 10 | Public Website Settings API | `GET /api/v1/public/website-settings` | M3 | R3, Survey 3 |
| 11 | Public Hero Section API | `GET /api/v1/public/hero-section` | M3 | R3, Survey 3 |
| 12 | Public Visi Misi API | `GET /api/v1/public/visi-misi` | M3 | R3, Survey 3 |
| 13 | Public Fasilitas API | `GET /api/v1/public/fasilitas` | M3 | R3, Survey 3 |
| 14 | Public Tenaga Pengajar API | `GET /api/v1/public/tenaga-pengajar` | M3 | R3, Survey 3 |
| 15 | Public Blog Posts API | `GET /api/v1/public/posts` and `GET /api/v1/public/posts/:slug` | M3 | R3, Survey 3 |
| 16 | Public PSB Registration API | `POST /api/v1/public/psb/daftar` persisting applicant to Neon PostgreSQL | M3 | R3, Survey 3 |
| 17 | Admin JWT Authentication | Login, token issuance, and `AdminJWTAuth` middleware rejecting unauthorized with 401 | M3 | R3, Survey 3 |
| 18 | Admin CMS Generic API | `GET/POST/PUT/DELETE /api/v1/admin/cms/:section` | M3 | R3, Survey 3 |
| 19 | Admin Blog Posts Management | `GET/POST/PUT/DELETE /api/v1/admin/blog/posts` | M3 | R3, Survey 3 |
| 20 | Admin PSB Applicant Management | `GET/POST/PUT /api/v1/admin/psb/pendaftar` | M3 | R3, Survey 3 |
| 21 | E2E Test Suite (Tiers 1-4) | Requirement-driven opaque-box verification of all 20 features | M4 | R1-R5 |
| 22 | Adversarial Coverage Hardening (Tier 5) | White-box adversarial testing and integrity audit | M4 | Project Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Frontend Dual-Entry & SEO | Configure Vite MPA, create `admin.html` + lazy admin imports, augment SEO/Schema.org, build & copy to `web_public` | none | PLANNED |
| M2 | Golang Fiber Routing & Domain Separation | Update `cmd/server/main.go` and `config/config.go` for dual static serving & Mizan preservation | none | PLANNED |
| M3 | Port API Endpoints & Neon DB | Database table initialization, public unauthenticated APIs, JWT auth, and admin CMS APIs | none | PLANNED |
| M4 | Final Milestone: E2E Verification & Audit | 100% E2E test pass (Tiers 1-4), adversarial test hardening (Tier 5), forensic integrity audit | M1, M2, M3 | PLANNED |

## Code Layout
- Frontend (`/opt/data/home/pesantren-hub`):
  - `admin.html`: CMS entry HTML
  - `index.html`: Public portal entry HTML with augmented Schema.org JSON-LD
  - `src/main.tsx`: Public portal bootstrap
  - `src/admin-main.tsx`: CMS portal bootstrap
  - `src/App.tsx`: Refactored to public portal routes only
  - `src/AdminApp.tsx`: Lazy-loaded CMS admin routes
  - `vite.config.ts`: Multi-page rollup configuration
- Backend (`/opt/data/home/mizan.apps/gobackend`):
  - `cmd/server/main.go`: Dual static file serving & route registration (NOKOMEN)
  - `config/config.go`: Configuration with `StaticPublicWebDir` (NOKOMEN)
  - `internal/database/portal_schema.sql`: Embedded DDL for portal tables
  - `internal/database/postgres.go`: Table auto-migration execution
  - `internal/handlers/portal_public.go`: Public unauthenticated endpoints (NOKOMEN)
  - `internal/handlers/portal_admin.go`: Admin CMS & PSB management endpoints (NOKOMEN)
  - `internal/middleware/admin_auth.go`: JWT verification middleware (NOKOMEN)
  - `web_public/`: Copied Vite production build output

## Interface Contracts
### Public API Contracts
- `GET /api/v1/public/website-settings` -> `200 OK` `{ "name": "...", "motto": "...", "phone": "...", "email": "...", "address": "..." }`
- `GET /api/v1/public/hero-section` -> `200 OK` `[ { "id": 1, "title": "...", "subtitle": "...", "image": "...", "order": 1 } ]`
- `GET /api/v1/public/visi-misi` -> `200 OK` `{ "visi": "...", "misi": "..." }`
- `GET /api/v1/public/fasilitas` -> `200 OK` `[ { "id": 1, "name": "...", "description": "...", "image": "..." } ]`
- `GET /api/v1/public/tenaga-pengajar` -> `200 OK` `{ "data": [ { "id": 1, "name": "...", "role": "..." } ], "pagination": { "total": 1, "page": 1, "limit": 12 } }`
- `GET /api/v1/public/posts` -> `200 OK` `{ "data": [ { "id": 1, "title": "...", "slug": "...", "excerpt": "..." } ], "meta": { "total": 1, "page": 1, "limit": 10 } }`
- `GET /api/v1/public/posts/:slug` -> `200 OK` `{ "id": 1, "title": "...", "slug": "...", "content": "..." }`
- `POST /api/v1/public/psb/daftar` -> `201 Created` `{ "success": true, "message": "Pendaftaran berhasil", "registration_no": "..." }`

### Admin API Contracts
- Header: `Authorization: Bearer <token>`
- Unauthorized: `401 Unauthorized` `{ "error": "Unauthorized: Invalid token" }`
- Forbidden: `403 Forbidden` `{ "error": "Forbidden: Admin access required" }`
- `GET /api/v1/admin/cms/:section` -> `200 OK` `[ ... ]`
- `POST /api/v1/admin/cms/:section` -> `201 Created` `{ ... }`
- `PUT /api/v1/admin/cms/:section/:id` -> `200 OK` `{ ... }`
- `DELETE /api/v1/admin/cms/:section/:id` -> `200 OK` `{ "success": true }`
- `GET /api/v1/admin/blog/posts` -> `200 OK` `[ ... ]`
- `GET /api/v1/admin/psb/pendaftar` -> `200 OK` `[ ... ]`
