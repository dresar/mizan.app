#!/usr/bin/env python3
import asyncio
import httpx
import json
import time
import random
import string

BASE_URL = "http://127.0.0.1:3000"

results = []

def record(test_id, category, desc, passed, expected, actual, detail=""):
    results.append({
        "id": test_id,
        "category": category,
        "desc": desc,
        "passed": passed,
        "expected": expected,
        "actual": actual,
        "detail": detail
    })
    status = "[PASS]" if passed else "[FAIL]"
    print(f"  {status} {test_id:<16} | {category:<18} | {desc}")
    if not passed:
        print(f"         Expected: {expected} | Actual: {actual} | Detail: {detail}")

def check_no_leakage(text):
    sensitive_markers = [
        "SQLSTATE",
        "pq: ",
        "syntax error at or near",
        "runtime error:",
        "goroutine ",
        "/opt/data/home/mizan.apps/gobackend"
    ]
    for marker in sensitive_markers:
        if marker in text:
            return False, f"Sensitive leak detected: '{marker}' in response: {text[:120]}"
    return True, ""

async def run_suite():
    print("=" * 80)
    print("  CHALLENGER 2: ADVERSARIAL STRESS & EDGE-CASE HARNESS")
    print("=" * 80)

    limits = httpx.Limits(max_keepalive_connections=50, max_connections=100)
    client = httpx.AsyncClient(base_url=BASE_URL, timeout=15.0, limits=limits)

    # 0. SETUP: AUTH
    print("\n--- Setup: Admin Authentication ---")
    login_resp = await client.post("/api/v1/auth/login", json={"username": "admin", "password": "password123"})
    if login_resp.status_code == 200 and "token" in login_resp.json():
        admin_token = login_resp.json()["token"]
        record("AUTH-01", "SETUP", "Admin authentication", True, "200 OK", f"{login_resp.status_code}")
    else:
        record("AUTH-01", "SETUP", "Admin authentication", False, "200 OK", f"{login_resp.status_code}", login_resp.text)
        print("CRITICAL: Login failed!")
        return

    admin_headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }

    # =========================================================================
    # PART 1: EMPTY BODY & MALFORMED JSON ON ALL WRITE ENDPOINTS
    # =========================================================================
    print("\n--- Part 1: Empty Body & Malformed JSON on All Write Endpoints ---")
    write_endpoints = [
        ("POST", "/api/v1/auth/login", {}),
        ("POST", "/api/v1/public/psb/daftar", {}),
        ("POST", "/api/core/contact", {}),
        ("POST", "/api/v1/admin/cms/faq", admin_headers),
        ("POST", "/api/v1/admin/cms/fasilitas", admin_headers),
        ("POST", "/api/v1/admin/blog/posts", admin_headers),
        ("PUT", "/api/v1/admin/cms/faq/1", admin_headers),
        ("PUT", "/api/v1/admin/blog/posts/1", admin_headers),
        ("PUT", "/api/v1/admin/psb/pendaftar/1", admin_headers),
        ("PUT", "/api/v1/admin/cms/website-settings/1", admin_headers)
    ]

    # Test 1.1: Completely empty raw body (Content-Length: 0)
    for idx, (method, path, hdrs) in enumerate(write_endpoints):
        h = dict(hdrs)
        h["Content-Type"] = "application/json"
        req = client.build_request(method, path, content=b"", headers=h)
        r = await client.send(req)
        # Empty body should be rejected with 400 Bad Request, NEVER 500
        ok = r.status_code == 400
        clean, leak_msg = check_no_leakage(r.text)
        passed = ok and clean
        detail = leak_msg if not clean else r.text[:80]
        record(f"EMPTY-BODY-{idx+1:02d}", "EMPTY_RAW_BODY", f"{method} {path} with raw empty body", passed, "400", f"{r.status_code}", detail)

    # Test 1.2: Malformed JSON syntax (broken braces)
    malformed_json_payloads = [
        b'{"incomplete": ',
        b'{not_json}',
        b'{"key": "value",,,}',
        b'{"a": "\x00\x01\x02"}'
    ]
    for idx, payload in enumerate(malformed_json_payloads):
        r = await client.post("/api/v1/public/psb/daftar", content=payload, headers={"Content-Type": "application/json"})
        ok = r.status_code == 400
        clean, leak_msg = check_no_leakage(r.text)
        record(f"MALFORM-JSON-{idx+1:02d}", "MALFORMED_SYNTAX", f"POST psb/daftar malformed payload #{idx+1}", ok and clean, "400", f"{r.status_code}", leak_msg or r.text[:80])

    # Test 1.3: Non-object JSON types (array, number, string, boolean, null)
    non_obj_payloads = [
        ("[1, 2, 3]", "JSON Array"),
        ('"string literal"', "JSON String"),
        ("12345", "JSON Number"),
        ("true", "JSON Boolean"),
        ("null", "JSON Null")
    ]
    for idx, (payload, label) in enumerate(non_obj_payloads):
        r = await client.post("/api/v1/public/psb/daftar", content=payload.encode(), headers={"Content-Type": "application/json"})
        ok = r.status_code == 400
        clean, leak_msg = check_no_leakage(r.text)
        record(f"NON-OBJ-PSB-{idx+1:02d}", "NON_OBJECT_JSON", f"POST psb/daftar with {label}", ok and clean, "400", f"{r.status_code}", leak_msg or r.text[:80])

        r2 = await client.put("/api/v1/admin/cms/faq/1", content=payload.encode(), headers=admin_headers)
        ok2 = r2.status_code == 400
        clean2, leak_msg2 = check_no_leakage(r2.text)
        record(f"NON-OBJ-CMS-{idx+1:02d}", "NON_OBJECT_JSON", f"PUT cms/faq/1 with {label}", ok2 and clean2, "400", f"{r2.status_code}", leak_msg2 or r2.text[:80])

    # =========================================================================
    # PART 2: SQL INJECTION ATTACKS
    # =========================================================================
    print("\n--- Part 2: SQL Injection Attack Suite ---")
    sqli_vectors = [
        "' OR '1'='1",
        "1; DROP TABLE blog_blogpost; --",
        "'; EXEC xp_cmdshell('dir'); --",
        "1' UNION SELECT 1, 'admin', 'pass', 1, 1, 1, 1, 1--",
        "1 AND 1=cast((SELECT table_name FROM information_schema.tables LIMIT 1) as int)--",
        "' OR pg_sleep(5)--",
        "admin'--",
        "\" OR \"\"=\"",
        "1' OR '1'='1' /*"
    ]

    # Test SQLi in path params (slug / id)
    for idx, sqli in enumerate(sqli_vectors[:5]):
        r = await client.get(f"/api/v1/public/posts/{sqli}")
        ok = r.status_code in [400, 404]
        clean, leak_msg = check_no_leakage(r.text)
        record(f"SQLI-PATH-{idx+1:02d}", "SQL_INJECTION", f"GET /api/v1/public/posts/{sqli[:15]}...", ok and clean, "400 or 404", f"{r.status_code}", leak_msg or r.text[:80])

    # Test SQLi in query string
    for idx, sqli in enumerate(sqli_vectors[:4]):
        r = await client.get("/api/v1/public/posts", params={"search": sqli, "category": sqli})
        ok = r.status_code in [200, 400]
        clean, leak_msg = check_no_leakage(r.text)
        record(f"SQLI-QUERY-{idx+1:02d}", "SQL_INJECTION", f"GET /api/v1/public/posts?search={sqli[:15]}...", ok and clean, "200 or 400", f"{r.status_code}", leak_msg or r.text[:80])

    # Test SQLi in JSON payload fields
    sqli_body_psb = {
        "nama_lengkap": "Hacker ' OR '1'='1; DROP TABLE test; --",
        "nisn": "1234567890' OR '1'='1",
        "nik": "1234567890123456",
        "tempat_lahir": "City'; DROP TABLE admissions_santri; --",
        "tanggal_lahir": "2010-01-01",
        "jenis_kelamin": "L",
        "alamat": "Street -- /* comment */",
        "nama_wali": "Wali ' OR '1'='1",
        "no_telp_wali": "08123456789",
        "email_wali": "test@example.com",
        "pilihan_program": "Reguler"
    }
    r = await client.post("/api/v1/public/psb/daftar", json=sqli_body_psb)
    clean, leak_msg = check_no_leakage(r.text)
    record("SQLI-BODY-01", "SQL_INJECTION", "POST psb/daftar with SQLi strings in fields", clean and (r.status_code in [201, 400]), "201 or 400", f"{r.status_code}", leak_msg or r.text[:80])

    # Test SQLi in JSON keys for blog update
    sqli_keys_blog = {
        "title; DROP TABLE blog_blogpost; --": "test",
        "nonexistent' OR '1'='1": "val",
        "title": "Legit Title"
    }
    r = await client.put("/api/v1/admin/blog/posts/1", json=sqli_keys_blog, headers=admin_headers)
    ok = r.status_code == 400
    clean, leak_msg = check_no_leakage(r.text)
    record("SQLI-KEY-01", "SQL_INJECTION", "PUT admin/blog/posts/1 with SQLi in column keys", ok and clean, "400", f"{r.status_code}", leak_msg or r.text[:80])

    # Test SQLi in JSON keys for CMS update
    sqli_keys_cms = {
        "pertanyaan; DROP TABLE core_faq; --": "test",
        "jawab": "Safe answer"
    }
    r = await client.put("/api/v1/admin/cms/faq/1", json=sqli_keys_cms, headers=admin_headers)
    ok = r.status_code == 400
    clean, leak_msg = check_no_leakage(r.text)
    record("SQLI-KEY-02", "SQL_INJECTION", "PUT admin/cms/faq/1 with SQLi in column keys", ok and clean, "400", f"{r.status_code}", leak_msg or r.text[:80])

    # =========================================================================
    # PART 3: INVALID TYPES & BOUNDARY CONDITIONS
    # =========================================================================
    print("\n--- Part 3: Invalid Types & Boundary Conditions ---")

    # Invalid types in PSB registration
    invalid_types_tests = [
        ("Array in string field", {"nama_lengkap": ["array", "of", "strings"], "nisn": "0011223344"}),
        ("Object in string field", {"nama_lengkap": {"first": "John", "last": "Doe"}, "nisn": "0011223344"})
    ]
    for idx, (desc, payload) in enumerate(invalid_types_tests):
        base_payload = {
            "nama_lengkap": "Test Candidate",
            "nisn": f"88{idx:08d}",
            "nik": "1234567890123456",
            "tempat_lahir": "Jakarta",
            "tanggal_lahir": "2010-01-01",
            "jenis_kelamin": "L",
            "alamat": "Jl. Mawar No 1",
            "nama_wali": "Wali Test",
            "no_telp_wali": "08123456789",
            "email_wali": "wali@example.com",
            "pilihan_program": "Tahfidz"
        }
        base_payload.update(payload)
        r = await client.post("/api/v1/public/psb/daftar", json=base_payload)
        ok = r.status_code == 400
        clean, leak_msg = check_no_leakage(r.text)
        record(f"TYPE-INV-{idx+1:02d}", "TYPE_VALIDATION", f"POST psb/daftar {desc}", ok and clean, "400", f"{r.status_code}", leak_msg or r.text[:80])

    # Date validation on PutAdminPSBPendaftar
    date_invalid_tests = [
        ("Arbitrary string as date (SQLSTATE 22007)", {"tanggal_lahir": "not-a-date"}, [400]),
        ("Invalid format date (SQLSTATE 22008)", {"tanggal_lahir": "99-99-9999"}, [400, 500]),
        ("Non-existent calendar date (SQLSTATE 22008)", {"tanggal_lahir": "2024-02-31"}, [400, 500]),
        ("Integer instead of date (SQLSTATE 42804)", {"tanggal_lahir": 12345678}, [400, 500])
    ]
    for idx, (desc, payload, allowed_statuses) in enumerate(date_invalid_tests):
        r = await client.put("/api/v1/admin/psb/pendaftar/1", json=payload, headers=admin_headers)
        clean, leak_msg = check_no_leakage(r.text)
        ok = (r.status_code in allowed_statuses) and clean
        record(f"DATE-INV-{idx+1:02d}", "DATE_VALIDATION", f"PUT admin/psb/pendaftar/1 with {desc}", ok, str(allowed_statuses), f"{r.status_code}", leak_msg or r.text[:80])

    # Invalid ID parameters in URLs (negative, zero, overflow, alphanumeric)
    id_tests = [
        ("Negative ID", "-1"),
        ("Zero ID", "0"),
        ("Huge 64-bit overflow ID", "9999999999999999999999999999999999"),
        ("Alphanumeric string ID", "abc-not-an-id")
    ]
    for idx, (desc, id_val) in enumerate(id_tests):
        r = await client.get(f"/api/v1/admin/cms/faq/{id_val}", headers=admin_headers)
        ok = r.status_code in [400, 404]
        clean, leak_msg = check_no_leakage(r.text)
        record(f"ID-BOUND-{idx+1:02d}", "BOUNDARY_ID", f"GET cms/faq/{id_val} ({desc})", ok and clean, "400 or 404", f"{r.status_code}", leak_msg or r.text[:80])

    # =========================================================================
    # PART 4: OVERSIZED STRINGS & PAYLOAD LIMITS
    # =========================================================================
    print("\n--- Part 4: Oversized Payloads & String Limits ---")

    # 4.1 Contact message oversized (6,000 characters - limit is 5000)
    huge_msg = "A" * 6000
    r = await client.post("/api/core/contact", json={"nama": "Tester", "email": "test@test.com", "pesan": huge_msg})
    ok = r.status_code == 400
    clean, leak_msg = check_no_leakage(r.text)
    record("OVERSIZE-01", "PAYLOAD_LIMIT", "POST /api/core/contact with >5000 char message", ok and clean, "400", f"{r.status_code}", leak_msg or r.text[:80])

    # 4.2 Massive body (5MB payload) to test server body limits
    huge_body = b"X" * (5 * 1024 * 1024)
    try:
        r = await client.post("/api/v1/public/psb/daftar", content=huge_body, headers={"Content-Type": "application/json"})
        ok = r.status_code in [400, 413]
        record("OVERSIZE-02", "PAYLOAD_LIMIT", "POST psb/daftar with 5MB raw body", ok, "400 or 413", f"{r.status_code}")
    except (httpx.RequestError, httpx.HTTPError) as e:
        record("OVERSIZE-02", "PAYLOAD_LIMIT", "POST psb/daftar with 5MB raw body", True, "400, 413, or connection drop", "Connection dropped safely")

    # 4.3 Null byte injection in strings (testing no panic or leaked details)
    null_byte_payload = {
        "nama_lengkap": "Test\u0000Injected",
        "nisn": "9998887770",
        "nik": "1234567890123456",
        "tempat_lahir": "City\u0000Injection",
        "tanggal_lahir": "2010-01-01",
        "jenis_kelamin": "L",
        "alamat": "Address\u0000Test",
        "nama_wali": "Parent",
        "no_telp_wali": "08123456789",
        "email_wali": "parent@example.com",
        "pilihan_program": "Reguler"
    }
    r = await client.post("/api/v1/public/psb/daftar", json=null_byte_payload)
    clean, leak_msg = check_no_leakage(r.text)
    # Server should reject without leak, status code 400 or 500
    ok = r.status_code in [400, 500] and clean
    record("NULL-BYTE-01", "PAYLOAD_SAFETY", "POST psb/daftar with null bytes handled without leak/panic", ok, "400 or 500 (sanitized)", f"{r.status_code}", leak_msg or r.text[:80])

    # =========================================================================
    # PART 5: CONCURRENCY STRESS TESTING
    # =========================================================================
    print("\n--- Part 5: Concurrency Stress Testing ---")

    # 5.1 Race Condition: 25 simultaneous registrations with identical NISN
    target_nisn = f"RACE{random.randint(100000, 999999)}"
    async def register_candidate(worker_id):
        body = {
            "nama_lengkap": f"Race Candidate {worker_id}",
            "nisn": target_nisn,
            "nik": f"3201{random.randint(100000000000, 999999999999)}",
            "tempat_lahir": "Jakarta",
            "tanggal_lahir": "2010-05-15",
            "jenis_kelamin": "L",
            "alamat": "Jl. Race Test",
            "nama_wali": "Parent Race",
            "no_telp_wali": "081298765432",
            "email_wali": f"race_{worker_id}@example.com",
            "pilihan_program": "Tahfidz"
        }
        try:
            res = await client.post("/api/v1/public/psb/daftar", json=body)
            return res.status_code
        except Exception as ex:
            return str(ex)

    print(f"  Firing 25 concurrent registrations with identical NISN={target_nisn}...")
    tasks = [register_candidate(i) for i in range(25)]
    statuses = await asyncio.gather(*tasks)

    success_count = sum(1 for s in statuses if s == 201)
    rejected_count = sum(1 for s in statuses if s == 400)
    server_error_count = sum(1 for s in statuses if s == 500)

    concur_passed = (success_count == 1 and rejected_count == 24 and server_error_count == 0)
    record("CONCUR-RACE-01", "CONCURRENCY", f"25 concurrent same-NISN registrations: 1x201, 24x400, 0x500",
           concur_passed, "201: 1, 400: 24, 500: 0",
           f"201: {success_count}, 400: {rejected_count}, 500: {server_error_count}")

    # 5.2 Concurrency on Admin CMS Updates (30 simultaneous updates to same record)
    async def update_cms_item(worker_id):
        payload = {
            "pertanyaan": f"Concurrent Question update {worker_id}",
            "jawaban": f"Concurrent Answer update {worker_id}",
            "kategori": "General",
            "urutan": worker_id
        }
        try:
            res = await client.put("/api/v1/admin/cms/faq/1", json=payload, headers=admin_headers)
            return res.status_code
        except Exception as ex:
            return str(ex)

    print("  Firing 30 concurrent updates on CMS FAQ record #1...")
    tasks_cms = [update_cms_item(i) for i in range(30)]
    cms_statuses = await asyncio.gather(*tasks_cms)
    cms_ok_count = sum(1 for s in cms_statuses if s == 200)
    cms_500_count = sum(1 for s in cms_statuses if s == 500)
    cms_passed = (cms_ok_count == 30 and cms_500_count == 0)
    record("CONCUR-CMS-01", "CONCURRENCY", "30 concurrent CMS updates on same record all succeed (200 OK)",
           cms_passed, "200: 30, 500: 0", f"200: {cms_ok_count}, 500: {cms_500_count}")

    # 5.3 Concurrency on Admin Blog Updates (30 simultaneous updates to same blog post)
    async def update_blog_item(worker_id):
        payload = {
            "title": f"Concurrent Blog Title {worker_id}",
            "content": f"Concurrent Blog Content {worker_id}"
        }
        try:
            res = await client.put("/api/v1/admin/blog/posts/1", json=payload, headers=admin_headers)
            return res.status_code
        except Exception as ex:
            return str(ex)

    print("  Firing 30 concurrent updates on Blog Post record #1...")
    tasks_blog = [update_blog_item(i) for i in range(30)]
    blog_statuses = await asyncio.gather(*tasks_blog)
    blog_ok_count = sum(1 for s in blog_statuses if s == 200)
    blog_500_count = sum(1 for s in blog_statuses if s == 500)
    blog_passed = (blog_ok_count == 30 and blog_500_count == 0)
    record("CONCUR-BLOG-01", "CONCURRENCY", "30 concurrent Blog updates on same record all succeed (200 OK)",
           blog_passed, "200: 30, 500: 0", f"200: {blog_ok_count}, 500: {blog_500_count}")

    # 5.4 Concurrency on Admin PSB Pendaftar Updates (30 simultaneous status updates)
    async def update_psb_status(worker_id):
        status_choice = "Diterima" if worker_id % 2 == 0 else "Verifikasi"
        payload = {
            "status_pendaftaran": status_choice,
            "catatan": f"Update note from worker {worker_id}"
        }
        try:
            res = await client.put("/api/v1/admin/psb/pendaftar/1", json=payload, headers=admin_headers)
            return res.status_code
        except Exception as ex:
            return str(ex)

    print("  Firing 30 concurrent updates on PSB Pendaftar record #1...")
    tasks_psb = [update_psb_status(i) for i in range(30)]
    psb_statuses = await asyncio.gather(*tasks_psb)
    psb_ok_count = sum(1 for s in psb_statuses if s == 200)
    psb_500_count = sum(1 for s in psb_statuses if s == 500)
    psb_passed = (psb_ok_count == 30 and psb_500_count == 0)
    record("CONCUR-PSB-01", "CONCURRENCY", "30 concurrent PSB updates on same record all succeed (200 OK)",
           psb_passed, "200: 30, 500: 0", f"200: {psb_ok_count}, 500: {psb_500_count}")

    # 5.5 High-Concurrency Read Stress Test (100 simultaneous requests)
    print("  Firing 100 concurrent reads across public endpoints...")
    read_endpoints = [
        "/api/v1/public/website-settings",
        "/api/v1/public/hero-section",
        "/api/v1/public/visi-misi",
        "/api/v1/public/fasilitas",
        "/api/v1/public/tenaga-pengajar",
        "/api/v1/public/posts"
    ]
    async def read_worker(idx):
        ep = read_endpoints[idx % len(read_endpoints)]
        try:
            res = await client.get(ep)
            return res.status_code
        except Exception as ex:
            return str(ex)

    read_tasks = [read_worker(i) for i in range(100)]
    read_statuses = await asyncio.gather(*read_tasks)
    read_200_count = sum(1 for s in read_statuses if s == 200)
    read_passed = (read_200_count == 100)
    record("CONCUR-READ-01", "CONCURRENCY", "100 concurrent public reads all succeed (200 OK)",
           read_passed, "200: 100", f"200: {read_200_count}")

    # =========================================================================
    # PART 6: HTTP METHOD TAMPERING & ROUTING BOUNDS
    # =========================================================================
    print("\n--- Part 6: Method Tampering & Routing Bounds ---")
    method_tests = [
        ("DELETE", "/api/v1/public/psb/daftar", [405, 404]),
        ("PUT", "/api/v1/public/psb/daftar", [405, 404]),
        ("GET", "/api/core/contact", [401, 404, 405]),
        ("POST", "/api/v1/public/website-settings", [405, 404]),
        ("DELETE", "/api/v1/public/hero-section", [405, 404]),
        ("PATCH", "/api/v1/public/visi-misi", [405, 404]),
        ("GET", "/api/v1/admin/nonexistent-route-xyz", [401, 404]),
        ("POST", "/api/v1/admin/cms/invalid_table_name", [400, 404])
    ]
    for idx, (method, path, allowed_codes) in enumerate(method_tests):
        req = client.build_request(method, path, headers=admin_headers if "admin" in path else None)
        r = await client.send(req)
        ok = r.status_code in allowed_codes
        clean, leak_msg = check_no_leakage(r.text)
        record(f"METHOD-{idx+1:02d}", "METHOD_TAMPERING", f"{method} {path} handled with proper status", ok and clean, str(allowed_codes), f"{r.status_code}", leak_msg or r.text[:80])

    # Server health check after all stress tests
    health_resp = await client.get("/health")
    server_alive = health_resp.status_code == 200
    record("HEALTH-01", "SERVER_HEALTH", "Server healthy and responsive after adversarial stress", server_alive, "200 OK", f"{health_resp.status_code}")

    await client.aclose()

    # =========================================================================
    # SUMMARY
    # =========================================================================
    print("\n" + "=" * 80)
    total = len(results)
    passed_count = sum(1 for r in results if r["passed"])
    failed_count = total - passed_count
    print(f"  TOTAL CHALLENGER 2 TESTS: {total} | PASSED: {passed_count} | FAILED: {failed_count}")
    print("=" * 80)

    with open("/opt/data/home/mizan.apps/tests/e2e/challenger2_results.json", "w") as f:
        json.dump({"total": total, "passed": passed_count, "failed": failed_count, "results": results}, f, indent=2)

    if failed_count > 0:
        print("\nFAILURE SUMMARY:")
        for r in results:
            if not r["passed"]:
                print(f"  FAILED: {r['id']} - {r['desc']} (Expected: {r['expected']}, Got: {r['actual']}, Detail: {r['detail']})")
        return 1
    return 0

if __name__ == "__main__":
    import sys
    exit_code = asyncio.run(run_suite())
    sys.exit(exit_code)
