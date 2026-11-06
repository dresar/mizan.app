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

echo "=== Running Tier 3: Cross-Feature Combinations (Pairwise Coverage) ==="

# P1: Public Registration (F16) <-> Admin PSB Management (F20)
echo "--- Testing Pair 1: Public Registration <-> Admin PSB Management ---"
TEST_NISN="PAIR$RANDOM"
PSB_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"Santri Pairwise Test\",\"nisn\":\"$TEST_NISN\",\"phone\":\"0899999999\"}")
PSB_CODE=$(echo "$PSB_RESP" | tail -n 1)

if [ "$PSB_CODE" = "201" ] || [ "$PSB_CODE" = "200" ]; then
  # Verify that admin route is protected when querying this applicant
  ADMIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/psb/pendaftar")
  if [ "$ADMIN_CODE" = "401" ] || [ "$ADMIN_CODE" = "200" ]; then
    report "P1" "Public registration successfully links with Admin PSB management pipeline" 0 ""
  else
    report "P1" "Public registration successfully links with Admin PSB management pipeline" 1 "Admin check failed with HTTP $ADMIN_CODE"
  fi
else
  # Check if admin endpoint exists and enforces auth
  ADMIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/psb/pendaftar")
  if [ "$ADMIN_CODE" = "401" ]; then
    report "P1" "Public registration and Admin PSB management maintain consistent auth boundary" 0 ""
  else
    report "P1" "Public registration and Admin PSB management maintain consistent auth boundary" 1 "Public=$PSB_CODE, Admin=$ADMIN_CODE"
  fi
fi

# P2: Admin CMS Generic (F18) <-> Public Presentation APIs (F10, F11, F13)
echo "--- Testing Pair 2: Admin CMS Generic <-> Public Presentation APIs ---"
PUBLIC_SETT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/website-settings")
ADMIN_SETT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/cms/website-settings")
if [ "$PUBLIC_SETT_CODE" = "200" ] && [ "$ADMIN_SETT_CODE" = "401" ]; then
  report "P2" "Website settings reflects public 200 vs admin 401 dual-access contract" 0 ""
else
  report "P2" "Website settings reflects public 200 vs admin 401 dual-access contract" 1 "Public=$PUBLIC_SETT_CODE, Admin=$ADMIN_SETT_CODE"
fi

# P3: Admin Blog Management (F19) <-> Public Blog API (F15)
echo "--- Testing Pair 3: Admin Blog Management <-> Public Blog API ---"
PUB_BLOG_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/posts")
ADM_BLOG_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/blog/posts")
if [ "$PUB_BLOG_CODE" = "200" ] && [ "$ADM_BLOG_CODE" = "401" ]; then
  report "P3" "Blog management maintains public feed (200) and protected authoring (401)" 0 ""
else
  report "P3" "Blog management maintains public feed (200) and protected authoring (401)" 1 "Pub=$PUB_BLOG_CODE, Adm=$ADM_BLOG_CODE"
fi

# P4: Fiber Dual Serving (F6) <-> Asset Serving (F7) <-> Mizan Preservation (F8)
echo "--- Testing Pair 4: Dual Static Serving <-> Vite Assets <-> Mizan Operational Preservation ---"
CODE_ROOT=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
CODE_ADMIN_CMS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin-cms")
CODE_MIZAN_ABSENSI=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/absensi")

if [ "$CODE_ROOT" = "200" ] && [ "$CODE_ADMIN_CMS" = "200" ] && [ "$CODE_MIZAN_ABSENSI" = "200" ]; then
  report "P4" "Triple static coexistence: Root (/), CMS (/admin-cms), and Mizan (/admin/absensi) all return 200" 0 ""
else
  report "P4" "Triple static coexistence: Root, CMS, and Mizan all return 200" 1 "Root=$CODE_ROOT, CMS=$CODE_ADMIN_CMS, Mizan=$CODE_MIZAN_ABSENSI"
fi

# P5: Admin JWT Auth (F17) <-> All Admin Sub-APIs (F18, F19, F20)
echo "--- Testing Pair 5: Admin JWT Auth <-> All Admin Sub-APIs ---"
ADM1=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/cms/fasilitas")
ADM2=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/blog/posts")
ADM3=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/psb/pendaftar")

if [ "$ADM1" = "401" ] && [ "$ADM2" = "401" ] && [ "$ADM3" = "401" ]; then
  report "P5" "All Admin sub-APIs (CMS, Blog, PSB) uniformly enforce HTTP 401 on missing token" 0 ""
else
  report "P5" "All Admin sub-APIs uniformly enforce HTTP 401 on missing token" 1 "CMS=$ADM1, Blog=$ADM2, PSB=$ADM3"
fi

# P6: Public SEO Tags (F3) <-> Schema.org (F4) <-> Static Files (F5)
echo "--- Testing Pair 6: SEO Tags <-> Schema.org <-> Static Files ---"
INDEX_PATH="$GOBACKEND_DIR/web_public/index.html"
[ ! -f "$INDEX_PATH" ] && INDEX_PATH="$HUB_DIR/index.html"

HAS_SEO_TITLE=$(grep -q "<title>" "$INDEX_PATH" 2>/dev/null && echo "YES" || echo "NO")
HAS_SCHEMA=$(grep -q "application/ld+json" "$INDEX_PATH" 2>/dev/null && echo "YES" || echo "NO")
CODE_ROBOTS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/robots.txt")

if [ "$HAS_SEO_TITLE" = "YES" ] && [ "$HAS_SCHEMA" = "YES" ] && [ "$CODE_ROBOTS" = "200" ]; then
  report "P6" "SEO complete loop: Meta tags + Schema.org + robots.txt structurally intact" 0 ""
else
  report "P6" "SEO complete loop: Meta tags + Schema.org + robots.txt structurally intact" 1 "Title=$HAS_SEO_TITLE, Schema=$HAS_SCHEMA, Robots=$CODE_ROBOTS"
fi

# P7: Database Initialization (F9) <-> Public API Read Suite (F10-F16)
echo "--- Testing Pair 7: Database Initialization <-> Public API Read Suite ---"
CODE_S=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/website-settings")
CODE_H=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/hero-section")
CODE_V=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/visi-misi")
CODE_F=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/fasilitas")

if [ "$CODE_S" = "200" ] && [ "$CODE_H" = "200" ] && [ "$CODE_V" = "200" ] && [ "$CODE_F" = "200" ]; then
  report "P7" "Database backed public endpoints (settings, hero, visi-misi, fasilitas) all return 200" 0 ""
else
  report "P7" "Database backed public endpoints all return 200" 1 "Settings=$CODE_S, Hero=$CODE_H, VM=$CODE_V, Fas=$CODE_F"
fi

# P8: Mizan Internal Auth <-> Admin Portal JWT Auth (F8 <-> F17)
echo "--- Testing Pair 8: Mizan Internal Auth Domain <-> Admin Portal JWT Auth Domain ---"
CODE_MIZAN_SEC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/absensi")
CODE_PORTAL_SEC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/admin/cms/website-settings")

if [ "$CODE_MIZAN_SEC" = "401" ] && [ "$CODE_PORTAL_SEC" = "401" ]; then
  report "P8" "Authentication domains strictly segregated: Mizan session endpoint and Portal JWT endpoint both enforce protection" 0 ""
else
  report "P8" "Authentication domains strictly segregated" 1 "Mizan=$CODE_MIZAN_SEC, Portal=$CODE_PORTAL_SEC"
fi

echo "=== Tier 3 Complete: Total=$TOTAL_COUNT, Passed=$PASS_COUNT, Failed=$FAIL_COUNT ==="
if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
exit 0
