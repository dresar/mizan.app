# Test Infrastructure & Specification: Pesantren Hub & Golang Fiber Backend

## 1. Test Philosophy: Opaque-Box & Requirement-Driven

The test suite is built on an **opaque-box, requirement-driven** testing methodology:
- **Opaque-Box Testing**: All test assertions execute against public, externally observable system boundaries:
  - External network protocols: HTTP/1.1 requests (`curl`, `net/http` client) to `http://localhost:3000`.
  - External filesystem deliverables: built distribution assets (`web_public/index.html`, `web_public/admin.html`, `web_public/assets/`).
  - Production binary compilation: verifying exit codes and executable artifacts (`go build -o mizan-server cmd/server/main.go`).
  - Live database state: querying PostgreSQL tables and verifying persistence after API mutations.
  - No internal mock bypassing: tests interact with the real compiled Fiber server and PostgreSQL instance.
- **Requirement-Driven Verification**: Every test case maps directly to requirements in `ORIGINAL_REQUEST.md` (R1-R5) and features defined in `PROJECT.md` (Features 1-20).
- **Progressive Testability**: Tests verify features according to milestone maturity, ensuring clean diagnostic isolation.

---

## 2. Test Architecture & Directory Layout

### Directory Layout
```text
/opt/data/home/mizan.apps/
├── tests/
│   └── e2e/
│       ├── runner.sh                  # Main executable test runner script
│       ├── test_tier1_feature.sh      # Tier 1: Feature Coverage test cases (>=5 per feature)
│       ├── test_tier2_boundary.sh     # Tier 2: Boundary & Corner Cases (>=5 per feature)
│       ├── test_tier3_pairwise.sh     # Tier 3: Cross-Feature Combinations
│       ├── test_tier4_scenarios.sh    # Tier 4: Real-World Application Scenarios
│       ├── harness_test.go            # Go test harness for high-throughput HTTP & DB checks
│       └── go.mod                     # Go module for tests/e2e
├── TEST_INFRA.md                      # This specification file
└── TEST_READY.md                      # Execution report and tier counts
```

### Test Runner Invocation
The test runner is executable and can be invoked from the root of the repository:
```bash
# Run all tiers (Tiers 1-4)
bash /opt/data/home/mizan.apps/tests/e2e/runner.sh

# Run specific tiers
bash /opt/data/home/mizan.apps/tests/e2e/runner.sh --tier 1
bash /opt/data/home/mizan.apps/tests/e2e/runner.sh --tier 2
bash /opt/data/home/mizan.apps/tests/e2e/runner.sh --tier 3
bash /opt/data/home/mizan.apps/tests/e2e/runner.sh --tier 4

# Run Go test harness directly
cd /opt/data/home/mizan.apps/tests/e2e && go test -v -run TestTier ./...
```

### Pass/Fail Semantics
- **Zero Exit Code (0)**: All assertions passed within the executed tier(s).
- **Non-Zero Exit Code (1)**: One or more test assertions failed. A detailed error summary lists:
  - Failing Test ID and Name.
  - Expected vs. Actual Observable Value (HTTP status, response body substring, header value, exit code).
  - Remediation guidance for the implementing agent.

---

## 3. Feature Inventory & Tier Mapping Matrix

The 20 core features from `PROJECT.md` are mapped across all 4 testing tiers:

| ID | Feature Name | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Scenario) |
|---|---|---|---|---|---|
| F1 | Dual-Entry Vite Build | 5 TCs | 5 TCs | P4 | S4 |
| F2 | Asset Integration | 5 TCs | 5 TCs | P4 | S4 |
| F3 | Public Portal SEO Tags | 5 TCs | 5 TCs | P6 | S4 |
| F4 | Schema.org Structured Data | 5 TCs | 5 TCs | P6 | S4 |
| F5 | SEO Static Files | 5 TCs | 5 TCs | P6 | S4 |
| F6 | Fiber Dual Static Serving | 5 TCs | 5 TCs | P4, P8 | S1, S5 |
| F7 | Vite Asset Serving | 5 TCs | 5 TCs | P4 | S1, S5 |
| F8 | Mizan Operational Preservation | 5 TCs | 5 TCs | P4, P8 | S5 |
| F9 | Database Schema Initialization | 5 TCs | 5 TCs | P7 | S1, S2 |
| F10 | Public Website Settings API | 5 TCs | 5 TCs | P2, P7 | S3 |
| F11 | Public Hero Section API | 5 TCs | 5 TCs | P2, P7 | S1 |
| F12 | Public Visi Misi API | 5 TCs | 5 TCs | P7 | S1 |
| F13 | Public Fasilitas API | 5 TCs | 5 TCs | P2, P7 | S1 |
| F14 | Public Tenaga Pengajar API | 5 TCs | 5 TCs | P7 | S1 |
| F15 | Public Blog Posts API | 5 TCs | 5 TCs | P3, P7 | S2 |
| F16 | Public PSB Registration API | 5 TCs | 5 TCs | P1, P7 | S1 |
| F17 | Admin JWT Authentication | 5 TCs | 5 TCs | P5, P8 | S2, S3 |
| F18 | Admin CMS Generic API | 5 TCs | 5 TCs | P2, P5 | S3 |
| F19 | Admin Blog Posts Management | 5 TCs | 5 TCs | P3, P5 | S2 |
| F20 | Admin PSB Applicant Management| 5 TCs | 5 TCs | P1, P5 | S1 |
| **Total** | **20 Features** | **100 TCs** | **100 TCs** | **8 Pairs** | **5 Scenarios** |

---

## 4. Tier 1: Feature Coverage Specifications (>=5 per Feature)

### F1: Dual-Entry Vite Build
- **TC1.1**: Verify `pesantren-hub/dist/index.html` exists and contains DOCTYPE.
- **TC1.2**: Verify `pesantren-hub/dist/admin.html` exists and contains DOCTYPE.
- **TC1.3**: Verify `dist/index.html` loads hashed bundle from `/assets/*.js`.
- **TC1.4**: Verify `dist/admin.html` loads hashed bundle from `/assets/*.js`.
- **TC1.5**: Verify Vite build completes with exit code 0 under memory constraints.

### F2: Asset Integration
- **TC2.1**: Verify `gobackend/web_public/index.html` exists.
- **TC2.2**: Verify `gobackend/web_public/admin.html` exists.
- **TC2.3**: Verify `gobackend/web_public/assets/` contains compiled `.js` and `.css` bundles.
- **TC2.4**: Verify `gobackend/web_public/robots.txt` exists.
- **TC2.5**: Verify `gobackend/web_public/sitemap.xml` exists.

### F3: Public Portal SEO Tags
- **TC3.1**: Public `index.html` contains `<title>` tag with non-empty school name.
- **TC3.2**: Public `index.html` contains `<meta name="description">` with valid content.
- **TC3.3**: Public `index.html` contains `<link rel="canonical" href="...">`.
- **TC3.4**: Public `index.html` contains Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`.
- **TC3.5**: Public `index.html` contains Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.

### F4: Schema.org Structured Data
- **TC4.1**: Public `index.html` contains `<script type="application/ld+json">`.
- **TC4.2**: JSON-LD parses as valid JSON without syntax errors.
- **TC4.3**: JSON-LD contains `@type` equal to `WebSite` or graph with `WebSite`.
- **TC4.4**: JSON-LD contains `@type` equal to `EducationalOrganization` or `School`.
- **TC4.5**: JSON-LD specifies valid `name`, `url`, and educational entity attributes.

### F5: SEO Static Files
- **TC5.1**: `GET /robots.txt` returns HTTP 200 with `Content-Type: text/plain`.
- **TC5.2**: `/robots.txt` contains `User-agent:` rules.
- **TC5.3**: `/robots.txt` disallows private administrative routes (`/admin/`, `/api/`).
- **TC5.4**: `GET /sitemap.xml` returns HTTP 200 with `Content-Type` matching XML (`application/xml` or `text/xml`).
- **TC5.5**: `/sitemap.xml` contains valid `<urlset>` and `<loc>` tags for public routes.

### F6: Fiber Dual Static Serving
- **TC6.1**: `GET /` returns HTTP 200 serving public portal `index.html`.
- **TC6.2**: `GET /admin.html` returns HTTP 200 serving `admin.html`.
- **TC6.3**: `GET /admin-cms` returns HTTP 200 serving `admin.html`.
- **TC6.4**: `GET /admin-cms/dashboard` (SPA subroute) returns HTTP 200 serving `admin.html`.
- **TC6.5**: `GET /profil/sejarah` (SPA subroute) returns HTTP 200 serving `index.html`.

### F7: Vite Asset Serving
- **TC7.1**: `GET /assets/*.js` returns HTTP 200 for bundled JavaScript.
- **TC7.2**: `GET /assets/*.css` returns HTTP 200 for bundled stylesheets.
- **TC7.3**: Response header `Content-Type` is `application/javascript` for JS assets.
- **TC7.4**: Response header `Content-Type` is `text/css` for CSS assets.
- **TC7.5**: Response header `Cache-Control` includes `public, max-age` / `immutable`.

### F8: Mizan Operational Preservation
- **TC8.1**: `GET /admin/absensi` returns HTTP 200 serving internal Mizan Apps.
- **TC8.2**: `GET /login` returns HTTP 200 serving Mizan authentication page.
- **TC8.3**: `GET /_next/static/...` correctly serves Next.js compiled chunks.
- **TC8.4**: Git status verifies zero files modified under `/opt/data/home/mizan.apps/app/`.
- **TC8.5**: Internal Mizan operational routes (`/admin/*`, `/bk/*`, `/guru/*`, `/santri/*`) remain fully routed to `./web`.

### F9: Database Schema Initialization
- **TC9.1**: Table `core_websitesettings` exists in Neon PostgreSQL.
- **TC9.2**: Table `core_herosection` exists in Neon PostgreSQL.
- **TC9.3**: Table `core_visimisi` exists in Neon PostgreSQL.
- **TC9.4**: Table `blog_blogpost` exists in Neon PostgreSQL.
- **TC9.5**: Table `admissions_santri` exists in Neon PostgreSQL.

### F10: Public Website Settings API
- **TC10.1**: `GET /api/v1/public/website-settings` returns HTTP 200.
- **TC10.2**: Response `Content-Type` is `application/json`.
- **TC10.3**: Response body contains `name` string field.
- **TC10.4**: Response body contains contact metadata (`email`, `phone`, `address`).
- **TC10.5**: Endpoint is accessible without Authorization header.

### F11: Public Hero Section API
- **TC11.1**: `GET /api/v1/public/hero-section` returns HTTP 200.
- **TC11.2**: Response `Content-Type` is `application/json`.
- **TC11.3**: Response body is a JSON array.
- **TC11.4**: Array items contain `title`, `subtitle`, and `image`.
- **TC11.5**: Items are ordered by `order` ascending.

### F12: Public Visi Misi API
- **TC12.1**: `GET /api/v1/public/visi-misi` returns HTTP 200.
- **TC12.2**: Response `Content-Type` is `application/json`.
- **TC12.3**: Response body contains `visi` string.
- **TC12.4**: Response body contains `misi` description/list.
- **TC12.5**: Accessible without JWT token.

### F13: Public Fasilitas API
- **TC13.1**: `GET /api/v1/public/fasilitas` returns HTTP 200.
- **TC13.2**: Response `Content-Type` is `application/json`.
- **TC13.3**: Response body is a JSON array.
- **TC13.4**: Facility items contain `name` and `description`.
- **TC13.5**: Returns valid list without database errors.

### F14: Public Tenaga Pengajar API
- **TC14.1**: `GET /api/v1/public/tenaga-pengajar` returns HTTP 200.
- **TC14.2**: Response `Content-Type` is `application/json`.
- **TC14.3**: Response contains `data` array of teachers/staff.
- **TC14.4**: Response contains `pagination` metadata object (`total`, `page`, `limit`).
- **TC14.5**: Honors query parameters `page=1&limit=5`.

### F15: Public Blog Posts API
- **TC15.1**: `GET /api/v1/public/posts` returns HTTP 200.
- **TC15.2**: Response contains `data` array of published posts.
- **TC15.3**: Response contains pagination metadata.
- **TC15.4**: `GET /api/v1/public/posts/:slug` returns HTTP 200 for existing post slug.
- **TC15.5**: Post detail contains `title`, `slug`, `content`, and author metadata.

### F16: Public PSB Registration API
- **TC16.1**: `POST /api/v1/public/psb/daftar` with valid JSON payload returns HTTP 201.
- **TC16.2**: Response `Content-Type` is `application/json`.
- **TC16.3**: Response contains confirmation (`registration_no` or `success: true`).
- **TC16.4**: Persists applicant record in Neon PostgreSQL table `admissions_santri`.
- **TC16.5**: Malformed JSON or missing required fields returns HTTP 400 Bad Request.

### F17: Admin JWT Authentication
- **TC17.1**: Accessing `GET /api/v1/admin/cms/website-settings` without token returns HTTP 401.
- **TC17.2**: Accessing with invalid token (garbage string) returns HTTP 401.
- **TC17.3**: Accessing with expired token returns HTTP 401.
- **TC17.4**: Malformed Authorization header (missing `Bearer `) returns HTTP 401.
- **TC17.5**: Accessing with valid admin JWT returns HTTP 200.

### F18: Admin CMS Generic API
- **TC18.1**: `GET /api/v1/admin/cms/:section` with valid token returns HTTP 200.
- **TC18.2**: `POST /api/v1/admin/cms/:section` creates section entry and returns HTTP 201.
- **TC18.3**: `PUT /api/v1/admin/cms/:section/:id` updates section entry and returns HTTP 200.
- **TC18.4**: `DELETE /api/v1/admin/cms/:section/:id` deletes section entry and returns HTTP 200.
- **TC18.5**: Invalid section name returns HTTP 400 or 404.

### F19: Admin Blog Posts Management
- **TC19.1**: `GET /api/v1/admin/blog/posts` with valid token returns HTTP 200.
- **TC19.2**: `POST /api/v1/admin/blog/posts` creates new article and returns HTTP 201.
- **TC19.3**: `PUT /api/v1/admin/blog/posts/:id` updates article and returns HTTP 200.
- **TC19.4**: `DELETE /api/v1/admin/blog/posts/:id` deletes article and returns HTTP 200.
- **TC19.5**: Unauthenticated requests to blog management endpoints return HTTP 401.

### F20: Admin PSB Applicant Management
- **TC20.1**: `GET /api/v1/admin/psb/pendaftar` with valid token returns HTTP 200.
- **TC20.2**: `GET /api/v1/admin/psb/pendaftar/:id` returns applicant details.
- **TC20.3**: `PUT /api/v1/admin/psb/pendaftar/:id` updates admission status and returns HTTP 200.
- **TC20.4**: Filter query `?status=pending` returns filtered results.
- **TC20.5**: Unauthenticated requests return HTTP 401.

---

## 5. Tier 2: Boundary & Corner Case Specifications (>=5 per Feature)

For each feature, at least 5 boundary, adversarial, and edge condition tests:
1. **F1 (Vite Build)**:
   - B1.1: Build with memory constrained environment (<4GB RAM limit).
   - B1.2: Build with missing optional assets handles warnings without failure.
   - B1.3: HTML output files do not exceed reasonable size limits (<100KB HTML shell).
   - B1.4: Lazy admin chunks are isolated in separate bundle files.
   - B1.5: Asset manifest correctly resolves all imported modules.
2. **F2 (Asset Integration)**:
   - B2.1: Target directory permissions allow read access for backend worker.
   - B2.2: Large asset bundles (>1MB) copy completely without truncation.
   - B2.3: Hidden/dot files are not copied into public root.
   - B2.4: Asset filenames with special characters (hash, hyphen) copy accurately.
   - B2.5: Idempotent copy: repeated copies do not corrupt or duplicate assets.
3. **F3 (SEO Meta Tags)**:
   - B3.1: Special characters in title (`&`, `"`, `'`, `<`) are properly HTML-escaped.
   - B3.2: Extremely long meta description (>300 chars) does not break HTML syntax.
   - B3.3: Canonical URL contains valid HTTPS scheme and trailing slash consistency.
   - B3.4: OpenGraph image URL is absolute or valid relative path.
   - B3.5: Multiple meta viewports do not conflict.
4. **F4 (Schema.org)**:
   - B4.1: Unicode and Arabic text in school name parse validly in JSON-LD.
   - B4.2: Trailing commas or quotes do not invalidate JSON syntax.
   - B4.3: Missing optional schema fields (e.g., fax) do not output `undefined` or `null`.
   - B4.4: Nested postalAddress object contains addressCountry and addressLocality.
   - B4.5: Script tag includes exact attribute `type="application/ld+json"`.
5. **F5 (SEO Static Files)**:
   - B5.1: Path traversal on robots (`/robots.txt/../`) does not leak filesystem.
   - B5.2: Sitemap XML contains valid XML declaration `<?xml version="1.0" encoding="UTF-8"?>`.
   - B5.3: Empty user-agent or crawler bot strings handle robots.txt cleanly.
   - B5.4: Sitemap URL locations contain strictly valid RFC 3986 URLs.
   - B5.5: HEAD request to `/robots.txt` and `/sitemap.xml` returns 200 with matching Content-Length.
6. **F6 (Dual Serving)**:
   - B6.1: Double slash requests (`//admin-cms`, `///`) route cleanly to corresponding handler.
   - B6.2: Case sensitivity: `/admin.HTML` vs `/admin.html` handled appropriately.
   - B6.3: Extremely long URL paths (>2000 chars) return 404 or 414 without panic.
   - B6.4: URL encoded paths (`%2fadmin-cms`) do not bypass route rules.
   - B6.5: Trailing slash handling (`/admin-cms/` vs `/admin-cms`) both serve `admin.html`.
7. **F7 (Asset Serving)**:
   - B7.1: Path traversal attempt (`/assets/../../cmd/server/main.go`) rejected with 400/403/404.
   - B7.2: Non-existent asset (`/assets/missing-file.js`) returns HTTP 404.
   - B7.3: Range request header (`Range: bytes=0-100`) handled gracefully.
   - B7.4: Gzip/Brotli encoding: `Accept-Encoding: gzip` returns compressed or plain stream cleanly.
   - B7.5: Byte-for-byte fidelity: downloaded JS matches file hash on disk.
8. **F8 (Mizan Preservation)**:
   - B8.1: Request to non-existent Mizan path (`/admin/non-existent-module`) returns Mizan SPA fallback.
   - B8.2: Attempted override: portal route `/api/v1/public/*` does not interfere with `/api/absensi`.
   - B8.3: WebSocket handshake to `/ws` succeeds without interference from static routes.
   - B8.4: Large file upload to Mizan endpoints respects BodyLimit (4MB).
   - B8.5: Git diff confirms 0 bytes changed in `/opt/data/home/mizan.apps/app/`.
9. **F9 (DB Schema Init)**:
   - B9.1: Re-running table initialization SQL is idempotent (IF NOT EXISTS).
   - B9.2: Constraint verification: foreign keys and default values match schema.
   - B9.3: Column types match Go handler struct definitions (int vs bigint, varchar vs text).
   - B9.4: Table name casing: PostgreSQL lowercase names handled correctly by pgx queries.
   - B9.5: Connection pool reconnects gracefully after idle timeout.
10. **F10 (Settings API)**:
    - B10.1: Empty table returns valid fallback JSON object, not null or 500.
    - B10.2: SQL injection string in query params (`?id=1' OR '1'='1`) ignored.
    - B10.3: XSS payload in stored settings safely returned as JSON without server evaluation.
    - B10.4: HTTP method tampering (`DELETE /api/v1/public/website-settings`) returns 405.
    - B10.5: Concurrent 50 rapid GET requests return 200 without connection pool exhaustion.
11. **F11 (Hero API)**:
    - B11.1: Zero active slider items returns empty JSON array `[]`, not null.
    - B11.2: Items with identical `order` value break ties consistently.
    - B11.3: Unicode characters and emojis in title/subtitle serialize properly.
    - B11.4: Huge subtitle (>5000 chars) returns without truncation or buffer overflow.
    - B11.5: Non-GET requests return 405 Method Not Allowed.
12. **F12 (Visi Misi API)**:
    - B12.1: Blank visi or misi fields return empty string `""` rather than null.
    - B12.2: Markdown or HTML tags inside misi are preserved as raw strings.
    - B12.3: Extremely long visi-misi text (>20KB) returns intact.
    - B12.4: Query parameters are ignored without throwing errors.
    - B12.5: Repeated rapid requests return consistent data.
13. **F13 (Fasilitas API)**:
    - B13.1: Table with 0 facilities returns empty array `[]`.
    - B13.2: Facilities with null image return empty string or null image field safely.
    - B13.3: Pagination parameters on unpaginated endpoint handle gracefully.
    - B13.4: Special characters in facility names (quotes, slashes) serialize cleanly.
    - B13.5: HTTP OPTIONS request returns valid CORS headers.
14. **F14 (Tenaga Pengajar API)**:
    - B14.1: Negative page number (`?page=-1`) normalizes to page 1.
    - B14.2: Zero limit (`?limit=0`) normalizes to default limit.
    - B14.3: Huge limit (`?limit=10000`) is capped at safe ceiling (e.g. 50 or 100).
    - B14.4: Out-of-bounds page (`?page=99999`) returns empty `data: []` with valid pagination meta.
    - B14.5: Non-numeric page param (`?page=abc`) returns 400 or defaults safely to 1.
15. **F15 (Blog Posts API)**:
    - B15.1: Non-existent post slug returns HTTP 404 Not Found.
    - B15.2: Slug with URL-encoded characters (`/api/v1/public/posts/berita%20baru`) resolves properly.
    - B15.3: Draft / unpublished articles are excluded from public list.
    - B15.4: Post with 0 comments / tags returns empty arrays, not null.
    - B15.5: Repeated requests to `:slug` increment `views_count` accurately without race.
16. **F16 (PSB Registration API)**:
    - B16.1: Submitting empty JSON `{}` returns HTTP 400 Bad Request with validation errors.
    - B16.2: Submitting duplicate NISN returns HTTP 400 or 409 Conflict.
    - B16.3: Malformed email address returns HTTP 400.
    - B16.4: Extremely long applicant name (>255 chars) handled with validation error.
    - B16.5: SQL injection string in input fields safely parameterized without execution.
17. **F17 (Admin JWT Auth)**:
    - B17.1: Header with empty token `Bearer ` returns HTTP 401.
    - B17.2: Token signed with incorrect secret returns HTTP 401.
    - B17.3: Token with altered payload (signature mismatch) returns HTTP 401.
    - B17.4: Non-admin role token returns HTTP 403 Forbidden.
    - B17.5: Case variations in header (`authorization: bearer <token>`) recognized correctly.
18. **F18 (Admin CMS Generic)**:
    - B18.1: Creating item with invalid schema returns HTTP 400.
    - B18.2: Updating non-existent ID (`/api/v1/admin/cms/fasilitas/999999`) returns HTTP 404.
    - B18.3: Deleting non-existent ID returns HTTP 404.
    - B18.4: Updating with empty body `{}` returns HTTP 400.
    - B18.5: Path traversal in section name (`/api/v1/admin/cms/../../`) rejected with 400/404.
19. **F19 (Admin Blog Management)**:
    - B19.1: Creating post with existing slug returns 400 or 409.
    - B19.2: Updating post ID with mismatching slug handles conflict safely.
    - B19.3: Deleting post cascade-removes or dissociates tags properly.
    - B19.4: Empty post title or content returns HTTP 400.
    - B19.5: Updating non-existent post returns HTTP 404.
20. **F20 (Admin PSB Management)**:
    - B20.1: Updating status to invalid state (e.g. `unknown_status`) returns HTTP 400.
    - B20.2: Updating non-existent applicant ID returns HTTP 404.
    - B20.3: Filtering by non-existent status returns empty list with 200 OK.
    - B20.4: Search query with SQL wildcard (`%` or `_`) does not cause full scan error.
    - B20.5: Exporting applicant records handles large volumes without memory exhaustion.

---

## 6. Tier 3: Cross-Feature Combinations (Pairwise Coverage)

Pairwise interaction matrices verify that modules operate harmoniously across system layers:

1. **P1: Public Registration (F16) <-> Admin PSB Management (F20)**:
   - Action: Applicant submits registration via `POST /api/v1/public/psb/daftar`.
   - Verification: Admin queries `GET /api/v1/admin/psb/pendaftar` with JWT; the newly registered applicant is present with status `pending`. Admin issues `PUT` to update status to `verified`.
2. **P2: Admin CMS Generic (F18) <-> Public Presentation APIs (F10, F11, F13)**:
   - Action: Admin mutates facility / website-settings via `PUT /api/v1/admin/cms/website-settings`.
   - Verification: Immediate subsequent `GET /api/v1/public/website-settings` reflects the updated attributes without server restart or caching latency.
3. **P3: Admin Blog Management (F19) <-> Public Blog API (F15)**:
   - Action: Admin creates new blog article via `POST /api/v1/admin/blog/posts` with `status: published`.
   - Verification: Public `GET /api/v1/public/posts` immediately includes the article, and `GET /api/v1/public/posts/:slug` returns full article content.
4. **P4: Fiber Dual Serving (F6) <-> Asset Serving (F7) <-> Mizan Preservation (F8)**:
   - Action: Concurrently request `GET /`, `GET /admin.html`, `GET /assets/...`, and `GET /admin/absensi`.
   - Verification: Each route serves its designated HTML/asset target: public portal from `./web_public/index.html`, CMS from `./web_public/admin.html`, and operational Mizan from `./web/` without routing collisions.
5. **P5: Admin JWT Auth (F17) <-> All Admin Sub-APIs (F18, F19, F20)**:
   - Action: Issue requests to generic CMS, blog management, and PSB management without token, with expired token, and with valid token.
   - Verification: All admin sub-routes uniformly enforce 401 Unauthorized on invalid tokens and allow authorized access on valid tokens.
6. **P6: Public SEO Tags (F3) <-> Schema.org (F4) <-> Static Files (F5)**:
   - Action: Fetch `/robots.txt`, parse `Sitemap:` location, fetch `/sitemap.xml`, follow canonical URL to `/`, parse `<head>` tags and JSON-LD script.
   - Verification: Entire SEO discovery and indexing chain is structurally consistent, valid, and unblocked.
7. **P7: Database Initialization (F9) <-> Public API Read Suite (F10-F16)**:
   - Action: Cold-boot server against freshly initialized PostgreSQL schema.
   - Verification: All public endpoints (`website-settings`, `hero-section`, `visi-misi`, `fasilitas`, `tenaga-pengajar`, `posts`) respond with 200 OK and valid JSON structures without unhandled null pointer panics.
8. **P8: Mizan Internal Auth <-> Admin Portal JWT Auth (F8 <-> F17)**:
   - Action: Send Mizan session cookie to `/api/v1/admin/*` and send JWT Bearer token to `/api/absensi`.
   - Verification: Strict domain separation is maintained: Mizan session cookies do not grant access to CMS JWT endpoints (401), and portal JWT tokens do not grant access to internal Mizan session endpoints without valid session.

---

## 7. Tier 4: Real-World Application Scenarios (>=5 Scenarios)

1. **Scenario 1: Prospective Student End-to-End Admission Journey**:
   - Step 1: Parent opens public portal `GET /` and reads facilities (`GET /api/v1/public/fasilitas`) and vision-mission (`GET /api/v1/public/visi-misi`).
   - Step 2: Parent fills and submits application `POST /api/v1/public/psb/daftar`.
   - Step 3: Application receives registration number in 201 response.
   - Step 4: Admin authenticates via JWT and retrieves new applications list `GET /api/v1/admin/psb/pendaftar`.
   - Step 5: Admin updates applicant admission status to `accepted` via `PUT /api/v1/admin/psb/pendaftar/:id`.
2. **Scenario 2: Content Publisher Article Lifecycle**:
   - Step 1: Editor logs into CMS with admin JWT.
   - Step 2: Editor publishes article "Penerimaan Santri Baru 2026 Dibuka" via `POST /api/v1/admin/blog/posts`.
   - Step 3: Public visitor browses blog feed `GET /api/v1/public/posts` and sees article listed.
   - Step 4: Public visitor opens article `GET /api/v1/public/posts/penerimaan-santri-baru-2026`.
   - Step 5: Article view counter increments by 1.
3. **Scenario 3: Site Administrator Identity & Branding Update**:
   - Step 1: Admin logs into CMS portal at `/admin-cms`.
   - Step 2: Admin updates contact phone, email, and motto via `PUT /api/v1/admin/cms/website-settings`.
   - Step 3: Public visitor queries `GET /api/v1/public/website-settings` and observes new contact details.
   - Step 4: Public portal `<title>` and OpenGraph tags dynamically reflect updated branding.
4. **Scenario 4: Search Engine Crawler Full Indexing Run**:
   - Step 1: Crawler requests `GET /robots.txt` and verifies indexing permissions.
   - Step 2: Crawler follows `Sitemap:` directive to `GET /sitemap.xml`.
   - Step 3: Crawler fetches root URL `GET /`.
   - Step 4: Crawler parses `<head>` tags: `<title>`, `<meta description>`, OpenGraph, Twitter Cards.
   - Step 5: Crawler extracts `<script type="application/ld+json">` and validates JSON-LD schemas (`WebSite`, `EducationalOrganization`).
5. **Scenario 5: Multi-Role Concurrent Operational Integrity**:
   - Step 1: Public user requests portal pages and public APIs (`/`, `/api/v1/public/hero-section`).
   - Step 2: CMS Admin concurrently edits facility data (`PUT /api/v1/admin/cms/fasilitas/:id`).
   - Step 3: Internal Mizan teacher records student attendance (`POST /api/absensi` on operational Mizan).
   - Step 4: Security gate scanner verifies QR pass (`GET /satpam`).
   - Step 5: All concurrent requests return expected HTTP status codes with zero routing collision and zero database deadlocks.

---

## 8. Code Quality, Safety & NOKOMEN Audit Specifications

- **Strict NOKOMEN Audit**:
  - Automatically scans every newly added or modified file in `gobackend/` and `tests/` (`.go`, `.ts`, `.tsx`).
  - Verifies zero `//` single-line comments and zero `/* ... */` multi-line comments.
  - Exits with failure code 1 if any comment is detected.
- **Operational Preservation Audit**:
  - Runs `git diff --name-only origin/main -- app/` to verify zero modified files under `/opt/data/home/mizan.apps/app/`.
  - Exits with failure code 1 if any file under `app/` is altered.
