#!/usr/bin/env bash
set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
APP_ROOT="/opt/data/home/mizan.apps"

PASS_COUNT=0
FAIL_COUNT=0
TOTAL_COUNT=0
BUG_COUNT=0

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
    BUG_COUNT=$((BUG_COUNT + 1))
    printf "  [FAIL] %-10s %s (Reason: %s)\n" "$id" "$name" "$details"
  fi
}

echo "======================================================================"
echo "    Tier 5: White-Box Adversarial Coverage Hardening Suite"
echo "    Target: $BASE_URL"
echo "======================================================================"

LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}')
ADMIN_TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "CRITICAL: Unable to obtain admin JWT token for authenticated testing."
  exit 1
fi

echo "--- 1. SQLSTATE 23502 (NOT NULL Violation) & Empty Payload Fuzzing ---"

RESP_EMPTY_CMS=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/v1/admin/cms/faq" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
CODE_EMPTY_CMS=$(echo "$RESP_EMPTY_CMS" | grep "HTTP_CODE:" | cut -d: -f2)
BODY_EMPTY_CMS=$(echo "$RESP_EMPTY_CMS" | grep -v "HTTP_CODE:")

if [ "$CODE_EMPTY_CMS" = "400" ]; then
  report "ADV1.1" "POST /api/v1/admin/cms/faq with empty object returns 400 Bad Request" 0 ""
else
  report "ADV1.1" "POST /api/v1/admin/cms/faq with empty object returns 400 Bad Request" 1 "Returned HTTP $CODE_EMPTY_CMS instead of 400 ($BODY_EMPTY_CMS)"
fi

RESP_EMPTY_FASILITAS=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/v1/admin/cms/fasilitas" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
CODE_EMPTY_FASILITAS=$(echo "$RESP_EMPTY_FASILITAS" | grep "HTTP_CODE:" | cut -d: -f2)
BODY_EMPTY_FASILITAS=$(echo "$RESP_EMPTY_FASILITAS" | grep -v "HTTP_CODE:")

if [ "$CODE_EMPTY_FASILITAS" = "400" ]; then
  report "ADV1.2" "POST /api/v1/admin/cms/fasilitas with empty object returns 400 Bad Request" 0 ""
else
  report "ADV1.2" "POST /api/v1/admin/cms/fasilitas with empty object returns 400 Bad Request" 1 "Returned HTTP $CODE_EMPTY_FASILITAS instead of 400 ($BODY_EMPTY_FASILITAS)"
fi

RESP_NULL_CMS=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PUT "$BASE_URL/api/v1/admin/cms/faq/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pertanyaan": null}')
CODE_NULL_CMS=$(echo "$RESP_NULL_CMS" | grep "HTTP_CODE:" | cut -d: -f2)
BODY_NULL_CMS=$(echo "$RESP_NULL_CMS" | grep -v "HTTP_CODE:")

if [ "$CODE_NULL_CMS" = "400" ]; then
  report "ADV1.3" "PUT /api/v1/admin/cms/faq/1 with null required field returns 400 Bad Request" 0 ""
else
  report "ADV1.3" "PUT /api/v1/admin/cms/faq/1 with null required field returns 400 Bad Request" 1 "Returned HTTP $CODE_NULL_CMS instead of 400 ($BODY_NULL_CMS)"
fi

RESP_NULL_PSB=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PUT "$BASE_URL/api/v1/admin/psb/pendaftar/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nama_lengkap": null}')
CODE_NULL_PSB=$(echo "$RESP_NULL_PSB" | grep "HTTP_CODE:" | cut -d: -f2)
BODY_NULL_PSB=$(echo "$RESP_NULL_PSB" | grep -v "HTTP_CODE:")

if [ "$CODE_NULL_PSB" = "400" ]; then
  report "ADV1.4" "PUT /api/v1/admin/psb/pendaftar/1 with null required field returns 400 Bad Request" 0 ""
else
  report "ADV1.4" "PUT /api/v1/admin/psb/pendaftar/1 with null required field returns 400 Bad Request" 1 "Returned HTTP $CODE_NULL_PSB instead of 400 ($BODY_NULL_PSB)"
fi

RESP_NULL_BLOG=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PUT "$BASE_URL/api/v1/admin/blog/posts/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": null}')
CODE_NULL_BLOG=$(echo "$RESP_NULL_BLOG" | grep "HTTP_CODE:" | cut -d: -f2)
BODY_NULL_BLOG=$(echo "$RESP_NULL_BLOG" | grep -v "HTTP_CODE:")

if [ "$CODE_NULL_BLOG" = "400" ]; then
  report "ADV1.5" "PUT /api/v1/admin/blog/posts/1 with null title returns 400 Bad Request" 0 ""
else
  report "ADV1.5" "PUT /api/v1/admin/blog/posts/1 with null title returns 400 Bad Request" 1 "Returned HTTP $CODE_NULL_BLOG instead of 400 ($BODY_NULL_BLOG)"
fi

echo "--- 2. Unhandled SQLSTATE 42703 (Undefined Column) in Blog Update ---"

RESP_BAD_COL_BLOG=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PUT "$BASE_URL/api/v1/admin/blog/posts/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"non_existent_column_xyz": "attack_payload"}')
CODE_BAD_COL_BLOG=$(echo "$RESP_BAD_COL_BLOG" | grep "HTTP_CODE:" | cut -d: -f2)
BODY_BAD_COL_BLOG=$(echo "$RESP_BAD_COL_BLOG" | grep -v "HTTP_CODE:")

if [ "$CODE_BAD_COL_BLOG" = "400" ]; then
  report "ADV2.1" "PUT /api/v1/admin/blog/posts/1 with invalid column returns 400 Bad Request" 0 ""
else
  report "ADV2.1" "PUT /api/v1/admin/blog/posts/1 with invalid column returns 400 Bad Request" 1 "Returned HTTP $CODE_BAD_COL_BLOG instead of 400 ($BODY_BAD_COL_BLOG)"
fi

echo "--- 3. Malformed, Expired & Tampered JWT Token Hardening ---"

python3 -c '
import hmac, hashlib, base64, json, time
secret = "your-super-secret-jwt-key-change-this"
def b64url(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")
header = {"alg": "HS256", "typ": "JWT"}
h_b64 = b64url(json.dumps(header).encode())
claims = {"id": 1, "username": "admin", "email": "admin@pesantren.com", "role": "superadmin", "isSuperuser": True, "exp": int(time.time()) + 3600}
p_b64 = b64url(json.dumps(claims).encode())
sig = hmac.new(secret.encode(), f"{h_b64}.{p_b64}".encode(), hashlib.sha256).digest()

exp_claims = dict(claims)
exp_claims["exp"] = int(time.time()) - 3600
exp_p_b64 = b64url(json.dumps(exp_claims).encode())
exp_sig = hmac.new(secret.encode(), f"{h_b64}.{exp_p_b64}".encode(), hashlib.sha256).digest()

tampered_claims = dict(claims)
tampered_claims["id"] = 999
tampered_p_b64 = b64url(json.dumps(tampered_claims).encode())

none_h = b64url(json.dumps({"alg": "none", "typ": "JWT"}).encode())

print(f"EXPIRED={h_b64}.{exp_p_b64}.{b64url(exp_sig)}")
print(f"BAD_SIG={h_b64}.{p_b64}.tamperedsig1234567890")
print(f"TAMPERED={h_b64}.{tampered_p_b64}.{b64url(sig)}")
print(f"ALG_NONE={none_h}.{p_b64}.")
' > /tmp/adv_jwt.env
source /tmp/adv_jwt.env
rm -f /tmp/adv_jwt.env

CODE_EXPIRED=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $EXPIRED" "$BASE_URL/api/v1/admin/cms/faq")
if [ "$CODE_EXPIRED" = "401" ]; then
  report "ADV3.1" "Expired JWT token rejected with HTTP 401" 0 ""
else
  report "ADV3.1" "Expired JWT token rejected with HTTP 401" 1 "Returned HTTP $CODE_EXPIRED"
fi

CODE_BAD_SIG=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $BAD_SIG" "$BASE_URL/api/v1/admin/cms/faq")
if [ "$CODE_BAD_SIG" = "401" ]; then
  report "ADV3.2" "Tampered JWT signature rejected with HTTP 401" 0 ""
else
  report "ADV3.2" "Tampered JWT signature rejected with HTTP 401" 1 "Returned HTTP $CODE_BAD_SIG"
fi

CODE_TAMPERED=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TAMPERED" "$BASE_URL/api/v1/admin/cms/faq")
if [ "$CODE_TAMPERED" = "401" ]; then
  report "ADV3.3" "Tampered JWT payload rejected with HTTP 401" 0 ""
else
  report "ADV3.3" "Tampered JWT payload rejected with HTTP 401" 1 "Returned HTTP $CODE_TAMPERED"
fi

CODE_ALG_NONE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ALG_NONE" "$BASE_URL/api/v1/admin/cms/faq")
if [ "$CODE_ALG_NONE" = "401" ]; then
  report "ADV3.4" "Algorithm none attack rejected with HTTP 401" 0 ""
else
  report "ADV3.4" "Algorithm none attack rejected with HTTP 401" 1 "Returned HTTP $CODE_ALG_NONE"
fi

CODE_MALFORMED=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer only-two.parts" "$BASE_URL/api/v1/admin/cms/faq")
if [ "$CODE_MALFORMED" = "401" ]; then
  report "ADV3.5" "Malformed two-segment token rejected with HTTP 401" 0 ""
else
  report "ADV3.5" "Malformed two-segment token rejected with HTTP 401" 1 "Returned HTTP $CODE_MALFORMED"
fi

CODE_FOUR_PARTS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer a.b.c.d" "$BASE_URL/api/v1/admin/cms/faq")
if [ "$CODE_FOUR_PARTS" = "401" ]; then
  report "ADV3.6" "Malformed four-segment token rejected with HTTP 401" 0 ""
else
  report "ADV3.6" "Malformed four-segment token rejected with HTTP 401" 1 "Returned HTTP $CODE_FOUR_PARTS"
fi

MASSIVE_TOKEN=$(python3 -c 'print("A" * 50000)')
CODE_MASSIVE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $MASSIVE_TOKEN" "$BASE_URL/api/v1/admin/cms/faq")
if [ "$CODE_MASSIVE" = "401" ] || [ "$CODE_MASSIVE" = "431" ]; then
  report "ADV3.7" "Massive 50KB token rejected safely without crash" 0 ""
else
  report "ADV3.7" "Massive 50KB token rejected safely without crash" 1 "Returned HTTP $CODE_MASSIVE"
fi

echo "--- 4. Public PSB Registration Adversarial Inputs & Fuzzing ---"

CODE_PSB_EMPTY=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" \
  -H "Content-Type: application/json" \
  -d '{}')
if [ "$CODE_PSB_EMPTY" = "400" ]; then
  report "ADV4.1" "PSB registration with empty payload returns HTTP 400" 0 ""
else
  report "ADV4.1" "PSB registration with empty payload returns HTTP 400" 1 "Returned HTTP $CODE_PSB_EMPTY"
fi

CODE_PSB_SPACES=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"   ","nisn":"   "}')
if [ "$CODE_PSB_SPACES" = "400" ]; then
  report "ADV4.2" "PSB registration with whitespace-only returns HTTP 400" 0 ""
else
  report "ADV4.2" "PSB registration with whitespace-only returns HTTP 400" 1 "Returned HTTP $CODE_PSB_SPACES"
fi

LONG_NAME=$(python3 -c 'print("A" * 201)')
CODE_PSB_LONG_NAME=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"$LONG_NAME\",\"nisn\":\"1234567890\"}")
if [ "$CODE_PSB_LONG_NAME" = "400" ]; then
  report "ADV4.3" "PSB registration with name >200 chars returns HTTP 400" 0 ""
else
  report "ADV4.3" "PSB registration with name >200 chars returns HTTP 400" 1 "Returned HTTP $CODE_PSB_LONG_NAME"
fi

LONG_NISN=$(python3 -c 'print("1" * 21)')
CODE_PSB_LONG_NISN=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"Santri Valid\",\"nisn\":\"$LONG_NISN\"}")
if [ "$CODE_PSB_LONG_NISN" = "400" ]; then
  report "ADV4.4" "PSB registration with NISN >20 chars returns HTTP 400" 0 ""
else
  report "ADV4.4" "PSB registration with NISN >20 chars returns HTTP 400" 1 "Returned HTTP $CODE_PSB_LONG_NISN"
fi

LONG_PHONE=$(python3 -c 'print("0" * 21)')
CODE_PSB_LONG_PHONE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/public/psb/daftar" \
  -H "Content-Type: application/json" \
  -d "{\"full_name\":\"Santri Valid\",\"nisn\":\"1234567890\",\"phone\":\"$LONG_PHONE\"}")
if [ "$CODE_PSB_LONG_PHONE" = "400" ]; then
  report "ADV4.5" "PSB registration with phone >20 chars returns HTTP 400" 0 ""
else
  report "ADV4.5" "PSB registration with phone >20 chars returns HTTP 400" 1 "Returned HTTP $CODE_PSB_LONG_PHONE"
fi

echo "--- Concurrency: Simultaneous identical NISN registrations ---"
CONC_NISN="NISN_ADV_$(date +%s)"
for i in {1..10}; do
  curl -s -o /tmp/adv_conc_resp_$i.json -w "%{http_code}\n" -X POST "$BASE_URL/api/v1/public/psb/daftar" \
    -H "Content-Type: application/json" \
    -d "{\"full_name\":\"Santri Conc $i\",\"nisn\":\"$CONC_NISN\",\"gender\":\"L\",\"phone\":\"08123456789\"}" > /tmp/adv_conc_code_$i.txt &
done
wait

SUCCESS_COUNT=0
REJECT_COUNT=0
for i in {1..10}; do
  C=$(cat /tmp/adv_conc_code_$i.txt | tr -d '[:space:]')
  if [ "$C" = "201" ]; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  elif [ "$C" = "400" ]; then
    REJECT_COUNT=$((REJECT_COUNT + 1))
  fi
done
rm -f /tmp/adv_conc_resp_* /tmp/adv_conc_code_*

if [ "$SUCCESS_COUNT" -eq 1 ] && [ "$REJECT_COUNT" -eq 9 ]; then
  report "ADV4.6" "Concurrent race condition: exactly 1 created (201) and 9 rejected (400)" 0 ""
else
  report "ADV4.6" "Concurrent race condition: exactly 1 created and 9 rejected" 1 "Success=$SUCCESS_COUNT, Rejections=$REJECT_COUNT"
fi

echo "--- 5. Public Contact Form Adversarial Inputs & Fuzzing ---"

CODE_CONTACT_EMPTY=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/core/contact" \
  -H "Content-Type: application/json" \
  -d '{}')
if [ "$CODE_CONTACT_EMPTY" = "400" ]; then
  report "ADV5.1" "Contact form with empty payload returns HTTP 400" 0 ""
else
  report "ADV5.1" "Contact form with empty payload returns HTTP 400" 1 "Returned HTTP $CODE_CONTACT_EMPTY"
fi

CODE_CONTACT_NOPESAN=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/core/contact" \
  -H "Content-Type: application/json" \
  -d '{"nama":"Ahmad","email":"ahmad@example.com"}')
if [ "$CODE_CONTACT_NOPESAN" = "400" ]; then
  report "ADV5.2" "Contact form with missing pesan returns HTTP 400" 0 ""
else
  report "ADV5.2" "Contact form with missing pesan returns HTTP 400" 1 "Returned HTTP $CODE_CONTACT_NOPESAN"
fi

LONG_PESAN=$(python3 -c 'print("A" * 5001)')
CODE_CONTACT_LONG=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/core/contact" \
  -H "Content-Type: application/json" \
  -d "{\"nama\":\"Ahmad\",\"email\":\"ahmad@example.com\",\"pesan\":\"$LONG_PESAN\"}")
if [ "$CODE_CONTACT_LONG" = "400" ]; then
  report "ADV5.3" "Contact form with message >5000 chars returns HTTP 400" 0 ""
else
  report "ADV5.3" "Contact form with message >5000 chars returns HTTP 400" 1 "Returned HTTP $CODE_CONTACT_LONG"
fi

echo "--- 6. SQL Injection & Special Character Payloads ---"

CODE_SQLI_SLUG=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/public/posts/%27%20OR%201=1%20--")
if [ "$CODE_SQLI_SLUG" = "404" ]; then
  report "ADV6.1" "SQL injection in blog post slug safely returns HTTP 404" 0 ""
else
  report "ADV6.1" "SQL injection in blog post slug safely returns HTTP 404" 1 "Returned HTTP $CODE_SQLI_SLUG"
fi

CODE_SQLI_CMS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/v1/admin/cms/faq%27;SELECT%20pg_sleep(5);--")
if [ "$CODE_SQLI_CMS" = "404" ]; then
  report "ADV6.2" "SQL injection in CMS section parameter safely returns HTTP 404" 0 ""
else
  report "ADV6.2" "SQL injection in CMS section parameter safely returns HTTP 404" 1 "Returned HTTP $CODE_SQLI_CMS"
fi

CODE_SQLI_SEARCH=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE_URL/api/v1/admin/psb/pendaftar?search=%27%20OR%201=1%20--")
if [ "$CODE_SQLI_SEARCH" = "200" ]; then
  report "ADV6.3" "SQL injection in PSB search query safely returns HTTP 200 with empty/filtered data" 0 ""
else
  report "ADV6.3" "SQL injection in PSB search query safely returns HTTP 200" 1 "Returned HTTP $CODE_SQLI_SEARCH"
fi

CODE_SQLI_LOGIN=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"password"}')
if [ "$CODE_SQLI_LOGIN" = "401" ]; then
  report "ADV6.4" "SQL injection in admin login username safely rejected with HTTP 401" 0 ""
else
  report "ADV6.4" "SQL injection in admin login username safely rejected" 1 "Returned HTTP $CODE_SQLI_LOGIN"
fi

echo "--- 7. Directory Traversal & Static Route Hardening ---"

CODE_TRAV_ROOT=$(curl -s --path-as-is -o /dev/null -w "%{http_code}" "$BASE_URL/../../etc/passwd")
if [ "$CODE_TRAV_ROOT" = "403" ] || [ "$CODE_TRAV_ROOT" = "400" ]; then
  report "ADV7.1" "Path traversal at root /../../etc/passwd blocked with HTTP 403/400" 0 ""
else
  report "ADV7.1" "Path traversal at root blocked" 1 "Returned HTTP $CODE_TRAV_ROOT"
fi

CODE_TRAV_ADMIN=$(curl -s --path-as-is -o /dev/null -w "%{http_code}" "$BASE_URL/admin/../../../../etc/passwd")
if [ "$CODE_TRAV_ADMIN" = "403" ] || [ "$CODE_TRAV_ADMIN" = "400" ]; then
  report "ADV7.2" "Path traversal with /admin prefix blocked with HTTP 403/400" 0 ""
else
  report "ADV7.2" "Path traversal with /admin prefix blocked" 1 "Returned HTTP $CODE_TRAV_ADMIN"
fi

CODE_TRAV_ASSETS=$(curl -s --path-as-is -o /dev/null -w "%{http_code}" "$BASE_URL/assets/../../../../etc/passwd")
if [ "$CODE_TRAV_ASSETS" = "403" ] || [ "$CODE_TRAV_ASSETS" = "400" ]; then
  report "ADV7.3" "Path traversal in /assets/ blocked with HTTP 403/400" 0 ""
else
  report "ADV7.3" "Path traversal in /assets/ blocked" 1 "Returned HTTP $CODE_TRAV_ASSETS"
fi

CODE_DEEP_SPA=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin-cms/very/deep/nested/view")
if [ "$CODE_DEEP_SPA" = "200" ]; then
  report "ADV7.4" "Deeply nested admin-cms SPA route returns HTTP 200 (SPA fallback)" 0 ""
else
  report "ADV7.4" "Deeply nested admin-cms SPA route returns HTTP 200" 1 "Returned HTTP $CODE_DEEP_SPA"
fi

echo "--- 8. Concurrency & High Load Stability ---"

for i in {1..10}; do
  curl -s -o /tmp/adv_cms_upd_$i.json -w "%{http_code}\n" -X PUT "$BASE_URL/api/v1/admin/cms/faq/1" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"pertanyaan\":\"Pertanyaan Conc $i\"}" > /tmp/adv_cms_code_$i.txt &
done
wait

ALL_200=true
for i in {1..10}; do
  C=$(cat /tmp/adv_cms_code_$i.txt | tr -d '[:space:]')
  if [ "$C" != "200" ]; then
    ALL_200=false
  fi
done
rm -f /tmp/adv_cms_upd_* /tmp/adv_cms_code_*

if [ "$ALL_200" = "true" ]; then
  report "ADV8.1" "10 concurrent CMS updates on same record all succeed with HTTP 200" 0 ""
else
  report "ADV8.1" "10 concurrent CMS updates on same record all succeed" 1 "Some updates failed"
fi

echo ""
echo "======================================================================"
echo "    Tier 5 Summary: Total=$TOTAL_COUNT, Passed=$PASS_COUNT, Bugs/Gaps Found=$BUG_COUNT"
echo "======================================================================"

if [ "$BUG_COUNT" -gt 0 ]; then
  echo "    ADVERSARIAL HARDENING FINDINGS IDENTIFIED: $BUG_COUNT bugs detected."
  exit 1
fi

echo "    ALL TIER 5 ADVERSARIAL TESTS PASSED (0 BUGS)"
exit 0
