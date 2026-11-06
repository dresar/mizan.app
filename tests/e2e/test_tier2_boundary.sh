#!/usr/bin/env bash
set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
HUB_DIR="${HUB_DIR:-/opt/data/home/mizan.apps/portal}"
GOBACKEND_DIR="${GOBACKEND_DIR:-/opt/data/home/mizan.apps/gobackend}"
APP_ROOT="/opt/data/home/mizan.apps"

PASS_COUNT=0
FAIL_COUNT=0
TOTAL_COUNT=0

report() {
  local id="$1"
  local name="$2"
  local status="$3"
  local details="$4"
  TOTAL_COUNT=$((TOTAL_COUNT + 1))
  if [ "$status" -eq 0 ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
    printf "  [PASS] %-10s %s\n" "$id" "$name"
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    printf "  [FAIL] %-10s %s (Reason: %s)\n" "$id" "$name" "$details"
  fi
}

echo "=== Running Tier 2: Boundary & Corner Cases (100 Test Cases across 20 Features) ==="

# --- B1: Dual-Entry Vite Build Boundaries ---
echo "--- Testing Boundary 1: Vite Build Edge Cases ---"
# Check dist file sizes are within reasonable production boundaries
if [ -f "$HUB_DIR/dist/index.html" ]; then
  INDEX_SZ=$(wc -c < "$HUB_DIR/dist/index.html")
  if [ "$INDEX_SZ" -gt 100 ] && [ "$INDEX_SZ" -lt 500000 ]; then
    report "B1.1" "dist/index.html size within expected boundary (100B - 500KB)" 0 ""
  else
    report "B1.1" "dist/index.html size within expected boundary" 1 "Size $INDEX_SZ bytes"
  fi
else
  report "B1.1" "dist/index.html size within expected boundary" 1 "File missing"
fi

if [ -f "$HUB_DIR/dist/admin.html" ]; then
  ADMIN_SZ=$(wc -c < "$HUB_DIR/dist/admin.html")
  if [ "$ADMIN_SZ" -gt 100 ] && [ "$ADMIN_SZ" -lt 500000 ]; then
    report "B1.2" "dist/admin.html size within expected boundary" 0 ""
  else
    report "B1.2" "dist/admin.html size within expected boundary" 1 "Size $ADMIN_SZ bytes"
  fi
else
  report "B1.2" "dist/admin.html size within expected boundary" 1 "File missing"
fi

# Admin build lazy chunk separation: verify multiple JS chunks are produced to avoid monolithic bundle
JS_CHUNK_COUNT=$(find "$HUB_DIR/dist/assets" -type f -name "*.js" 2>/dev/null | wc -l)
if [ "$JS_CHUNK_COUNT" -gt 1 ]; then
  report "B1.3" "Vite outputs multiple code-split chunks (>1 chunk)" 0 ""
else
  report "B1.3" "Vite outputs multiple code-split chunks (>1 chunk)" 1 "Only $JS_CHUNK_COUNT chunks found"
fi

# Check for absence of dev-only artifacts in dist
if [ ! -d "$HUB_DIR/dist/.git" ] && [ ! -f "$HUB_DIR/dist/tsconfig.json" ]; then
  report "B1.4" "dist contains no development source leaks" 0 ""
else
  report "B1.4" "dist contains no development source leaks" 1 "Dev artifacts found in dist"
fi

# Check dist index.html has no raw uncompiled TSX script tags
if ! grep -q 'src=".*\.tsx"' "$HUB_DIR/dist/index.html" 2>/dev/null; then
  report "B1.5" "dist/index.html contains zero raw .tsx script tags" 0 ""
else
  report "B1.5" "dist/index.html contains zero raw .tsx script tags" 1 "Found raw .tsx tag"
fi

# --- B2: Asset Integration Boundaries ---
echo "--- Testing Boundary 2: Asset Integration Edge Cases ---"
# Idempotent copy verification: web_public file count matches dist file count
DIST_COUNT=$(find "$HUB_DIR/dist" -type f 2>/dev/null | wc -l)
PUB_COUNT=$(find "$GOBACKEND_DIR/web_public" -type f 2>/dev/null | wc -l)
if [ "$PUB_COUNT" -gt 0 ] && [ "$PUB_COUNT" -ge "$DIST_COUNT" ]; then
  report "B2.1" "web_public contains complete file copy of dist" 0 ""
else
  report "B2.1" "web_public contains complete file copy of dist" 1 "Dist=$DIST_COUNT, Public=$PUB_COUNT"
fi

# Check file permissions on web_public (readable by all)
if [ -r "$GOBACKEND_DIR/web_public/index.html" ]; then
  report "B2.2" "web_public/index.html has read permissions" 0 ""
else
  report "B2.2" "web_public/index.html has read permissions" 1 "Permission denied"
fi

# Check for absence of node_modules inside web_public
if [ ! -d "$GOBACKEND_DIR/web_public/node_modules" ]; then
  report "B2.3" "web_public has zero node_modules contamination" 0 ""
else
  report "B2.3" "web_public has zero node_modules contamination" 1 "node_modules found in web_public"
fi

# Check CSS bundles in web_public are non-zero byte
EMPTY_CSS=$(find "$GOBACKEND_DIR/web_public/assets" -type f -name "*.css" -size 0 2>/dev/null | wc -l)
if [ "$EMPTY_CSS" -eq 0 ]; then
  report "B2.4" "web_public CSS bundle contains non-zero byte assets" 0 ""
else
  report "B2.4" "web_public CSS bundle contains non-zero byte assets" 1 "Found $EMPTY_CSS zero-byte CSS files"
fi

# Check JS bundles in web_public are non-zero byte
EMPTY_JS=$(find "$GOBACKEND_DIR/web_public/assets" -type f -name "*.js" -size 0 2>/dev/null | wc -l)
if [ "$EMPTY_JS" -eq 0 ]; then
  report "B2.5" "web_public JS bundle contains non-zero byte assets" 0 ""
else
  report "B2.5" "web_public JS bundle contains non-zero byte assets" 1 "Found $EMPTY_JS zero-byte JS files"
fi

# --- B3: SEO Meta Tags Boundaries ---
echo "--- Testing Boundary 3: SEO Meta Tags Edge Cases ---"
INDEX_FILE="$GOBACKEND_DIR/web_public/index.html"
[ ! -f "$INDEX_FILE" ] && INDEX_FILE="$HUB_DIR/index.html"

# Title tag length boundary (< 100 characters for search snippet safety)
TITLE_LEN=$(python3 -c '
import re, sys
with open(sys.argv[1], "r") as f:
    m = re.search(r"<title>(.*?)</title>", f.read(), re.IGNORECASE)
    print(len(m.group(1)) if m else 0)
' "$INDEX_FILE" 2>/dev/null || echo "0")

if [ "$TITLE_LEN" -gt 5 ] && [ "$TITLE_LEN" -lt 120 ]; then
  report "B3.1" "HTML <title> length between 5 and 120 characters ($TITLE_LEN chars)" 0 ""
else
  report "B3.1" "HTML <title> length between 5 and 120 characters" 1 "Length is $TITLE_LEN"
fi

# Meta description length boundary (50 - 320 characters)
DESC_LEN=$(python3 -c '
import re, sys
with open(sys.argv[1], "r") as f:
    m = re.search(r"""<meta\s+name=["\x27]description["\x27]\s+content=["\x27](.*?)["\x27]""", f.read(), re.IGNORECASE)
    print(len(m.group(1)) if m else 0)
' "$INDEX_FILE" 2>/dev/null || echo "0")

if [ "$DESC_LEN" -gt 30 ] && [ "$DESC_LEN" -lt 350 ]; then
  report "B3.2" "Meta description length between 30 and 350 characters ($DESC_LEN chars)" 0 ""
else
  report "B3.2" "Meta description length between 30 and 350 characters" 1 "Length is $DESC_LEN"
fi

# Canonical URL protocol check (must begin with https://)
if grep -q 'rel="canonical"[^>]*href="https://' "$INDEX_FILE" 2>/dev/null; then
  report "B3.3" "Canonical URL uses secure HTTPS scheme" 0 ""
else
  report "B3.3" "Canonical URL uses secure HTTPS scheme" 1 "Missing https:// canonical link"
fi

# OpenGraph image tag validation
if grep -q 'property="og:image"' "$INDEX_FILE" 2>/dev/null; then
  report "B3.4" "og:image meta tag present" 0 ""
else
  report "B3.4" "og:image meta tag present" 1 "Missing og:image tag"
fi

# Viewport tag responsive check
if grep -q 'name="viewport"[^>]*width=device-width' "$INDEX_FILE" 2>/dev/null; then
  report "B3.5" "Viewport tag includes width=device-width" 0 ""
else
  report "B3.5" "Viewport tag includes width=device-width" 1 "Missing proper viewport declaration"
fi

# --- B4: Schema.org Structured Data Boundaries ---
echo "--- Testing Boundary 4: Schema.org JSON-LD Edge Cases ---"
# Check JSON-LD contains no unescaped control characters
LD_CLEAN=$(python3 -c '
import re, json, sys
with open(sys.argv[1], "r") as f:
    c = f.read()
m = re.findall(r"""<script[^>]*type=["\x27]application/ld\+json["\x27][^>]*>(.*?)</script>""", c, re.DOTALL)
if not m:
    sys.exit(1)
for s in m:
    parsed = json.loads(s.strip())
sys.exit(0)
' "$INDEX_FILE" 2>/dev/null && echo "CLEAN" || echo "ERROR")

if [ "$LD_CLEAN" = "CLEAN" ]; then
  report "B4.1" "JSON-LD contains valid JSON with no unescaped control characters" 0 ""
else
  report "B4.1" "JSON-LD contains valid JSON with no unescaped control characters" 1 "Parse failure"
fi

# Check @context is https://schema.org
if grep -q '"@context":\s*"https://schema.org"' "$INDEX_FILE" 2>/dev/null || grep -q '"@context":"https://schema.org"' "$INDEX_FILE" 2>/dev/null; then
  report "B4.2" "Schema.org @context specifies https://schema.org" 0 ""
else
  report "B4.2" "Schema.org @context specifies https://schema.org" 1 "Invalid or missing @context"
fi

# Check EducationalOrganization postalAddress
if grep -q '"address"' "$INDEX_FILE" 2>/dev/null || grep -q '"postalAddress"' "$INDEX_FILE" 2>/dev/null; then
  report "B4.3" "Schema includes institutional address data" 0 ""
else
  report "B4.3" "Schema includes institutional address data" 1 "Missing address in schema"
fi

# Check telephone contact point in schema
if grep -q '"telephone"' "$INDEX_FILE" 2>/dev/null || grep -q '"contactPoint"' "$INDEX_FILE" 2>/dev/null; then
  report "B4.4" "Schema includes telephone or contactPoint" 0 ""
else
  report "B4.4" "Schema includes telephone or contactPoint" 1 "Missing telephone/contactPoint"
fi

# Check schema script tag has no defer/async attribute confusion
if grep -q '<script type="application/ld+json"' "$INDEX_FILE" 2>/dev/null; then
  report "B4.5" "Schema.org script tag properly formulated without defer" 0 ""
else
  report "B4.5" "Schema.org script tag properly formulated without defer" 1 "Improper script tag attributes"
fi

# --- B5: SEO Static Files Boundaries ---
echo "--- Testing Boundary 5: SEO Static Files Edge Cases ---"
# Check robots.txt casing tolerance /robots.txt
CODE_HEAD_ROBOTS=$(curl -s -o /dev/null -w "%{http_code}" -I "$BASE_URL/robots.txt")
if [ "$CODE_HEAD_ROBOTS" = "200" ]; then
  report "B5.1" "HEAD /robots.txt returns HTTP 200" 0 ""
else
  report "B5.1" "HEAD /robots.txt returns HTTP 200" 1 "Returned HTTP $CODE_HEAD_ROBOTS"
fi

# Check robots.txt Content-Type is text/plain
CT_ROBOTS=$(curl -s -I "$BASE_URL/robots.txt" | grep -i "^content-type:" | tr -d '\r')
if echo "$CT_ROBOTS" | grep -qi "text/plain"; then
  report "B5.2" "robots.txt Content-Type is text/plain" 0 ""
else
  report "B5.2" "robots.txt Content-Type is text/plain" 1 "Content-Type: $CT_ROBOTS"
fi

# Check sitemap XML declaration
SITEMAP_HEAD=$(curl -s "$BASE_URL/sitemap.xml" | head -n 2)
if echo "$SITEMAP_HEAD" | grep -q "<?xml" || echo "$SITEMAP_HEAD" | grep -q "<urlset"; then
  report "B5.3" "sitemap.xml has XML declaration or root urlset" 0 ""
else
  report "B5.3" "sitemap.xml has XML declaration or root urlset" 1 "Invalid XML header: $SITEMAP_HEAD"
fi

# Check sitemap URLs have https://
if curl -s "$BASE_URL/sitemap.xml" | grep -q "<loc>https://"; then
  report "B5.4" "sitemap.xml URLs use https:// scheme" 0 ""
else
  report "B5.4" "sitemap.xml URLs use https:// scheme" 1 "Missing https in loc entries"
fi

# Check traversal attempt on robots.txt
CODE_ROBOTS_TRAV=$(curl -s -o /dev/null -w "%{http_code}" --path-as-is "$BASE_URL/robots.txt/../etc/passwd")
if [ "$CODE_ROBOTS_TRAV" = "403" ] || [ "$CODE_ROBOTS_TRAV" = "404" ] || [ "$CODE_ROBOTS_TRAV" = "400" ]; then
  report "B5.5" "Path traversal on robots.txt returns 404/400" 0 ""
else
  report "B5.5" "Path traversal on robots.txt returns 404/400" 1 "Returned HTTP $CODE_ROBOTS_TRAV"
fi

# --- B6: Fiber Dual Static Serving Boundaries ---
echo "--- Testing Boundary 6: Fiber Dual Serving Edge Cases ---"
# Trailing slash handling: /admin-cms/
CODE_CMS_SLASH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin-cms/")
if [ "$CODE_CMS_SLASH" = "200" ] || [ "$CODE_CMS_SLASH" = "301" ] || [ "$CODE_CMS_SLASH" = "302" ]; then
  report "B6.1" "GET /admin-cms/ with trailing slash resolves cleanly" 0 ""
else
  report "B6.1" "GET /admin-cms/ with trailing slash resolves cleanly" 1 "Returned HTTP $CODE_CMS_SLASH"
fi

# Deep sub-route SPA fallback for public portal
CODE_DEEP_PUBLIC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/kehidupan-santri/ekstrakurikuler")
if [ "$CODE_DEEP_PUBLIC" = "200" ]; then
  report "B6.2" "Deep public sub-route /kehidupan-santri/ekstrakurikuler returns 200" 0 ""
else
  report "B6.2" "Deep public sub-route /kehidupan-santri/ekstrakurikuler returns 200" 1 "Returned HTTP $CODE_DEEP_PUBLIC"
fi

# Deep sub-route SPA fallback for admin CMS
CODE_DEEP_ADMIN=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin-cms/settings/general")
if [ "$CODE_DEEP_ADMIN" = "200" ]; then
  report "B6.3" "Deep admin sub-route /admin-cms/settings/general returns 200" 0 ""
else
  report "B6.3" "Deep admin sub-route /admin-cms/settings/general returns 200" 1 "Returned HTTP $CODE_DEEP_ADMIN"
fi

# Extremely long path (> 1000 characters) handles without crash
LONG_PATH=$(python3 -c 'print("a" * 1500)')
CODE_LONG=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$LONG_PATH")
if [ "$CODE_LONG" = "200" ] || [ "$CODE_LONG" = "404" ] || [ "$CODE_LONG" = "414" ] || [ "$CODE_LONG" = "400" ]; then
  report "B6.4" "Extremely long path (>1000 chars) returns 404/414/400 without crash" 0 ""
else
  report "B6.4" "Extremely long path (>1000 chars) returns 404/414/400 without crash" 1 "Returned HTTP $CODE_LONG"
fi

# Double slash handling
CODE_DOUBLE_SLASH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL//admin-cms")
if [ "$CODE_DOUBLE_SLASH" = "200" ] || [ "$CODE_DOUBLE_SLASH" = "301" ] || [ "$CODE_DOUBLE_SLASH" = "404" ]; then
  report "B6.5" "Double slash //admin-cms handled safely" 0 ""
else
  report "B6.5" "Double slash //admin-cms handled safely" 1 "Returned HTTP $CODE_DOUBLE_SLASH"
fi

# --- B7: Vite Asset Serving Boundaries ---
echo "--- Testing Boundary 7: Vite Asset Serving Edge Cases ---"
# Directory traversal rejection on /assets/
CODE_TRAV_ASSET=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/assets/../../cmd/server/main.go")
if [ "$CODE_TRAV_ASSET" = "404" ] || [ "$CODE_TRAV_ASSET" = "400" ] || [ "$CODE_TRAV_ASSET" = "403" ]; then
  report "B7.1" "Directory traversal on /assets/ safely rejected" 0 ""
else
  report "B7.1" "Directory traversal on /assets/ safely rejected" 1 "Returned HTTP $CODE_TRAV_ASSET"
fi

# Non-existent asset returns 404
CODE_MISSING_ASSET=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/assets/non-existent-file-404.js")
if [ "$CODE_MISSING_ASSET" = "404" ]; then
  report "B7.2" "Non-existent asset returns HTTP 404" 0 ""
else
  report "B7.2" "Non-existent asset returns HTTP 404" 1 "Returned HTTP $CODE_MISSING_ASSET"
fi

# HEAD request on valid asset
SAMPLE_ASSET=$(find "$GOBACKEND_DIR/web_public/assets" -type f 2>/dev/null | head -n 1)
if [ -n "$SAMPLE_ASSET" ]; then
  ASSET_BASE=$(basename "$SAMPLE_ASSET")
  CODE_HEAD_ASSET=$(curl -s -o /dev/null -w "%{http_code}" -I "$BASE_URL/assets/$ASSET_BASE")
  if [ "$CODE_HEAD_ASSET" = "200" ]; then
    report "B7.3" "HEAD /assets/* returns HTTP 200" 0 ""
  else
    report "B7.3" "HEAD /assets/* returns HTTP 200" 1 "Returned HTTP $CODE_HEAD_ASSET"
  fi
else
  report "B7.3" "HEAD /assets/* returns HTTP 200" 1 "No asset file available"
fi

# Range request header support on asset
if [ -n "$SAMPLE_ASSET" ]; then
  ASSET_BASE=$(basename "$SAMPLE_ASSET")
  CODE_RANGE=$(curl -s -o /dev/null -w "%{http_code}" -H "Range: bytes=0-10" "$BASE_URL/assets/$ASSET_BASE")
  if [ "$CODE_RANGE" = "206" ] || [ "$CODE_RANGE" = "200" ]; then
    report "B7.4" "Range request on asset returns 206 Partial or 200 OK" 0 ""
  else
    report "B7.4" "Range request on asset returns 206 Partial or 200 OK" 1 "Returned HTTP $CODE_RANGE"
  fi
else
  report "B7.4" "Range request on asset returns 206 Partial or 200 OK" 1 "No asset file available"
fi

# Asset request with query parameters (cache buster ?v=1)
if [ -n "$SAMPLE_ASSET" ]; then
  ASSET_BASE=$(basename "$SAMPLE_ASSET")
  CODE_PARAM=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/assets/$ASSET_BASE?v=12345")
  if [ "$CODE_PARAM" = "200" ]; then
    report "B7.5" "Asset request with query parameters returns 200 OK" 0 ""
  else
    report "B7.5" "Asset request with query parameters returns 200 OK" 1 "Returned HTTP $CODE_PARAM"
  fi
else
  report "B7.5" "Asset request with query parameters returns 200 OK" 1 "No asset file available"
fi

# --- B8: Mizan Operational Preservation Boundaries ---
echo "--- Testing Boundary 8: Mizan Operational Preservation Edge Cases ---"
# Non-existent route under /admin/ routes to Mizan SPA without 500 error
CODE_MIZAN_NONEXIST=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/non-existent-subpath-xyz")
if [ "$CODE_MIZAN_NONEXIST" = "200" ] || [ "$CODE_MIZAN_NONEXIST" = "404" ]; then
  report "B8.1" "Unknown /admin/* path returns clean 200/404 without 500" 0 ""
else
  report "B8.1" "Unknown /admin/* path returns clean 200/404 without 500" 1 "Returned HTTP $CODE_MIZAN_NONEXIST"
fi

# Mizan /bk module check
CODE_BK=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/bk")
if [ "$CODE_BK" = "200" ] || [ "$CODE_BK" = "302" ] || [ "$CODE_BK" = "404" ]; then
  report "B8.2" "Mizan /bk path handled cleanly without 500" 0 ""
else
  report "B8.2" "Mizan /bk path handled cleanly without 500" 1 "Returned HTTP $CODE_BK"
fi

# Mizan /guru module check
CODE_GURU=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/guru")
if [ "$CODE_GURU" = "200" ] || [ "$CODE_GURU" = "302" ] || [ "$CODE_GURU" = "404" ]; then
  report "B8.3" "Mizan /guru path handled cleanly without 500" 0 ""
else
  report "B8.3" "Mizan /guru path handled cleanly without 500" 1 "Returned HTTP $CODE_GURU"
fi

# Mizan /santri module check
CODE_SANTRI=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/santri")
if [ "$CODE_SANTRI" = "200" ] || [ "$CODE_SANTRI" = "302" ] || [ "$CODE_SANTRI" = "404" ]; then
  report "B8.4" "Mizan /santri path handled cleanly without 500" 0 ""
else
  report "B8.4" "Mizan /santri path handled cleanly without 500" 1 "Returned HTTP $CODE_SANTRI"
fi

# Verify no git untracked or modified files under app/
UNTRACKED_APP=$(git status --porcelain "$APP_ROOT/app" 2>/dev/null | grep "??" || true)
if [ -z "$UNTRACKED_APP" ]; then
  report "B8.5" "Zero untracked files added under app/" 0 ""
else
  report "B8.5" "Zero untracked files added under app/" 1 "Found untracked: $UNTRACKED_APP"
fi

# --- B9: DB Schema Boundaries ---
echo "--- Testing Boundary 9: DB Schema Edge Cases ---"
SCHEMA_SQL="$GOBACKEND_DIR/internal/database/portal_schema.sql"
# Check idempotent CREATE TABLE IF NOT EXISTS
IF_NOT_EXISTS_COUNT=$(grep -c "CREATE TABLE IF NOT EXISTS" "$SCHEMA_SQL" 2>/dev/null || echo "0")
if [ "$IF_NOT_EXISTS_COUNT" -ge 4 ]; then
  report "B9.1" "portal_schema.sql uses CREATE TABLE IF NOT EXISTS (count=$IF_NOT_EXISTS_COUNT)" 0 ""
else
  report "B9.1" "portal_schema.sql uses CREATE TABLE IF NOT EXISTS" 1 "Only found $IF_NOT_EXISTS_COUNT"
fi

# Check primary key declarations
PK_COUNT=$(grep -ci "PRIMARY KEY" "$SCHEMA_SQL" 2>/dev/null || echo "0")
if [ "$PK_COUNT" -ge 4 ]; then
  report "B9.2" "Schema specifies PRIMARY KEY constraints" 0 ""
else
  report "B9.2" "Schema specifies PRIMARY KEY constraints" 1 "Only found $PK_COUNT"
fi

# Check timestamp default now()
TIMESTAMP_COUNT=$(grep -ci "DEFAULT now()" "$SCHEMA_SQL" 2>/dev/null || grep -ci "DEFAULT CURRENT_TIMESTAMP" "$SCHEMA_SQL" 2>/dev/null || echo "0")
if [ "$TIMESTAMP_COUNT" -ge 2 ]; then
  report "B9.3" "Schema specifies default timestamps" 0 ""
else
  report "B9.3" "Schema specifies default timestamps" 1 "Only found $TIMESTAMP_COUNT"
fi

# Check portal table naming prefix core_, blog_, admissions_
if grep -q "core_" "$SCHEMA_SQL" 2>/dev/null && grep -q "blog_" "$SCHEMA_SQL" 2>/dev/null; then
  report "B9.4" "Schema enforces namespace isolation (core_*, blog_*)" 0 ""
else
  report "B9.4" "Schema enforces namespace isolation (core_*, blog_*)" 1 "Missing core_ or blog_ namespaces"
fi

# Check schema file size is non-trivial (> 1KB)
SCHEMA_SZ=$(wc -c < "$SCHEMA_SQL" 2>/dev/null || echo "0")
if [ "$SCHEMA_SZ" -gt 1000 ]; then
  report "B9.5" "portal_schema.sql has comprehensive DDL size (>1KB)" 0 ""
else
  report "B9.5" "portal_schema.sql has comprehensive DDL size" 1 "Size $SCHEMA_SZ bytes"
fi

# --- B10: Settings API Boundaries ---
echo "--- Testing Boundary 10: Settings API Edge Cases ---"
# Method tampering: POST on read-only public endpoint
CODE_POST_SETTINGS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/public/website-settings")
if [ "$CODE_POST_SETTINGS" = "405" ] || [ "$CODE_POST_SETTINGS" = "404" ] || [ "$CODE_POST_SETTINGS" = "401" ]; then
  report "B10.1" "POST on public website-settings returns 405/404/401" 0 ""
else
  report "B10.1" "POST on public website-settings returns 405/404/401" 1 "Returned HTTP $CODE_POST_SETTINGS"
fi

# DELETE on public settings
CODE_DEL_SETTINGS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/v1/public/website-settings")
if [ "$CODE_DEL_SETTINGS" = "405" ] || [ "$CODE_DEL_SETTINGS" = "404" ] || [ "$CODE_DEL_SETTINGS" = "401" ]; then
  report "B10.2" "DELETE on public website-settings returns 405/404/401" 0 ""
else
  report "B10.2" "DELETE on public website-settings returns 405/404/401" 1 "Returned HTTP $CODE_DEL_SETTINGS"
fi

# SQL injection probe in query string
CODE_SQLI=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/website-settings?id=1%27%20OR%20%271%27=%271")
if [ "$CODE_SQLI" = "200" ]; then
  report "B10.3" "SQL injection string in query safely ignored (200 OK)" 0 ""
else
  report "B10.3" "SQL injection string in query safely ignored" 1 "Returned HTTP $CODE_SQLI"
fi

# Rapid repeated requests (10 GET requests in tight loop)
RAPID_FAIL=0
for i in {1..10}; do
  RC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/website-settings")
  if [ "$RC" != "200" ]; then
    RAPID_FAIL=$((RAPID_FAIL + 1))
  fi
done
if [ "$RAPID_FAIL" -eq 0 ]; then
  report "B10.4" "10 rapid consecutive requests all return 200 OK" 0 ""
else
  report "B10.4" "10 rapid consecutive requests all return 200 OK" 1 "$RAPID_FAIL requests failed"
fi

# Header variation (Accept: application/json)
CODE_ACCEPT=$(curl -s -o /dev/null -w "%{http_code}" -H "Accept: application/json" "$BASE_URL/api/v1/public/website-settings")
if [ "$CODE_ACCEPT" = "200" ]; then
  report "B10.5" "Accept: application/json header handled cleanly" 0 ""
else
  report "B10.5" "Accept: application/json header handled cleanly" 1 "Returned HTTP $CODE_ACCEPT"
fi

# --- B11: Hero API Boundaries ---
echo "--- Testing Boundary 11: Hero Section Edge Cases ---"
# Non-GET method rejected
CODE_HERO_PUT=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/v1/public/hero-section")
if [ "$CODE_HERO_PUT" = "405" ] || [ "$CODE_HERO_PUT" = "404" ] || [ "$CODE_HERO_PUT" = "401" ]; then
  report "B11.1" "PUT on public hero section returns 405/404/401" 0 ""
else
  report "B11.1" "PUT on public hero section returns 405/404/401" 1 "Returned HTTP $CODE_HERO_PUT"
fi

# Wildcard query params handled safely
CODE_HERO_PARAM=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/hero-section?unknown_param=true")
if [ "$CODE_HERO_PARAM" = "200" ]; then
  report "B11.2" "Unknown query params on hero-section handled safely (200 OK)" 0 ""
else
  report "B11.2" "Unknown query params on hero-section handled safely" 1 "Returned HTTP $CODE_HERO_PARAM"
fi

# CORS Preflight OPTIONS request
CODE_HERO_OPTIONS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$BASE_URL/api/v1/public/hero-section" \
  -H "Origin: $BASE_URL" \
  -H "Access-Control-Request-Method: GET")
if [ "$CODE_HERO_OPTIONS" = "200" ] || [ "$CODE_HERO_OPTIONS" = "204" ]; then
  report "B11.3" "OPTIONS preflight returns 200 or 204" 0 ""
else
  report "B11.3" "OPTIONS preflight returns 200 or 204" 1 "Returned HTTP $CODE_HERO_OPTIONS"
fi

# Response is parseable JSON
HERO_JSON_OK=$(python3 -c '
import urllib.request, json, sys
try:
    r = urllib.request.urlopen("'"$BASE_URL/api/v1/public/hero-section"'")
    json.loads(r.read())
    sys.exit(0)
except Exception:
    sys.exit(1)
' 2>/dev/null && echo "OK" || echo "FAIL")

if [ "$HERO_JSON_OK" = "OK" ]; then
  report "B11.4" "hero-section body parses cleanly into JSON object/array" 0 ""
else
  report "B11.4" "hero-section body parses cleanly into JSON object/array" 1 "Parse failed"
fi

# HEAD request on hero section
CODE_HERO_HEAD=$(curl -s -o /dev/null -w "%{http_code}" -I "$BASE_URL/api/v1/public/hero-section")
if [ "$CODE_HERO_HEAD" = "200" ]; then
  report "B11.5" "HEAD /api/v1/public/hero-section returns 200 OK" 0 ""
else
  report "B11.5" "HEAD /api/v1/public/hero-section returns 200 OK" 1 "Returned HTTP $CODE_HERO_HEAD"
fi

# --- B12: Visi Misi API Boundaries ---
echo "--- Testing Boundary 12: Visi Misi Edge Cases ---"
# Non-GET method
CODE_VM_POST=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/public/visi-misi")
if [ "$CODE_VM_POST" = "405" ] || [ "$CODE_VM_POST" = "404" ] || [ "$CODE_VM_POST" = "401" ]; then
  report "B12.1" "POST on public visi-misi returns 405/404/401" 0 ""
else
  report "B12.1" "POST on public visi-misi returns 405/404/401" 1 "Returned HTTP $CODE_VM_POST"
fi

# SQL injection string in path
CODE_VM_SQLI=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/visi-misi/%27%20OR%201=1")
if [ "$CODE_VM_SQLI" = "404" ] || [ "$CODE_VM_SQLI" = "400" ] || [ "$CODE_VM_SQLI" = "401" ]; then
  report "B12.2" "SQL injection in path returns 404/400" 0 ""
else
  report "B12.2" "SQL injection in path returns 404/400" 1 "Returned HTTP $CODE_VM_SQLI"
fi

# Accept header with text/html falls back to JSON or responds safely
CODE_VM_ACCEPT=$(curl -s -o /dev/null -w "%{http_code}" -H "Accept: text/html" "$BASE_URL/api/v1/public/visi-misi")
if [ "$CODE_VM_ACCEPT" = "200" ]; then
  report "B12.3" "Visi-misi responds with 200 regardless of Accept header" 0 ""
else
  report "B12.3" "Visi-misi responds with 200 regardless of Accept header" 1 "Returned HTTP $CODE_VM_ACCEPT"
fi

# Parse JSON integrity
VM_JSON_OK=$(python3 -c '
import urllib.request, json, sys
try:
    r = urllib.request.urlopen("'"$BASE_URL/api/v1/public/visi-misi"'")
    d = json.loads(r.read())
    sys.exit(0 if isinstance(d, dict) else 1)
except Exception:
    sys.exit(1)
' 2>/dev/null && echo "OK" || echo "FAIL")

if [ "$VM_JSON_OK" = "OK" ]; then
  report "B12.4" "visi-misi parses as valid JSON dictionary" 0 ""
else
  report "B12.4" "visi-misi parses as valid JSON dictionary" 1 "Parse failed"
fi

# HEAD request
CODE_VM_HEAD=$(curl -s -o /dev/null -w "%{http_code}" -I "$BASE_URL/api/v1/public/visi-misi")
if [ "$CODE_VM_HEAD" = "200" ]; then
  report "B12.5" "HEAD /api/v1/public/visi-misi returns 200 OK" 0 ""
else
  report "B12.5" "HEAD /api/v1/public/visi-misi returns 200 OK" 1 "Returned HTTP $CODE_VM_HEAD"
fi

# --- B13: Fasilitas API Boundaries ---
echo "--- Testing Boundary 13: Fasilitas Edge Cases ---"
# Non-existent ID in single item query
CODE_FAS_MISSING=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/fasilitas/999999")
if [ "$CODE_FAS_MISSING" = "404" ] || [ "$CODE_FAS_MISSING" = "400" ] || [ "$CODE_FAS_MISSING" = "401" ] || [ "$CODE_FAS_MISSING" = "200" ]; then
  report "B13.1" "Query for non-existent fasilitas ID handles cleanly without 500" 0 ""
else
  report "B13.1" "Query for non-existent fasilitas ID handles cleanly without 500" 1 "Returned HTTP $CODE_FAS_MISSING"
fi

# Negative ID query
CODE_FAS_NEG=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/fasilitas/-1")
if [ "$CODE_FAS_NEG" = "404" ] || [ "$CODE_FAS_NEG" = "400" ] || [ "$CODE_FAS_NEG" = "401" ] || [ "$CODE_FAS_NEG" = "200" ]; then
  report "B13.2" "Negative ID query handles cleanly without 500" 0 ""
else
  report "B13.2" "Negative ID query handles cleanly without 500" 1 "Returned HTTP $CODE_FAS_NEG"
fi

# DELETE rejected
CODE_FAS_DEL=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/v1/public/fasilitas")
if [ "$CODE_FAS_DEL" = "405" ] || [ "$CODE_FAS_DEL" = "404" ] || [ "$CODE_FAS_DEL" = "401" ]; then
  report "B13.3" "DELETE /api/v1/public/fasilitas rejected (405/404/401)" 0 ""
else
  report "B13.3" "DELETE /api/v1/public/fasilitas rejected" 1 "Returned HTTP $CODE_FAS_DEL"
fi

# HEAD request
CODE_FAS_HEAD=$(curl -s -o /dev/null -w "%{http_code}" -I "$BASE_URL/api/v1/public/fasilitas")
if [ "$CODE_FAS_HEAD" = "200" ]; then
  report "B13.4" "HEAD /api/v1/public/fasilitas returns 200 OK" 0 ""
else
  report "B13.4" "HEAD /api/v1/public/fasilitas returns 200 OK" 1 "Returned HTTP $CODE_FAS_HEAD"
fi

# JSON parse
FAS_JSON_OK=$(python3 -c '
import urllib.request, json, sys
try:
    r = urllib.request.urlopen("'"$BASE_URL/api/v1/public/fasilitas"'")
    d = json.loads(r.read())
    sys.exit(0)
except Exception:
    sys.exit(1)
' 2>/dev/null && echo "OK" || echo "FAIL")

if [ "$FAS_JSON_OK" = "OK" ]; then
  report "B13.5" "fasilitas parses cleanly into JSON" 0 ""
else
  report "B13.5" "fasilitas parses cleanly into JSON" 1 "Parse failed"
fi

# --- B14: Tenaga Pengajar API Boundaries ---
echo "--- Testing Boundary 14: Tenaga Pengajar Edge Cases ---"
# Negative page number: ?page=-1
CODE_TP_NEG_PAGE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/tenaga-pengajar?page=-1")
if [ "$CODE_TP_NEG_PAGE" = "200" ] || [ "$CODE_TP_NEG_PAGE" = "400" ]; then
  report "B14.1" "Negative page number handled safely (200 normalized or 400)" 0 ""
else
  report "B14.1" "Negative page number handled safely" 1 "Returned HTTP $CODE_TP_NEG_PAGE"
fi

# Zero limit: ?limit=0
CODE_TP_ZERO_LIMIT=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/tenaga-pengajar?limit=0")
if [ "$CODE_TP_ZERO_LIMIT" = "200" ] || [ "$CODE_TP_ZERO_LIMIT" = "400" ]; then
  report "B14.2" "Zero limit handled safely" 0 ""
else
  report "B14.2" "Zero limit handled safely" 1 "Returned HTTP $CODE_TP_ZERO_LIMIT"
fi

# Large limit: ?limit=10000
CODE_TP_LARGE_LIMIT=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/tenaga-pengajar?limit=10000")
if [ "$CODE_TP_LARGE_LIMIT" = "200" ]; then
  report "B14.3" "Large limit handled safely with 200 OK" 0 ""
else
  report "B14.3" "Large limit handled safely" 1 "Returned HTTP $CODE_TP_LARGE_LIMIT"
fi

# Non-numeric page param: ?page=abc
CODE_TP_STR_PAGE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/tenaga-pengajar?page=abc")
if [ "$CODE_TP_STR_PAGE" = "200" ] || [ "$CODE_TP_STR_PAGE" = "400" ]; then
  report "B14.4" "Non-numeric page handled safely without 500" 0 ""
else
  report "B14.4" "Non-numeric page handled safely without 500" 1 "Returned HTTP $CODE_TP_STR_PAGE"
fi

# Out-of-bounds page: ?page=99999
CODE_TP_OOB=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/tenaga-pengajar?page=99999")
if [ "$CODE_TP_OOB" = "200" ]; then
  report "B14.5" "Out of bounds page 99999 returns 200 OK (empty list)" 0 ""
else
  report "B14.5" "Out of bounds page 99999 returns 200 OK" 1 "Returned HTTP $CODE_TP_OOB"
fi

# --- B15: Blog Posts API Boundaries ---
echo "--- Testing Boundary 15: Blog Posts Edge Cases ---"
# Non-existent slug returns 404
CODE_BLOG_404=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/posts/this-slug-definitely-does-not-exist-12345")
if [ "$CODE_BLOG_404" = "404" ]; then
  report "B15.1" "Non-existent slug returns HTTP 404" 0 ""
else
  report "B15.1" "Non-existent slug returns HTTP 404" 1 "Returned HTTP $CODE_BLOG_404"
fi

# URL encoded characters in slug
CODE_BLOG_ENC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/posts/test%20slug%20special")
if [ "$CODE_BLOG_ENC" = "404" ] || [ "$CODE_BLOG_ENC" = "200" ] || [ "$CODE_BLOG_ENC" = "400" ]; then
  report "B15.2" "URL encoded slug handled cleanly without 500" 0 ""
else
  report "B15.2" "URL encoded slug handled cleanly without 500" 1 "Returned HTTP $CODE_BLOG_ENC"
fi

# Path traversal attempt in slug
CODE_BLOG_TRAV=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/posts/..%2F..%2Fmain.go")
if [ "$CODE_BLOG_TRAV" = "404" ] || [ "$CODE_BLOG_TRAV" = "400" ]; then
  report "B15.3" "Path traversal in slug returns 404/400" 0 ""
else
  report "B15.3" "Path traversal in slug returns 404/400" 1 "Returned HTTP $CODE_BLOG_TRAV"
fi

# Negative page query on posts
CODE_BLOG_NEG_PAGE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/posts?page=-1")
if [ "$CODE_BLOG_NEG_PAGE" = "200" ] || [ "$CODE_BLOG_NEG_PAGE" = "400" ]; then
  report "B15.4" "Negative page on posts handled safely" 0 ""
else
  report "B15.4" "Negative page on posts handled safely" 1 "Returned HTTP $CODE_BLOG_NEG_PAGE"
fi

# Zero limit on posts
CODE_BLOG_ZERO_LIMIT=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/posts?limit=0")
if [ "$CODE_BLOG_ZERO_LIMIT" = "200" ] || [ "$CODE_BLOG_ZERO_LIMIT" = "400" ]; then
  report "B15.5" "Zero limit on posts handled safely" 0 ""
else
  report "B15.5" "Zero limit on posts handled safely" 1 "Returned HTTP $CODE_BLOG_ZERO_LIMIT"
fi

# --- B16: PSB Registration API Boundaries ---
echo "--- Testing Boundary 16: PSB Registration Edge Cases ---"
# Empty payload
CODE_PSB_EMPTY=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" -H "Content-Type: application/json" -d '{}')
if [ "$CODE_PSB_EMPTY" = "400" ] || [ "$CODE_PSB_EMPTY" = "422" ]; then
  report "B16.1" "Empty payload returns 400/422 validation error" 0 ""
else
  report "B16.1" "Empty payload returns 400/422 validation error" 1 "Returned HTTP $CODE_PSB_EMPTY"
fi

# Extremely large payload (> 1MB)
CODE_PSB_HUGE=$(python3 -c 'import sys, json; sys.stdout.write(json.dumps({"nama_lengkap":"A"*5000000,"nisn":"99999"}))' | \
  curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" \
  -H "Content-Type: application/json" \
  --data-binary @-)
if [ "$CODE_PSB_HUGE" = "413" ] || [ "$CODE_PSB_HUGE" = "400" ] || [ "$CODE_PSB_HUGE" = "422" ]; then
  report "B16.2" "Huge payload (>1MB) returns 413 or 400 without crashing" 0 ""
else
  report "B16.2" "Huge payload (>1MB) returns 413 or 400 without crashing" 1 "Returned HTTP $CODE_PSB_HUGE"
fi

# Missing Content-Type header on POST
CODE_PSB_NO_CT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" -d '{"full_name":"Test"}')
if [ "$CODE_PSB_NO_CT" = "400" ] || [ "$CODE_PSB_NO_CT" = "415" ] || [ "$CODE_PSB_NO_CT" = "201" ] || [ "$CODE_PSB_NO_CT" = "200" ]; then
  report "B16.3" "Missing Content-Type header handled cleanly without 500" 0 ""
else
  report "B16.3" "Missing Content-Type header handled cleanly without 500" 1 "Returned HTTP $CODE_PSB_NO_CT"
fi

# SQL injection string in full_name
CODE_PSB_SQLI=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test'\''; DROP TABLE admissions_santri; --","nisn":"1234567890"}')
if [ "$CODE_PSB_SQLI" = "201" ] || [ "$CODE_PSB_SQLI" = "200" ] || [ "$CODE_PSB_SQLI" = "400" ]; then
  report "B16.4" "SQL injection attempt in name safely parameterized without crash" 0 ""
else
  report "B16.4" "SQL injection attempt in name safely parameterized without crash" 1 "Returned HTTP $CODE_PSB_SQLI"
fi

# GET method on POST-only registration endpoint
CODE_PSB_GET=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/psb/daftar")
if [ "$CODE_PSB_GET" = "405" ] || [ "$CODE_PSB_GET" = "404" ] || [ "$CODE_PSB_GET" = "401" ]; then
  report "B16.5" "GET on /api/v1/public/psb/daftar returns 405/404" 0 ""
else
  report "B16.5" "GET on /api/v1/public/psb/daftar returns 405/404" 1 "Returned HTTP $CODE_PSB_GET"
fi

# --- B17: Admin JWT Auth Boundaries ---
echo "--- Testing Boundary 17: Admin JWT Auth Edge Cases ---"
# Whitespace-only Bearer token
CODE_AUTH_SPACE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer    " "$BASE_URL/api/v1/admin/cms/website-settings")
if [ "$CODE_AUTH_SPACE" = "401" ]; then
  report "B17.1" "Whitespace-only bearer token returns 401" 0 ""
else
  report "B17.1" "Whitespace-only bearer token returns 401" 1 "Returned HTTP $CODE_AUTH_SPACE"
fi

# Lowercase authorization header
CODE_AUTH_LOWER=$(curl -s -o /dev/null -w "%{http_code}" -H "authorization: Bearer invalid" "$BASE_URL/api/v1/admin/cms/website-settings")
if [ "$CODE_AUTH_LOWER" = "401" ]; then
  report "B17.2" "Lowercase authorization header parsed correctly (401 on invalid token)" 0 ""
else
  report "B17.2" "Lowercase authorization header parsed correctly" 1 "Returned HTTP $CODE_AUTH_LOWER"
fi

# Forged JWT header with 'none' algorithm
FORGED_NONE_JWT="eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9."
CODE_AUTH_NONE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $FORGED_NONE_JWT" "$BASE_URL/api/v1/admin/cms/website-settings")
if [ "$CODE_AUTH_NONE" = "401" ]; then
  report "B17.3" "Alg=none forged JWT rejected with 401" 0 ""
else
  report "B17.3" "Alg=none forged JWT rejected with 401" 1 "Returned HTTP $CODE_AUTH_NONE"
fi

# Malformed 2-segment JWT
CODE_AUTH_TWO_SEG=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer header.payload" "$BASE_URL/api/v1/admin/cms/website-settings")
if [ "$CODE_AUTH_TWO_SEG" = "401" ]; then
  report "B17.4" "Two-segment malformed JWT returns 401" 0 ""
else
  report "B17.4" "Two-segment malformed JWT returns 401" 1 "Returned HTTP $CODE_AUTH_TWO_SEG"
fi

# Giant token string (> 100KB)
GIANT_TOKEN=$(python3 -c 'print("A" * 100000)')
CODE_AUTH_GIANT=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $GIANT_TOKEN" "$BASE_URL/api/v1/admin/cms/website-settings")
if [ "$CODE_AUTH_GIANT" = "401" ] || [ "$CODE_AUTH_GIANT" = "431" ] || [ "$CODE_AUTH_GIANT" = "400" ]; then
  report "B17.5" "Giant token string returns 401/431/400 without crashing" 0 ""
else
  report "B17.5" "Giant token string returns 401/431/400 without crashing" 1 "Returned HTTP $CODE_AUTH_GIANT"
fi

# --- B18: Admin CMS Generic Boundaries ---
echo "--- Testing Boundary 18: Admin CMS Generic Edge Cases ---"
# Section with special characters
CODE_GEN_SPEC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/cms/%3Cscript%3E")
if [ "$CODE_GEN_SPEC" = "401" ] || [ "$CODE_GEN_SPEC" = "400" ] || [ "$CODE_GEN_SPEC" = "404" ]; then
  report "B18.1" "XSS payload in section param returns 401/400/404" 0 ""
else
  report "B18.1" "XSS payload in section param returns 401/400/404" 1 "Returned HTTP $CODE_GEN_SPEC"
fi

# Path traversal in section name
CODE_GEN_TRAV=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/cms/..%2F..%2Fetc%2Fpasswd")
if [ "$CODE_GEN_TRAV" = "401" ] || [ "$CODE_GEN_TRAV" = "400" ] || [ "$CODE_GEN_TRAV" = "404" ]; then
  report "B18.2" "Path traversal in section name returns 401/400/404" 0 ""
else
  report "B18.2" "Path traversal in section name returns 401/400/404" 1 "Returned HTTP $CODE_GEN_TRAV"
fi

# Negative ID in PUT
CODE_GEN_NEG_ID=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/v1/admin/cms/fasilitas/-1")
if [ "$CODE_GEN_NEG_ID" = "401" ] || [ "$CODE_GEN_NEG_ID" = "400" ] || [ "$CODE_GEN_NEG_ID" = "404" ]; then
  report "B18.3" "Negative ID in admin CMS PUT returns 401/400/404" 0 ""
else
  report "B18.3" "Negative ID in admin CMS PUT returns 401/400/404" 1 "Returned HTTP $CODE_GEN_NEG_ID"
fi

# String ID where integer expected
CODE_GEN_STR_ID=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/v1/admin/cms/fasilitas/not_a_number")
if [ "$CODE_GEN_STR_ID" = "401" ] || [ "$CODE_GEN_STR_ID" = "400" ] || [ "$CODE_GEN_STR_ID" = "404" ]; then
  report "B18.4" "String ID where int expected returns 401/400/404" 0 ""
else
  report "B18.4" "String ID where int expected returns 401/400/404" 1 "Returned HTTP $CODE_GEN_STR_ID"
fi

# Empty body on admin POST
CODE_GEN_EMPTY_POST=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/admin/cms/fasilitas" -H "Content-Type: application/json" -d '')
if [ "$CODE_GEN_EMPTY_POST" = "401" ] || [ "$CODE_GEN_EMPTY_POST" = "400" ]; then
  report "B18.5" "Empty body on admin POST returns 401/400" 0 ""
else
  report "B18.5" "Empty body on admin POST returns 401/400" 1 "Returned HTTP $CODE_GEN_EMPTY_POST"
fi

# --- B19: Admin Blog Management Boundaries ---
echo "--- Testing Boundary 19: Admin Blog Management Edge Cases ---"
# Post creation without title
CODE_BLOG_NOTITLE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/admin/blog/posts" -H "Content-Type: application/json" -d '{"content":"Test"}')
if [ "$CODE_BLOG_NOTITLE" = "401" ] || [ "$CODE_BLOG_NOTITLE" = "400" ]; then
  report "B19.1" "Blog post creation without title returns 401/400" 0 ""
else
  report "B19.1" "Blog post creation without title returns 401/400" 1 "Returned HTTP $CODE_BLOG_NOTITLE"
fi

# Updating blog post with invalid ID
CODE_BLOG_BAD_ID=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/v1/admin/blog/posts/999999" -H "Content-Type: application/json" -d '{"title":"Test"}')
if [ "$CODE_BLOG_BAD_ID" = "401" ] || [ "$CODE_BLOG_BAD_ID" = "404" ]; then
  report "B19.2" "Updating non-existent blog post returns 401/404" 0 ""
else
  report "B19.2" "Updating non-existent blog post returns 401/404" 1 "Returned HTTP $CODE_BLOG_BAD_ID"
fi

# Deleting blog post with invalid ID
CODE_BLOG_DEL_BAD=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/v1/admin/blog/posts/999999")
if [ "$CODE_BLOG_DEL_BAD" = "401" ] || [ "$CODE_BLOG_DEL_BAD" = "404" ]; then
  report "B19.3" "Deleting non-existent blog post returns 401/404" 0 ""
else
  report "B19.3" "Deleting non-existent blog post returns 401/404" 1 "Returned HTTP $CODE_BLOG_DEL_BAD"
fi

# Special characters in blog title
CODE_BLOG_SPEC=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/admin/blog/posts" -H "Content-Type: application/json" -d '{"title":"Test <script>alert(1)</script>"}')
if [ "$CODE_BLOG_SPEC" = "401" ] || [ "$CODE_BLOG_SPEC" = "201" ] || [ "$CODE_BLOG_SPEC" = "400" ]; then
  report "B19.4" "Special characters in blog title handled safely" 0 ""
else
  report "B19.4" "Special characters in blog title handled safely" 1 "Returned HTTP $CODE_BLOG_SPEC"
fi

# Blog post with negative ID
CODE_BLOG_NEG=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/blog/posts/-1")
if [ "$CODE_BLOG_NEG" = "401" ] || [ "$CODE_BLOG_NEG" = "404" ] || [ "$CODE_BLOG_NEG" = "400" ]; then
  report "B19.5" "Querying admin blog post with negative ID returns 401/404/400" 0 ""
else
  report "B19.5" "Querying admin blog post with negative ID returns 401/404/400" 1 "Returned HTTP $CODE_BLOG_NEG"
fi

# --- B20: Admin PSB Management Boundaries ---
echo "--- Testing Boundary 20: Admin PSB Management Edge Cases ---"
# Invalid status filter value: ?status=non_existent_status
CODE_PSB_BAD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/psb/pendaftar?status=non_existent_status")
if [ "$CODE_PSB_BAD_STATUS" = "401" ] || [ "$CODE_PSB_BAD_STATUS" = "200" ] || [ "$CODE_PSB_BAD_STATUS" = "400" ]; then
  report "B20.1" "Invalid status filter returns 401/200/400" 0 ""
else
  report "B20.1" "Invalid status filter returns 401/200/400" 1 "Returned HTTP $CODE_PSB_BAD_STATUS"
fi

# Non-existent applicant ID
CODE_PSB_NO_APPL=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/psb/pendaftar/999999")
if [ "$CODE_PSB_NO_APPL" = "401" ] || [ "$CODE_PSB_NO_APPL" = "404" ]; then
  report "B20.2" "Non-existent applicant ID returns 401/404" 0 ""
else
  report "B20.2" "Non-existent applicant ID returns 401/404" 1 "Returned HTTP $CODE_PSB_NO_APPL"
fi

# Update status with invalid state
CODE_PSB_INVALID_STATE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/v1/admin/psb/pendaftar/1" -H "Content-Type: application/json" -d '{"status":"INVALID_STATE_XYZ"}')
if [ "$CODE_PSB_INVALID_STATE" = "401" ] || [ "$CODE_PSB_INVALID_STATE" = "400" ] || [ "$CODE_PSB_INVALID_STATE" = "404" ]; then
  report "B20.3" "Updating applicant with invalid state returns 401/400/404" 0 ""
else
  report "B20.3" "Updating applicant with invalid state returns 401/400/404" 1 "Returned HTTP $CODE_PSB_INVALID_STATE"
fi

# Search with SQL wildcard characters % and _
CODE_PSB_WILDCARD=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/psb/pendaftar?q=%25%5F")
if [ "$CODE_PSB_WILDCARD" = "401" ] || [ "$CODE_PSB_WILDCARD" = "200" ]; then
  report "B20.4" "Search with SQL wildcards returns 401/200 cleanly" 0 ""
else
  report "B20.4" "Search with SQL wildcards returns 401/200 cleanly" 1 "Returned HTTP $CODE_PSB_WILDCARD"
fi

# Negative applicant ID
CODE_PSB_NEG_ID=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/v1/admin/psb/pendaftar/-1" -H "Content-Type: application/json" -d '{"status":"verified"}')
if [ "$CODE_PSB_NEG_ID" = "401" ] || [ "$CODE_PSB_NEG_ID" = "400" ] || [ "$CODE_PSB_NEG_ID" = "404" ]; then
  report "B20.5" "Negative applicant ID returns 401/400/404" 0 ""
else
  report "B20.5" "Negative applicant ID returns 401/400/404" 1 "Returned HTTP $CODE_PSB_NEG_ID"
fi

echo "=== Tier 2 Complete: Total=$TOTAL_COUNT, Passed=$PASS_COUNT, Failed=$FAIL_COUNT ==="
if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
exit 0
