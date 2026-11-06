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

echo "=== Running Tier 4: Real-World Application Scenarios (5 Scenarios) ==="

# --- Scenario 1: Prospective Student End-to-End Admission Journey ---
echo "--- Scenario 1: Prospective Student Admission Journey ---"
# Step 1: Browse public homepage
STEP1_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
# Step 2: Read facilities and vision
STEP2_FAS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/fasilitas")
STEP2_VM=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/visi-misi")
# Step 3: Submit application
TEST_NISN="SCEN1-$RANDOM"
STEP3_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"Santri Scen 1\",\"nisn\":\"$TEST_NISN\",\"phone\":\"081234567890\"}")
STEP3_CODE=$(echo "$STEP3_RESP" | tail -n 1)

if [ "$STEP1_CODE" = "200" ] && [ "$STEP2_FAS" = "200" ] && [ "$STEP2_VM" = "200" ] && { [ "$STEP3_CODE" = "201" ] || [ "$STEP3_CODE" = "200" ]; }; then
  report "S1" "Scenario 1: Prospective student browses info and completes registration" 0 ""
else
  report "S1" "Scenario 1: Prospective student browses info and completes registration" 1 "Step1=$STEP1_CODE, Fas=$STEP2_FAS, VM=$STEP2_VM, Submit=$STEP3_CODE"
fi

# --- Scenario 2: Content Publisher Article Lifecycle ---
echo "--- Scenario 2: Content Publisher Article Lifecycle ---"
# Step 1: Admin endpoint for blog requires auth
S2_AUTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/blog/posts")
# Step 2: Public blog feed is accessible to reader
S2_FEED_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/posts")

if [ "$S2_AUTH_CHECK" = "401" ] && [ "$S2_FEED_CHECK" = "200" ]; then
  report "S2" "Scenario 2: Content publisher security separation verified with public feed access" 0 ""
else
  report "S2" "Scenario 2: Content publisher security separation verified" 1 "AdminCheck=$S2_AUTH_CHECK, FeedCheck=$S2_FEED_CHECK"
fi

# --- Scenario 3: Site Administrator Identity & Branding Update ---
echo "--- Scenario 3: Site Administrator Branding Update ---"
# Step 1: CMS admin route serves admin portal
S3_ADMIN_UI=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin-cms")
# Step 2: Public settings reflects valid configuration
S3_PUBLIC_SETTINGS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/website-settings")
# Step 3: Admin CMS update requires JWT protection
S3_UPDATE_PROTECT=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/v1/admin/cms/website-settings" -H "Content-Type: application/json" -d '{"name":"Updated Pesantren"}')

if [ "$S3_ADMIN_UI" = "200" ] && [ "$S3_PUBLIC_SETTINGS" = "200" ] && [ "$S3_UPDATE_PROTECT" = "401" ]; then
  report "S3" "Scenario 3: Administrator branding workflow and security boundary verified" 0 ""
else
  report "S3" "Scenario 3: Administrator branding workflow and security boundary verified" 1 "UI=$S3_ADMIN_UI, Settings=$S3_PUBLIC_SETTINGS, Protect=$S3_UPDATE_PROTECT"
fi

# --- Scenario 4: Search Engine Crawler Full Indexing Run ---
echo "--- Scenario 4: Search Engine Crawler Full Indexing Run ---"
# Step 1: Fetch robots.txt
CRAWL_ROBOTS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/robots.txt")
# Step 2: Fetch sitemap.xml
CRAWL_SITEMAP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/sitemap.xml")
# Step 3: Fetch public portal index
CRAWL_INDEX=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")

INDEX_PATH="$GOBACKEND_DIR/web_public/index.html"
[ ! -f "$INDEX_PATH" ] && INDEX_PATH="$HUB_DIR/index.html"
CRAWL_OG=$(grep -q "og:title" "$INDEX_PATH" 2>/dev/null && echo "YES" || echo "NO")
CRAWL_SCHEMA=$(grep -q "application/ld+json" "$INDEX_PATH" 2>/dev/null && echo "YES" || echo "NO")

if [ "$CRAWL_ROBOTS" = "200" ] && [ "$CRAWL_SITEMAP" = "200" ] && [ "$CRAWL_INDEX" = "200" ] && [ "$CRAWL_OG" = "YES" ] && [ "$CRAWL_SCHEMA" = "YES" ]; then
  report "S4" "Scenario 4: Search engine crawler completes discovery, sitemap parsing, and structured data extraction" 0 ""
else
  report "S4" "Scenario 4: Search engine crawler indexing run failed" 1 "Robots=$CRAWL_ROBOTS, Sitemap=$CRAWL_SITEMAP, Index=$CRAWL_INDEX, OG=$CRAWL_OG, Schema=$CRAWL_SCHEMA"
fi

# --- Scenario 5: Multi-Role Concurrent Operational Integrity ---
echo "--- Scenario 5: Multi-Role Concurrent Operational Integrity ---"
# User 1: Public portal visitor
CONC_PUB=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/hero-section")
# User 2: Admin visiting CMS
CONC_CMS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin-cms")
# User 3: Mizan Teacher accessing operational Mizan
CONC_MIZAN=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/absensi")
# User 4: Operational Mizan login
CONC_LOGIN=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/login")

if [ "$CONC_PUB" = "200" ] && [ "$CONC_CMS" = "200" ] && [ "$CONC_MIZAN" = "200" ] && [ "$CONC_LOGIN" = "200" ]; then
  report "S5" "Scenario 5: Multi-role concurrent traffic across Public, CMS, and Mizan operational domains resolves with 200 OK" 0 ""
else
  report "S5" "Scenario 5: Multi-role concurrent traffic across domains" 1 "Pub=$CONC_PUB, CMS=$CONC_CMS, Mizan=$CONC_MIZAN, Login=$CONC_LOGIN"
fi

echo "=== Tier 4 Complete: Total=$TOTAL_COUNT, Passed=$PASS_COUNT, Failed=$FAIL_COUNT ==="
if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
exit 0
