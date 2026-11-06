# TEST_READY: Pesantren Hub & Golang Fiber Backend E2E Test Suite

## 1. Test Suite Overview
The E2E test suite provides comprehensive, requirement-driven, opaque-box testing covering all 20 features across Tiers 1-4 as specified in `PROJECT.md` and `ORIGINAL_REQUEST.md`.

All test assertions execute strictly against observable public interfaces:
- Real HTTP/1.1 requests (`curl`, `net/http`) against live running server (`http://localhost:3000`).
- Deliverable filesystem artifacts (`pesantren-hub/dist`, `gobackend/web_public/`).
- Code quality audits: Strict NOKOMEN (zero comments in Go/TS/TSX) and Operational app isolation (zero modifications to `app/`).

---

## 2. Test Execution Commands

### Execute Master Test Runner (All Tiers)
```bash
bash /opt/data/home/mizan.apps/tests/e2e/runner.sh --all
```

### Execute by Individual Tier
```bash
# Tier 1: Feature Coverage (100 test cases across 20 features)
bash /opt/data/home/mizan.apps/tests/e2e/runner.sh --tier 1

# Tier 2: Boundary & Corner Cases (100 test cases across 20 features)
bash /opt/data/home/mizan.apps/tests/e2e/runner.sh --tier 2

# Tier 3: Cross-Feature Combinations (8 pairwise test suites)
bash /opt/data/home/mizan.apps/tests/e2e/runner.sh --tier 3

# Tier 4: Real-World Application Scenarios (5 end-to-end user journeys)
bash /opt/data/home/mizan.apps/tests/e2e/runner.sh --tier 4

# Quality & Safety Validations (NOKOMEN + App Isolation)
bash /opt/data/home/mizan.apps/tests/e2e/runner.sh --tier quality
```

### Execute Go Test Harness Directly
```bash
cd /opt/data/home/mizan.apps/tests/e2e && go test -v ./...
```

---

## 3. Test Tier Inventory & Count Summary

| Tier | Category | Specification / Threshold | Implemented Test Count |
|---|---|---|---|
| **Tier 1** | Feature Coverage | >= 5 test cases per feature across 20 features | **100 Test Cases** (TC1.1 - TC20.5) |
| **Tier 2** | Boundary & Corner Cases | >= 5 test cases per feature across 20 features | **100 Test Cases** (B1.1 - B20.5) |
| **Tier 3** | Cross-Feature Combinations | Pairwise interaction coverage | **8 Pairwise Suites** (P1 - P8) |
| **Tier 4** | Real-World Application Scenarios | >= 5 realistic end-to-end journeys | **5 Scenarios** (S1 - S5) |
| **Safety** | Code Quality & Isolation | Strict NOKOMEN & zero mods to `app/` | **2 Automated Audits** |
| **Total** | **All Tiers Combined** | **Comprehensive Opaque-Box Suite** | **215 Executable Test Assertions** |

---

## 4. Current Baseline Execution Status (Pre-Milestone Completion)

- **Total Test Cases Executed**: 215
- **Passed**: 71
- **Failed**: 144 (Pending Milestones M1, M2, and M3 implementation)

### Passed Components (Currently Live & Verified):
- **Code Quality**: Strict NOKOMEN verified (0 comments in added/modified files).
- **Public Portal SEO Tags (F3)**: 5/5 PASSED (`<title>`, `<meta description>`, `<link rel="canonical">`, Open Graph, Twitter Cards).
- **Schema.org Structured Data (F4)**: 5/5 PASSED (`application/ld+json`, valid JSON syntax, `WebSite`, `EducationalOrganization`, institutional entity metadata).
- **Static Route Coexistence (F6)**: Public portal root `/` (200 OK), CMS route `/admin-cms` (200 OK), and CMS SPA sub-route `/admin-cms/dashboard` (200 OK).
- **Mizan Operational Preservation (F8)**: `/admin/absensi` (200 OK), `/login` (200 OK), `/_next/*` assets (200 OK), `/api/data` (200 OK).
- **Admin JWT Auth Rejections (F17-F20)**: All admin CMS endpoints (`/api/v1/admin/cms/*`, `/api/v1/admin/blog/posts`, `/api/v1/admin/psb/pendaftar`) correctly reject unauthenticated requests with HTTP 401.
- **Boundary Handling**: Whitespace tokens, lowercase headers, alg=none JWT forged tokens, giant tokens, and SQL wildcard queries handled without crashes or leaks.

### Escalation & Pending Milestones:
1. **Milestone 1 (In Progress by worker_m1_1)**:
   - Produce `pesantren-hub/dist/index.html` and `pesantren-hub/dist/admin.html`.
   - Sync `dist/*` to `gobackend/web_public/` (including `assets/`, `robots.txt`, `sitemap.xml`).
2. **Milestone 2**:
   - Register route `/admin.html` in `gobackend/cmd/server/main.go` (currently `/admin-cms` works, but `/admin.html` returns 404).
   - Serve `/robots.txt` and `/sitemap.xml` directly with HTTP 200.
3. **Milestone 3**:
   - Port public endpoints under `/api/v1/public/*` before session auth middleware so they respond with HTTP 200 without requiring Mizan session cookies.
   - Initialize database tables from `portal_schema.sql`.
4. **App Isolation Alert**:
   - Existing git working tree has modifications in `app/globals.css` and `app/layout.tsx` from earlier pre-task work.
