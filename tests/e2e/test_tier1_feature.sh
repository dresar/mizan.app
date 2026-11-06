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

echo "=== Running Tier 1: Feature Coverage (100 Test Cases across 20 Features) ==="

# --- F1: Dual-Entry Vite Build ---
echo "--- Testing Feature 1: Dual-Entry Vite Build ---"
if [ -f "$HUB_DIR/dist/index.html" ]; then
  report "TC1.1" "dist/index.html exists" 0 ""
else
  report "TC1.1" "dist/index.html exists" 1 "File not found in $HUB_DIR/dist"
fi

if [ -f "$HUB_DIR/dist/admin.html" ]; then
  report "TC1.2" "dist/admin.html exists" 0 ""
else
  report "TC1.2" "dist/admin.html exists" 1 "File not found in $HUB_DIR/dist"
fi

if grep -q "assets/.*\.js" "$HUB_DIR/dist/index.html" 2>/dev/null; then
  report "TC1.3" "dist/index.html references compiled assets" 0 ""
else
  report "TC1.3" "dist/index.html references compiled assets" 1 "No asset script reference found"
fi

if grep -q "assets/.*\.js" "$HUB_DIR/dist/admin.html" 2>/dev/null; then
  report "TC1.4" "dist/admin.html references compiled assets" 0 ""
else
  report "TC1.4" "dist/admin.html references compiled assets" 1 "No asset script reference found"
fi

if grep -q "<!doctype html>" "$HUB_DIR/dist/index.html" 2>/dev/null || grep -q "<!DOCTYPE html>" "$HUB_DIR/dist/index.html" 2>/dev/null; then
  report "TC1.5" "dist/index.html has valid DOCTYPE" 0 ""
else
  report "TC1.5" "dist/index.html has valid DOCTYPE" 1 "Missing DOCTYPE declaration"
fi

# --- F2: Asset Integration ---
echo "--- Testing Feature 2: Asset Integration ---"
if [ -f "$GOBACKEND_DIR/web_public/index.html" ]; then
  report "TC2.1" "web_public/index.html exists" 0 ""
else
  report "TC2.1" "web_public/index.html exists" 1 "web_public/index.html missing"
fi

if [ -f "$GOBACKEND_DIR/web_public/admin.html" ]; then
  report "TC2.2" "web_public/admin.html exists" 0 ""
else
  report "TC2.2" "web_public/admin.html exists" 1 "web_public/admin.html missing"
fi

if [ -d "$GOBACKEND_DIR/web_public/assets" ] && [ -n "$(ls -A "$GOBACKEND_DIR/web_public/assets" 2>/dev/null)" ]; then
  report "TC2.3" "web_public/assets contains bundle files" 0 ""
else
  report "TC2.3" "web_public/assets contains bundle files" 1 "web_public/assets directory missing or empty"
fi

if [ -f "$GOBACKEND_DIR/web_public/robots.txt" ]; then
  report "TC2.4" "web_public/robots.txt exists" 0 ""
else
  report "TC2.4" "web_public/robots.txt exists" 1 "web_public/robots.txt missing"
fi

if [ -f "$GOBACKEND_DIR/web_public/sitemap.xml" ]; then
  report "TC2.5" "web_public/sitemap.xml exists" 0 ""
else
  report "TC2.5" "web_public/sitemap.xml exists" 1 "web_public/sitemap.xml missing"
fi

# --- F3: Public Portal SEO Tags ---
echo "--- Testing Feature 3: Public Portal SEO Tags ---"
PUBLIC_INDEX="$GOBACKEND_DIR/web_public/index.html"
if [ ! -f "$PUBLIC_INDEX" ]; then
  PUBLIC_INDEX="$HUB_DIR/index.html"
fi

if grep -q "<title>" "$PUBLIC_INDEX" 2>/dev/null; then
  report "TC3.1" "index.html has <title> tag" 0 ""
else
  report "TC3.1" "index.html has <title> tag" 1 "Missing <title> tag"
fi

if grep -q 'name="description"' "$PUBLIC_INDEX" 2>/dev/null; then
  report "TC3.2" "index.html has <meta name=\"description\">" 0 ""
else
  report "TC3.2" "index.html has <meta name=\"description\">" 1 "Missing meta description"
fi

if grep -q 'rel="canonical"' "$PUBLIC_INDEX" 2>/dev/null; then
  report "TC3.3" "index.html has canonical link" 0 ""
else
  report "TC3.3" "index.html has canonical link" 1 "Missing canonical link"
fi

if grep -q 'property="og:title"' "$PUBLIC_INDEX" 2>/dev/null && grep -q 'property="og:description"' "$PUBLIC_INDEX" 2>/dev/null; then
  report "TC3.4" "index.html has Open Graph tags (og:title, og:description)" 0 ""
else
  report "TC3.4" "index.html has Open Graph tags (og:title, og:description)" 1 "Missing Open Graph tags"
fi

if grep -q 'name="twitter:card"' "$PUBLIC_INDEX" 2>/dev/null; then
  report "TC3.5" "index.html has Twitter Card tags" 0 ""
else
  report "TC3.5" "index.html has Twitter Card tags" 1 "Missing Twitter Card tags"
fi

# --- F4: Schema.org Structured Data ---
echo "--- Testing Feature 4: Schema.org Structured Data ---"
if grep -q 'type="application/ld+json"' "$PUBLIC_INDEX" 2>/dev/null; then
  report "TC4.1" "index.html has application/ld+json script tag" 0 ""
else
  report "TC4.1" "index.html has application/ld+json script tag" 1 "Missing application/ld+json tag"
fi

JSON_VALID=$(python3 -c '
import sys, re, json
with open(sys.argv[1], "r") as f:
    c = f.read()
m = re.findall(r"""<script[^>]*type=["\x27]application/ld\+json["\x27][^>]*>(.*?)</script>""", c, re.DOTALL)
if not m:
    sys.exit(1)
for s in m:
    json.loads(s.strip())
sys.exit(0)
' "$PUBLIC_INDEX" 2>/dev/null && echo "VALID" || echo "INVALID")

if [ "$JSON_VALID" = "VALID" ]; then
  report "TC4.2" "JSON-LD structured data parses as valid JSON" 0 ""
else
  report "TC4.2" "JSON-LD structured data parses as valid JSON" 1 "Invalid JSON-LD syntax"
fi

if grep -q '"WebSite"' "$PUBLIC_INDEX" 2>/dev/null; then
  report "TC4.3" "JSON-LD includes WebSite schema" 0 ""
else
  report "TC4.3" "JSON-LD includes WebSite schema" 1 "Missing WebSite schema"
fi

if grep -q '"EducationalOrganization"' "$PUBLIC_INDEX" 2>/dev/null || grep -q '"School"' "$PUBLIC_INDEX" 2>/dev/null; then
  report "TC4.4" "JSON-LD includes EducationalOrganization/School schema" 0 ""
else
  report "TC4.4" "JSON-LD includes EducationalOrganization/School schema" 1 "Missing EducationalOrganization schema"
fi

if grep -q '"name"' "$PUBLIC_INDEX" 2>/dev/null && grep -q '"url"' "$PUBLIC_INDEX" 2>/dev/null; then
  report "TC4.5" "JSON-LD specifies entity name and URL" 0 ""
else
  report "TC4.5" "JSON-LD specifies entity name and URL" 1 "Missing name or url in schema"
fi

# --- F5: SEO Static Files ---
echo "--- Testing Feature 5: SEO Static Files ---"
CODE_ROBOTS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/robots.txt")
if [ "$CODE_ROBOTS" = "200" ]; then
  report "TC5.1" "GET /robots.txt returns HTTP 200" 0 ""
else
  report "TC5.1" "GET /robots.txt returns HTTP 200" 1 "Returned HTTP $CODE_ROBOTS"
fi

ROBOTS_BODY=$(curl -s "$BASE_URL/robots.txt")
if echo "$ROBOTS_BODY" | grep -q "User-agent:"; then
  report "TC5.2" "/robots.txt contains User-agent directive" 0 ""
else
  report "TC5.2" "/robots.txt contains User-agent directive" 1 "Missing User-agent directive"
fi

if echo "$ROBOTS_BODY" | grep -q "Disallow: /admin"; then
  report "TC5.3" "/robots.txt disallows admin paths" 0 ""
else
  report "TC5.3" "/robots.txt disallows admin paths" 1 "Missing Disallow: /admin"
fi

CODE_SITEMAP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/sitemap.xml")
if [ "$CODE_SITEMAP" = "200" ]; then
  report "TC5.4" "GET /sitemap.xml returns HTTP 200" 0 ""
else
  report "TC5.4" "GET /sitemap.xml returns HTTP 200" 1 "Returned HTTP $CODE_SITEMAP"
fi

SITEMAP_BODY=$(curl -s "$BASE_URL/sitemap.xml")
if echo "$SITEMAP_BODY" | grep -q "<urlset" && echo "$SITEMAP_BODY" | grep -q "<loc>"; then
  report "TC5.5" "/sitemap.xml contains valid <urlset> and <loc> entries" 0 ""
else
  report "TC5.5" "/sitemap.xml contains valid <urlset> and <loc> entries" 1 "Missing <urlset> or <loc>"
fi

# --- F6: Fiber Dual Static Serving ---
echo "--- Testing Feature 6: Fiber Dual Static Serving ---"
CODE_ROOT=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$CODE_ROOT" = "200" ]; then
  report "TC6.1" "GET / returns HTTP 200" 0 ""
else
  report "TC6.1" "GET / returns HTTP 200" 1 "Returned HTTP $CODE_ROOT"
fi

CODE_ADMIN_HTML=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin.html")
if [ "$CODE_ADMIN_HTML" = "200" ]; then
  report "TC6.2" "GET /admin.html returns HTTP 200" 0 ""
else
  report "TC6.2" "GET /admin.html returns HTTP 200" 1 "Returned HTTP $CODE_ADMIN_HTML"
fi

CODE_ADMIN_CMS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin-cms")
if [ "$CODE_ADMIN_CMS" = "200" ]; then
  report "TC6.3" "GET /admin-cms returns HTTP 200" 0 ""
else
  report "TC6.3" "GET /admin-cms returns HTTP 200" 1 "Returned HTTP $CODE_ADMIN_CMS"
fi

CODE_ADMIN_CMS_SUB=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin-cms/dashboard")
if [ "$CODE_ADMIN_CMS_SUB" = "200" ]; then
  report "TC6.4" "GET /admin-cms/dashboard returns HTTP 200 (SPA fallback to admin.html)" 0 ""
else
  report "TC6.4" "GET /admin-cms/dashboard returns HTTP 200 (SPA fallback to admin.html)" 1 "Returned HTTP $CODE_ADMIN_CMS_SUB"
fi

CODE_PUBLIC_SUB=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/profil/sejarah")
if [ "$CODE_PUBLIC_SUB" = "200" ]; then
  report "TC6.5" "GET /profil/sejarah returns HTTP 200 (SPA fallback to index.html)" 0 ""
else
  report "TC6.5" "GET /profil/sejarah returns HTTP 200 (SPA fallback to index.html)" 1 "Returned HTTP $CODE_PUBLIC_SUB"
fi

# --- F7: Vite Asset Serving ---
echo "--- Testing Feature 7: Vite Asset Serving ---"
SAMPLE_JS=$(find "$GOBACKEND_DIR/web_public/assets" -type f -name "*.js" 2>/dev/null | head -n 1)
JS_BASENAME=""
if [ -n "$SAMPLE_JS" ]; then
  JS_BASENAME=$(basename "$SAMPLE_JS")
fi

if [ -n "$JS_BASENAME" ]; then
  CODE_JS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/assets/$JS_BASENAME")
  if [ "$CODE_JS" = "200" ]; then
    report "TC7.1" "GET /assets/*.js returns HTTP 200" 0 ""
  else
    report "TC7.1" "GET /assets/*.js returns HTTP 200" 1 "Returned HTTP $CODE_JS"
  fi
else
  report "TC7.1" "GET /assets/*.js returns HTTP 200" 1 "No JS bundle found in web_public/assets"
fi

SAMPLE_CSS=$(find "$GOBACKEND_DIR/web_public/assets" -type f -name "*.css" 2>/dev/null | head -n 1)
CSS_BASENAME=""
if [ -n "$SAMPLE_CSS" ]; then
  CSS_BASENAME=$(basename "$SAMPLE_CSS")
fi

if [ -n "$CSS_BASENAME" ]; then
  CODE_CSS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/assets/$CSS_BASENAME")
  if [ "$CODE_CSS" = "200" ]; then
    report "TC7.2" "GET /assets/*.css returns HTTP 200" 0 ""
  else
    report "TC7.2" "GET /assets/*.css returns HTTP 200" 1 "Returned HTTP $CODE_CSS"
  fi
else
  report "TC7.2" "GET /assets/*.css returns HTTP 200" 1 "No CSS bundle found in web_public/assets"
fi

if [ -n "$JS_BASENAME" ]; then
  CT_JS=$(curl -s -I "$BASE_URL/assets/$JS_BASENAME" | grep -i "^content-type:" | tr -d '\r')
  if echo "$CT_JS" | grep -qi "javascript"; then
    report "TC7.3" "Vite JS asset has javascript Content-Type" 0 ""
  else
    report "TC7.3" "Vite JS asset has javascript Content-Type" 1 "Content-Type: $CT_JS"
  fi
else
  report "TC7.3" "Vite JS asset has javascript Content-Type" 1 "No JS asset to test"
fi

if [ -n "$CSS_BASENAME" ]; then
  CT_CSS=$(curl -s -I "$BASE_URL/assets/$CSS_BASENAME" | grep -i "^content-type:" | tr -d '\r')
  if echo "$CT_CSS" | grep -qi "text/css"; then
    report "TC7.4" "Vite CSS asset has text/css Content-Type" 0 ""
  else
    report "TC7.4" "Vite CSS asset has text/css Content-Type" 1 "Content-Type: $CT_CSS"
  fi
else
  report "TC7.4" "Vite CSS asset has text/css Content-Type" 1 "No CSS asset to test"
fi

if [ -n "$JS_BASENAME" ]; then
  CC_VAL=$(curl -s -I "$BASE_URL/assets/$JS_BASENAME" | grep -i "^cache-control:" | tr -d '\r')
  if echo "$CC_VAL" | grep -qi "max-age"; then
    report "TC7.5" "Vite assets have cache-control max-age" 0 ""
  else
    report "TC7.5" "Vite assets have cache-control max-age" 1 "Cache-Control: $CC_VAL"
  fi
else
  report "TC7.5" "Vite assets have cache-control max-age" 1 "No JS asset to test"
fi

# --- F8: Mizan Operational Preservation ---
echo "--- Testing Feature 8: Mizan Operational Preservation ---"
CODE_ABSENSI=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/absensi")
if [ "$CODE_ABSENSI" = "200" ]; then
  report "TC8.1" "GET /admin/absensi returns HTTP 200 (serving Mizan Apps)" 0 ""
else
  report "TC8.1" "GET /admin/absensi returns HTTP 200 (serving Mizan Apps)" 1 "Returned HTTP $CODE_ABSENSI"
fi

CODE_LOGIN=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/login")
if [ "$CODE_LOGIN" = "200" ]; then
  report "TC8.2" "GET /login returns HTTP 200 (serving Mizan Login)" 0 ""
else
  report "TC8.2" "GET /login returns HTTP 200 (serving Mizan Login)" 1 "Returned HTTP $CODE_LOGIN"
fi

CODE_NEXT=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/_next/static/chunks/main-app.js")
if [ "$CODE_NEXT" = "200" ] || [ "$CODE_NEXT" = "404" ]; then
  report "TC8.3" "/_next/* route responds without 500 error" 0 ""
else
  report "TC8.3" "/_next/* route responds without 500 error" 1 "Returned HTTP $CODE_NEXT"
fi

MOD_APP=$(git status --porcelain "$APP_ROOT/app" 2>/dev/null)
if [ -z "$MOD_APP" ]; then
  report "TC8.4" "Zero files modified under app/ (strict isolation)" 0 ""
else
  report "TC8.4" "Zero files modified under app/ (strict isolation)" 1 "Found modifications in app/: $MOD_APP"
fi

CODE_MIZAN_DATA=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/data")
if [ "$CODE_MIZAN_DATA" = "200" ]; then
  report "TC8.5" "Operational Mizan API GET /api/data returns HTTP 200" 0 ""
else
  report "TC8.5" "Operational Mizan API GET /api/data returns HTTP 200" 1 "Returned HTTP $CODE_MIZAN_DATA"
fi

# --- F9: Database Schema Initialization ---
echo "--- Testing Feature 9: Database Schema Initialization ---"
SCHEMA_SQL="$GOBACKEND_DIR/internal/database/portal_schema.sql"
if [ -f "$SCHEMA_SQL" ]; then
  report "TC9.1" "portal_schema.sql exists in gobackend/internal/database" 0 ""
else
  report "TC9.1" "portal_schema.sql exists in gobackend/internal/database" 1 "portal_schema.sql missing"
fi

if grep -q "core_websitesettings" "$SCHEMA_SQL" 2>/dev/null; then
  report "TC9.2" "portal_schema.sql declares core_websitesettings" 0 ""
else
  report "TC9.2" "portal_schema.sql declares core_websitesettings" 1 "Missing core_websitesettings declaration"
fi

if grep -q "core_herosection" "$SCHEMA_SQL" 2>/dev/null; then
  report "TC9.3" "portal_schema.sql declares core_herosection" 0 ""
else
  report "TC9.3" "portal_schema.sql declares core_herosection" 1 "Missing core_herosection declaration"
fi

if grep -q "blog_blogpost" "$SCHEMA_SQL" 2>/dev/null; then
  report "TC9.4" "portal_schema.sql declares blog_blogpost" 0 ""
else
  report "TC9.4" "portal_schema.sql declares blog_blogpost" 1 "Missing blog_blogpost declaration"
fi

if grep -q "admissions_santri" "$SCHEMA_SQL" 2>/dev/null; then
  report "TC9.5" "portal_schema.sql declares admissions_santri" 0 ""
else
  report "TC9.5" "portal_schema.sql declares admissions_santri" 1 "Missing admissions_santri declaration"
fi

# --- F10: Public Website Settings API ---
echo "--- Testing Feature 10: Public Website Settings API ---"
RESP_SETTINGS=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/v1/public/website-settings")
CODE_SETTINGS=$(echo "$RESP_SETTINGS" | tail -n 1)
BODY_SETTINGS=$(echo "$RESP_SETTINGS" | sed '$d')

if [ "$CODE_SETTINGS" = "200" ]; then
  report "TC10.1" "GET /api/v1/public/website-settings returns HTTP 200" 0 ""
else
  report "TC10.1" "GET /api/v1/public/website-settings returns HTTP 200" 1 "Returned HTTP $CODE_SETTINGS: $BODY_SETTINGS"
fi

CT_SETTINGS=$(curl -s -I "$BASE_URL/api/v1/public/website-settings" | grep -i "^content-type:" | tr -d '\r')
if echo "$CT_SETTINGS" | grep -qi "application/json"; then
  report "TC10.2" "website-settings has application/json Content-Type" 0 ""
else
  report "TC10.2" "website-settings has application/json Content-Type" 1 "Content-Type: $CT_SETTINGS"
fi

if echo "$BODY_SETTINGS" | grep -q '"name"'; then
  report "TC10.3" "website-settings JSON contains 'name' attribute" 0 ""
else
  report "TC10.3" "website-settings JSON contains 'name' attribute" 1 "Missing 'name' field"
fi

if echo "$BODY_SETTINGS" | grep -q '"email"' || echo "$BODY_SETTINGS" | grep -q '"phone"'; then
  report "TC10.4" "website-settings JSON contains contact metadata" 0 ""
else
  report "TC10.4" "website-settings JSON contains contact metadata" 1 "Missing contact info"
fi

RESP_NO_AUTH=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization:" "$BASE_URL/api/v1/public/website-settings")
if [ "$RESP_NO_AUTH" = "200" ]; then
  report "TC10.5" "website-settings accessible without Authorization header" 0 ""
else
  report "TC10.5" "website-settings accessible without Authorization header" 1 "Returned HTTP $RESP_NO_AUTH"
fi

# --- F11: Public Hero Section API ---
echo "--- Testing Feature 11: Public Hero Section API ---"
RESP_HERO=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/v1/public/hero-section")
CODE_HERO=$(echo "$RESP_HERO" | tail -n 1)
BODY_HERO=$(echo "$RESP_HERO" | sed '$d')

if [ "$CODE_HERO" = "200" ]; then
  report "TC11.1" "GET /api/v1/public/hero-section returns HTTP 200" 0 ""
else
  report "TC11.1" "GET /api/v1/public/hero-section returns HTTP 200" 1 "Returned HTTP $CODE_HERO: $BODY_HERO"
fi

CT_HERO=$(curl -s -I "$BASE_URL/api/v1/public/hero-section" | grep -i "^content-type:" | tr -d '\r')
if echo "$CT_HERO" | grep -qi "application/json"; then
  report "TC11.2" "hero-section has application/json Content-Type" 0 ""
else
  report "TC11.2" "hero-section has application/json Content-Type" 1 "Content-Type: $CT_HERO"
fi

IS_ARRAY=$(python3 -c "import json, sys; d=json.loads('''$BODY_HERO'''); sys.exit(0 if isinstance(d, list) or (isinstance(d, dict) and 'data' in d) else 1)" 2>/dev/null && echo "YES" || echo "NO")
if [ "$IS_ARRAY" = "YES" ]; then
  report "TC11.3" "hero-section returns list or array structure" 0 ""
else
  report "TC11.3" "hero-section returns list or array structure" 1 "Not an array payload"
fi

if echo "$BODY_HERO" | grep -q '"title"'; then
  report "TC11.4" "hero-section contains title field" 0 ""
else
  report "TC11.4" "hero-section contains title field" 1 "Missing title field"
fi

if echo "$BODY_HERO" | grep -q '"image"'; then
  report "TC11.5" "hero-section contains image field" 0 ""
else
  report "TC11.5" "hero-section contains image field" 1 "Missing image field"
fi

# --- F12: Public Visi Misi API ---
echo "--- Testing Feature 12: Public Visi Misi API ---"
RESP_VM=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/v1/public/visi-misi")
CODE_VM=$(echo "$RESP_VM" | tail -n 1)
BODY_VM=$(echo "$RESP_VM" | sed '$d')

if [ "$CODE_VM" = "200" ]; then
  report "TC12.1" "GET /api/v1/public/visi-misi returns HTTP 200" 0 ""
else
  report "TC12.1" "GET /api/v1/public/visi-misi returns HTTP 200" 1 "Returned HTTP $CODE_VM: $BODY_VM"
fi

CT_VM=$(curl -s -I "$BASE_URL/api/v1/public/visi-misi" | grep -i "^content-type:" | tr -d '\r')
if echo "$CT_VM" | grep -qi "application/json"; then
  report "TC12.2" "visi-misi has application/json Content-Type" 0 ""
else
  report "TC12.2" "visi-misi has application/json Content-Type" 1 "Content-Type: $CT_VM"
fi

if echo "$BODY_VM" | grep -q '"visi"'; then
  report "TC12.3" "visi-misi JSON contains 'visi' attribute" 0 ""
else
  report "TC12.3" "visi-misi JSON contains 'visi' attribute" 1 "Missing 'visi' field"
fi

if echo "$BODY_VM" | grep -q '"misi"'; then
  report "TC12.4" "visi-misi JSON contains 'misi' attribute" 0 ""
else
  report "TC12.4" "visi-misi JSON contains 'misi' attribute" 1 "Missing 'misi' field"
fi

if [ "$CODE_VM" = "200" ] && [ -n "$BODY_VM" ]; then
  report "TC12.5" "visi-misi response is non-empty" 0 ""
else
  report "TC12.5" "visi-misi response is non-empty" 1 "Empty response body"
fi

# --- F13: Public Fasilitas API ---
echo "--- Testing Feature 13: Public Fasilitas API ---"
RESP_FAS=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/v1/public/fasilitas")
CODE_FAS=$(echo "$RESP_FAS" | tail -n 1)
BODY_FAS=$(echo "$RESP_FAS" | sed '$d')

if [ "$CODE_FAS" = "200" ]; then
  report "TC13.1" "GET /api/v1/public/fasilitas returns HTTP 200" 0 ""
else
  report "TC13.1" "GET /api/v1/public/fasilitas returns HTTP 200" 1 "Returned HTTP $CODE_FAS: $BODY_FAS"
fi

CT_FAS=$(curl -s -I "$BASE_URL/api/v1/public/fasilitas" | grep -i "^content-type:" | tr -d '\r')
if echo "$CT_FAS" | grep -qi "application/json"; then
  report "TC13.2" "fasilitas has application/json Content-Type" 0 ""
else
  report "TC13.2" "fasilitas has application/json Content-Type" 1 "Content-Type: $CT_FAS"
fi

IS_FAS_ARRAY=$(python3 -c "import json, sys; d=json.loads('''$BODY_FAS'''); sys.exit(0 if isinstance(d, list) or (isinstance(d, dict) and 'data' in d) else 1)" 2>/dev/null && echo "YES" || echo "NO")
if [ "$IS_FAS_ARRAY" = "YES" ]; then
  report "TC13.3" "fasilitas returns array or data list" 0 ""
else
  report "TC13.3" "fasilitas returns array or data list" 1 "Not an array payload"
fi

if echo "$BODY_FAS" | grep -q '"name"'; then
  report "TC13.4" "fasilitas payload contains 'name' attribute" 0 ""
else
  report "TC13.4" "fasilitas payload contains 'name' attribute" 1 "Missing 'name' field"
fi

if echo "$BODY_FAS" | grep -q '"description"'; then
  report "TC13.5" "fasilitas payload contains 'description' attribute" 0 ""
else
  report "TC13.5" "fasilitas payload contains 'description' attribute" 1 "Missing 'description' field"
fi

# --- F14: Public Tenaga Pengajar API ---
echo "--- Testing Feature 14: Public Tenaga Pengajar API ---"
RESP_TP=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/v1/public/tenaga-pengajar")
CODE_TP=$(echo "$RESP_TP" | tail -n 1)
BODY_TP=$(echo "$RESP_TP" | sed '$d')

if [ "$CODE_TP" = "200" ]; then
  report "TC14.1" "GET /api/v1/public/tenaga-pengajar returns HTTP 200" 0 ""
else
  report "TC14.1" "GET /api/v1/public/tenaga-pengajar returns HTTP 200" 1 "Returned HTTP $CODE_TP: $BODY_TP"
fi

CT_TP=$(curl -s -I "$BASE_URL/api/v1/public/tenaga-pengajar" | grep -i "^content-type:" | tr -d '\r')
if echo "$CT_TP" | grep -qi "application/json"; then
  report "TC14.2" "tenaga-pengajar has application/json Content-Type" 0 ""
else
  report "TC14.2" "tenaga-pengajar has application/json Content-Type" 1 "Content-Type: $CT_TP"
fi

if echo "$BODY_TP" | grep -q '"data"'; then
  report "TC14.3" "tenaga-pengajar payload contains 'data' list" 0 ""
else
  report "TC14.3" "tenaga-pengajar payload contains 'data' list" 1 "Missing 'data' field"
fi

if echo "$BODY_TP" | grep -q '"pagination"' || echo "$BODY_TP" | grep -q '"total"'; then
  report "TC14.4" "tenaga-pengajar payload contains pagination meta" 0 ""
else
  report "TC14.4" "tenaga-pengajar payload contains pagination meta" 1 "Missing pagination meta"
fi

CODE_TP_PAGE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/tenaga-pengajar?page=1&limit=5")
if [ "$CODE_TP_PAGE" = "200" ]; then
  report "TC14.5" "tenaga-pengajar supports pagination query params" 0 ""
else
  report "TC14.5" "tenaga-pengajar supports pagination query params" 1 "Returned HTTP $CODE_TP_PAGE"
fi

# --- F15: Public Blog Posts API ---
echo "--- Testing Feature 15: Public Blog Posts API ---"
RESP_POSTS=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/v1/public/posts")
CODE_POSTS=$(echo "$RESP_POSTS" | tail -n 1)
BODY_POSTS=$(echo "$RESP_POSTS" | sed '$d')

if [ "$CODE_POSTS" = "200" ]; then
  report "TC15.1" "GET /api/v1/public/posts returns HTTP 200" 0 ""
else
  report "TC15.1" "GET /api/v1/public/posts returns HTTP 200" 1 "Returned HTTP $CODE_POSTS: $BODY_POSTS"
fi

CT_POSTS=$(curl -s -I "$BASE_URL/api/v1/public/posts" | grep -i "^content-type:" | tr -d '\r')
if echo "$CT_POSTS" | grep -qi "application/json"; then
  report "TC15.2" "posts has application/json Content-Type" 0 ""
else
  report "TC15.2" "posts has application/json Content-Type" 1 "Content-Type: $CT_POSTS"
fi

if echo "$BODY_POSTS" | grep -q '"data"'; then
  report "TC15.3" "posts payload contains 'data' list" 0 ""
else
  report "TC15.3" "posts payload contains 'data' list" 1 "Missing 'data' field"
fi

CODE_SLUG=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/posts/sample-post")
if [ "$CODE_SLUG" = "200" ] || [ "$CODE_SLUG" = "404" ]; then
  report "TC15.4" "GET /api/v1/public/posts/:slug returns 200 or clean 404" 0 ""
else
  report "TC15.4" "GET /api/v1/public/posts/:slug returns 200 or clean 404" 1 "Returned HTTP $CODE_SLUG"
fi

if echo "$BODY_POSTS" | grep -q '"slug"'; then
  report "TC15.5" "posts items include 'slug' field" 0 ""
else
  report "TC15.5" "posts items include 'slug' field" 1 "Missing 'slug' in posts"
fi

# --- F16: Public PSB Registration API ---
echo "--- Testing Feature 16: Public PSB Registration API ---"
TEST_NISN="NISN$RANDOM$RANDOM"
PSB_PAYLOAD=$(cat <<EOF
{
  "full_name": "Calon Santri E2E Test",
  "nisn": "$TEST_NISN",
  "gender": "L",
  "phone": "081234567890",
  "email": "test-$TEST_NISN@example.com",
  "address": "Jl. Pesantren No. 1",
  "program_id": 1
}
EOF
)

RESP_PSB=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" \
  -H "Content-Type: application/json" \
  -d "$PSB_PAYLOAD")
CODE_PSB=$(echo "$RESP_PSB" | tail -n 1)
BODY_PSB=$(echo "$RESP_PSB" | sed '$d')

if [ "$CODE_PSB" = "201" ] || [ "$CODE_PSB" = "200" ]; then
  report "TC16.1" "POST /api/v1/public/psb/daftar returns HTTP 201/200" 0 ""
else
  report "TC16.1" "POST /api/v1/public/psb/daftar returns HTTP 201/200" 1 "Returned HTTP $CODE_PSB: $BODY_PSB"
fi

CT_PSB=$(curl -s -I -X POST "$BASE_URL/api/v1/public/psb/daftar" \
  -H "Content-Type: application/json" -d "$PSB_PAYLOAD" | grep -i "^content-type:" | tr -d '\r')
if echo "$CT_PSB" | grep -qi "application/json"; then
  report "TC16.2" "psb/daftar has application/json Content-Type" 0 ""
else
  report "TC16.2" "psb/daftar has application/json Content-Type" 1 "Content-Type: $CT_PSB"
fi

if echo "$BODY_PSB" | grep -qi "registration_no" || echo "$BODY_PSB" | grep -qi "success"; then
  report "TC16.3" "psb/daftar returns confirmation or registration_no" 0 ""
else
  report "TC16.3" "psb/daftar returns confirmation or registration_no" 1 "Missing confirmation"
fi

CODE_MALFORMED=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" \
  -H "Content-Type: application/json" \
  -d '{"invalid_json": ')
if [ "$CODE_MALFORMED" = "400" ]; then
  report "TC16.4" "psb/daftar rejects malformed JSON with HTTP 400" 0 ""
else
  report "TC16.4" "psb/daftar rejects malformed JSON with HTTP 400" 1 "Returned HTTP $CODE_MALFORMED"
fi

CODE_EMPTY=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" \
  -H "Content-Type: application/json" \
  -d '{}')
if [ "$CODE_EMPTY" = "400" ] || [ "$CODE_EMPTY" = "422" ]; then
  report "TC16.5" "psb/daftar rejects empty payload with HTTP 400/422" 0 ""
else
  report "TC16.5" "psb/daftar rejects empty payload with HTTP 400/422" 1 "Returned HTTP $CODE_EMPTY"
fi

# --- F17: Admin JWT Authentication ---
echo "--- Testing Feature 17: Admin JWT Authentication ---"
CODE_NO_TOKEN=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/cms/website-settings")
if [ "$CODE_NO_TOKEN" = "401" ]; then
  report "TC17.1" "Admin endpoint without token returns HTTP 401" 0 ""
else
  report "TC17.1" "Admin endpoint without token returns HTTP 401" 1 "Returned HTTP $CODE_NO_TOKEN"
fi

CODE_INVALID_TOKEN=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer invalidtoken123" "$BASE_URL/api/v1/admin/cms/website-settings")
if [ "$CODE_INVALID_TOKEN" = "401" ]; then
  report "TC17.2" "Admin endpoint with invalid token returns HTTP 401" 0 ""
else
  report "TC17.2" "Admin endpoint with invalid token returns HTTP 401" 1 "Returned HTTP $CODE_INVALID_TOKEN"
fi

CODE_BAD_HEADER=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Token invalidtoken123" "$BASE_URL/api/v1/admin/cms/website-settings")
if [ "$CODE_BAD_HEADER" = "401" ]; then
  report "TC17.3" "Admin endpoint with non-Bearer header returns HTTP 401" 0 ""
else
  report "TC17.3" "Admin endpoint with non-Bearer header returns HTTP 401" 1 "Returned HTTP $CODE_BAD_HEADER"
fi

CODE_EMPTY_BEARER=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer " "$BASE_URL/api/v1/admin/cms/website-settings")
if [ "$CODE_EMPTY_BEARER" = "401" ]; then
  report "TC17.4" "Admin endpoint with empty Bearer token returns HTTP 401" 0 ""
else
  report "TC17.4" "Admin endpoint with empty Bearer token returns HTTP 401" 1 "Returned HTTP $CODE_EMPTY_BEARER"
fi

# Generate admin JWT token for subsequent authenticated testing
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"password123\"}")
ADMIN_TOKEN=$(echo "$LOGIN_RESP" | grep -o "\"token\":\"[^\"]*" | cut -d"\"" -f4)

if [ -n "$ADMIN_TOKEN" ]; then
  report "TC17.5" "Admin login yields valid Bearer JWT token" 0 ""
else
  report "TC17.5" "Admin login yields valid Bearer JWT token" 1 "Failed to obtain JWT token: $LOGIN_RESP"
fi

# --- F18: Admin CMS Generic API (Authenticated CRUD) ---
echo "--- Testing Feature 18: Admin CMS Generic API ---"
CODE_GENERIC_AUTH=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/v1/admin/cms/fasilitas")
if [ "$CODE_GENERIC_AUTH" = "200" ]; then
  report "TC18.1" "GET /api/v1/admin/cms/fasilitas authenticated returns HTTP 200" 0 ""
else
  report "TC18.1" "GET /api/v1/admin/cms/fasilitas authenticated returns HTTP 200" 1 "Returned HTTP $CODE_GENERIC_AUTH"
fi

FAQ_QUERY="E2E FAQ Test $(date +%s)"
CODE_POST_GENERIC=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/admin/cms/faq" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"pertanyaan\":\"$FAQ_QUERY\",\"jawaban\":\"Jawaban validasi E2E\",\"kategori\":\"Umum\",\"order\":99,\"is_published\":true}")
if [ "$CODE_POST_GENERIC" = "201" ]; then
  report "TC18.2" "POST /api/v1/admin/cms/faq authenticated returns HTTP 201 Created" 0 ""
else
  report "TC18.2" "POST /api/v1/admin/cms/faq authenticated returns HTTP 201 Created" 1 "Returned HTTP $CODE_POST_GENERIC"
fi

CREATED_FAQ_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/v1/admin/cms/faq" | \
  python3 -c "import sys, json; data=json.load(sys.stdin).get('data', []); m=[x['id'] for x in data if x.get('pertanyaan')=='$FAQ_QUERY']; print(m[0] if m else '')" 2>/dev/null)

if [ -n "$CREATED_FAQ_ID" ]; then
  CODE_PUT_GENERIC=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/v1/admin/cms/faq/$CREATED_FAQ_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"pertanyaan\":\"$FAQ_QUERY Updated\",\"jawaban\":\"Jawaban updated\"}")
  if [ "$CODE_PUT_GENERIC" = "200" ]; then
    report "TC18.3" "PUT /api/v1/admin/cms/faq/:id authenticated returns HTTP 200" 0 ""
  else
    report "TC18.3" "PUT /api/v1/admin/cms/faq/:id authenticated returns HTTP 200" 1 "Returned HTTP $CODE_PUT_GENERIC"
  fi

  CODE_DEL_GENERIC=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/v1/admin/cms/faq/$CREATED_FAQ_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  if [ "$CODE_DEL_GENERIC" = "200" ]; then
    report "TC18.4" "DELETE /api/v1/admin/cms/faq/:id authenticated returns HTTP 200" 0 ""
  else
    report "TC18.4" "DELETE /api/v1/admin/cms/faq/:id authenticated returns HTTP 200" 1 "Returned HTTP $CODE_DEL_GENERIC"
  fi
else
  report "TC18.3" "PUT /api/v1/admin/cms/faq/:id authenticated returns HTTP 200" 1 "Created FAQ not found"
  report "TC18.4" "DELETE /api/v1/admin/cms/faq/:id authenticated returns HTTP 200" 1 "Created FAQ not found"
fi

CODE_INVALID_SECTION=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/v1/admin/cms/invalid_section_12345")
if [ "$CODE_INVALID_SECTION" = "404" ] || [ "$CODE_INVALID_SECTION" = "400" ]; then
  report "TC18.5" "Invalid section query handles cleanly with 404/400" 0 ""
else
  report "TC18.5" "Invalid section query handles cleanly with 404/400" 1 "Returned HTTP $CODE_INVALID_SECTION"
fi

# --- F19: Admin Blog Posts Management (Authenticated CRUD) ---
echo "--- Testing Feature 19: Admin Blog Posts Management ---"
CODE_ADMIN_BLOG_GET=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/v1/admin/blog/posts")
if [ "$CODE_ADMIN_BLOG_GET" = "200" ]; then
  report "TC19.1" "GET /api/v1/admin/blog/posts authenticated returns HTTP 200" 0 ""
else
  report "TC19.1" "GET /api/v1/admin/blog/posts authenticated returns HTTP 200" 1 "Returned HTTP $CODE_ADMIN_BLOG_GET"
fi

BLOG_SLUG="e2e-post-test-$(date +%s)"
POST_BLOG_RESP=$(curl -s -X POST "$BASE_URL/api/v1/admin/blog/posts" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"E2E Post Title\",\"slug\":\"$BLOG_SLUG\",\"content\":\"<p>Content</p>\",\"status\":\"published\"}")
CREATED_BLOG_ID=$(echo "$POST_BLOG_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('id', ''))" 2>/dev/null)

if [ -n "$CREATED_BLOG_ID" ]; then
  report "TC19.2" "POST /api/v1/admin/blog/posts authenticated returns HTTP 201 Created" 0 ""

  CODE_ADMIN_BLOG_PUT=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/v1/admin/blog/posts/$CREATED_BLOG_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"E2E Post Updated Title\",\"status\":\"published\"}")
  if [ "$CODE_ADMIN_BLOG_PUT" = "200" ]; then
    report "TC19.3" "PUT /api/v1/admin/blog/posts/:id authenticated returns HTTP 200" 0 ""
  else
    report "TC19.3" "PUT /api/v1/admin/blog/posts/:id authenticated returns HTTP 200" 1 "Returned HTTP $CODE_ADMIN_BLOG_PUT"
  fi

  CODE_ADMIN_BLOG_DEL=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/v1/admin/blog/posts/$CREATED_BLOG_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  if [ "$CODE_ADMIN_BLOG_DEL" = "200" ]; then
    report "TC19.4" "DELETE /api/v1/admin/blog/posts/:id authenticated returns HTTP 200" 0 ""
  else
    report "TC19.4" "DELETE /api/v1/admin/blog/posts/:id authenticated returns HTTP 200" 1 "Returned HTTP $CODE_ADMIN_BLOG_DEL"
  fi
else
  report "TC19.2" "POST /api/v1/admin/blog/posts authenticated returns HTTP 201 Created" 1 "Response: $POST_BLOG_RESP"
  report "TC19.3" "PUT /api/v1/admin/blog/posts/:id authenticated returns HTTP 200" 1 "Post creation failed"
  report "TC19.4" "DELETE /api/v1/admin/blog/posts/:id authenticated returns HTTP 200" 1 "Post creation failed"
fi

CODE_ADMIN_BLOG_CORNER=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer invalid" "$BASE_URL/api/v1/admin/blog/posts")
if [ "$CODE_ADMIN_BLOG_CORNER" = "401" ]; then
  report "TC19.5" "Admin blog posts endpoint rejects invalid bearer token" 0 ""
else
  report "TC19.5" "Admin blog posts endpoint rejects invalid bearer token" 1 "Returned HTTP $CODE_ADMIN_BLOG_CORNER"
fi

# --- F20: Admin PSB Applicant Management (Authenticated) ---
echo "--- Testing Feature 20: Admin PSB Applicant Management ---"
PSB_LIST_RESP=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/v1/admin/psb/pendaftar")
CODE_ADMIN_PSB_GET=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/v1/admin/psb/pendaftar")
if [ "$CODE_ADMIN_PSB_GET" = "200" ]; then
  report "TC20.1" "GET /api/v1/admin/psb/pendaftar authenticated returns HTTP 200" 0 ""
else
  report "TC20.1" "GET /api/v1/admin/psb/pendaftar authenticated returns HTTP 200" 1 "Returned HTTP $CODE_ADMIN_PSB_GET"
fi

TARGET_PSB_ID=$(echo "$PSB_LIST_RESP" | python3 -c "import sys, json; data=json.load(sys.stdin).get('data', []); print(data[0]['id'] if data else '1')" 2>/dev/null)
CODE_ADMIN_PSB_DETAIL=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/v1/admin/psb/pendaftar/$TARGET_PSB_ID")
if [ "$CODE_ADMIN_PSB_DETAIL" = "200" ]; then
  report "TC20.2" "GET /api/v1/admin/psb/pendaftar/:id authenticated returns HTTP 200" 0 ""
else
  report "TC20.2" "GET /api/v1/admin/psb/pendaftar/:id authenticated returns HTTP 200" 1 "Returned HTTP $CODE_ADMIN_PSB_DETAIL"
fi

CODE_ADMIN_PSB_UPDATE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/v1/admin/psb/pendaftar/$TARGET_PSB_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"verified\"}")
if [ "$CODE_ADMIN_PSB_UPDATE" = "200" ]; then
  report "TC20.3" "PUT /api/v1/admin/psb/pendaftar/:id authenticated status update returns HTTP 200" 0 ""
else
  report "TC20.3" "PUT /api/v1/admin/psb/pendaftar/:id authenticated status update returns HTTP 200" 1 "Returned HTTP $CODE_ADMIN_PSB_UPDATE"
fi

CODE_ADMIN_PSB_FILTER=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/v1/admin/psb/pendaftar?status=verified")
if [ "$CODE_ADMIN_PSB_FILTER" = "200" ]; then
  report "TC20.4" "Admin PSB filter parameter route returns HTTP 200 with auth" 0 ""
else
  report "TC20.4" "Admin PSB filter parameter route returns HTTP 200 with auth" 1 "Returned HTTP $CODE_ADMIN_PSB_FILTER"
fi

CODE_ADMIN_PSB_UNAUTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/psb/pendaftar")
if [ "$CODE_ADMIN_PSB_UNAUTH" = "401" ]; then
  report "TC20.5" "Admin PSB endpoint unauthenticated rejects with HTTP 401" 0 ""
else
  report "TC20.5" "Admin PSB endpoint unauthenticated rejects with HTTP 401" 1 "Returned HTTP $CODE_ADMIN_PSB_UNAUTH"
fi

echo "=== Tier 1 Complete: Total=$TOTAL_COUNT, Passed=$PASS_COUNT, Failed=$FAIL_COUNT ==="
if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
exit 0
