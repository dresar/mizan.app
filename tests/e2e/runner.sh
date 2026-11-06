#!/usr/bin/env bash
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_URL="${BASE_URL:-http://localhost:3000}"
APP_ROOT="/opt/data/home/mizan.apps"
GOBACKEND_DIR="$APP_ROOT/gobackend"

export BASE_URL
export HUB_DIR="/opt/data/home/mizan.apps/portal"
export GOBACKEND_DIR
export APP_ROOT

TIER="all"
while [[ $# -gt 0 ]]; do
  case $1 in
    --tier)
      TIER="$2"
      shift 2
      ;;
    --base-url)
      BASE_URL="$2"
      export BASE_URL
      shift 2
      ;;
    --all)
      TIER="all"
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: $0 [--tier 1|2|3|4|all|quality] [--base-url http://localhost:3000]"
      exit 1
      ;;
  esac
done

echo "======================================================================"
echo "    E2E Test Runner: Pesantren Hub & Golang Fiber Backend"
echo "    Target URL: $BASE_URL"
echo "    Execution Mode: Tier $TIER"
echo "======================================================================"

check_nokomen() {
  echo "--- Checking Strict NOKOMEN Compliance (Zero Comments in Go/TS) ---"
  local violations=0
  
  # Scan git modified or newly added .go, .ts, .tsx files in repo
  local files
  files=$(git -C "$APP_ROOT" status --porcelain 2>/dev/null | awk '{print $2}' | grep -E '\.(go|ts|tsx)$' || true)
  
  # Also scan gobackend/internal and tests/e2e
  local test_files
  test_files=$(find "$APP_ROOT/tests/e2e" -type f \( -name "*.go" -o -name "*.ts" -o -name "*.tsx" \) 2>/dev/null || true)
  
  local all_files
  all_files=$(echo -e "${files}\n${test_files}" | sort -u | grep -v '^$' || true)
  
  if [ -z "$all_files" ]; then
    echo "  [PASS] No newly added or modified Go/TS/TSX files detected."
    return 0
  fi
  
  for f in $all_files; do
    local full_path="$APP_ROOT/$f"
    [ -f "$f" ] && full_path="$f"
    if [ -f "$full_path" ]; then
      # Check for single line comments // or multi-line comments /*
      if grep -n '^[[:space:]]*//' "$full_path" | grep -v '//go:build' | grep -v '//go:embed' >/dev/null 2>&1; then
        echo "  [FAIL] Comment violation in $full_path:"
        grep -n '^[[:space:]]*//' "$full_path" | grep -v '//go:build' | grep -v '//go:embed' | head -n 3
        violations=$((violations + 1))
      fi
      if grep -n '/\*' "$full_path" >/dev/null 2>&1; then
        echo "  [FAIL] Multi-line comment violation in $full_path:"
        grep -n '/\*' "$full_path" | head -n 3
        violations=$((violations + 1))
      fi
    fi
  done
  
  if [ "$violations" -eq 0 ]; then
    echo "  [PASS] Strict NOKOMEN verified: 0 comments in target files."
    return 0
  else
    echo "  [FAIL] Strict NOKOMEN failed with $violations violations."
    return 1
  fi
}

check_app_isolation() {
  echo "--- Checking Operational App Isolation (Zero Modified Files in app/) ---"
  local app_diff
  app_diff=$(git -C "$APP_ROOT" status --porcelain app/ 2>/dev/null || true)
  if [ -z "$app_diff" ]; then
    echo "  [PASS] Operational isolation verified: zero modifications in app/"
    return 0
  else
    echo "  [FAIL] Detected modifications in operational directory app/:"
    echo "$app_diff"
    return 1
  fi
}

EXIT_CODE=0

run_quality() {
  echo ""
  echo "=== Running Code Quality & Safety Validations ==="
  check_nokomen || EXIT_CODE=1
  check_app_isolation || EXIT_CODE=1
}

run_tier1() {
  echo ""
  bash "$DIR/test_tier1_feature.sh" || EXIT_CODE=1
}

run_tier2() {
  echo ""
  bash "$DIR/test_tier2_boundary.sh" || EXIT_CODE=1
}

run_tier3() {
  echo ""
  bash "$DIR/test_tier3_pairwise.sh" || EXIT_CODE=1
}

run_tier4() {
  echo ""
  bash "$DIR/test_tier4_scenarios.sh" || EXIT_CODE=1
}

run_tier5() {
  echo ""
  bash "$DIR/test_tier5_adversarial.sh" || EXIT_CODE=1
}

case $TIER in
  1)
    run_tier1
    ;;
  2)
    run_tier2
    ;;
  3)
    run_tier3
    ;;
  4)
    run_tier4
    ;;
  5)
    run_tier5
    ;;
  quality)
    run_quality
    ;;
  all)
    run_quality
    run_tier1
    run_tier2
    run_tier3
    run_tier4
    run_tier5
    ;;
esac

echo ""
echo "======================================================================"
if [ "$EXIT_CODE" -eq 0 ]; then
  echo "    RESULT: ALL TEST SUITES PASSED (Exit Code: 0)"
else
  echo "    RESULT: TEST FAILURES DETECTED (Exit Code: $EXIT_CODE)"
fi
echo "======================================================================"
exit $EXIT_CODE
