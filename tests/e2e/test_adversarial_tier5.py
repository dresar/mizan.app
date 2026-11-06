#!/usr/bin/env python3
import asyncio
import httpx
import json
import time

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
    print(f"  {status} {test_id:<10} | {category:<18} | {desc}")
    if not passed:
        print(f"         Expected: {expected} | Actual: {actual} | Detail: {detail}")

async def run_suite():
    print("=" * 80)
    print("  TIER 5 ADVERSARIAL COVERAGE HARDENING SUITE (Milestone M4 Phase 2)")
    print("=" * 80)

    client = httpx.AsyncClient(base_url=BASE_URL, timeout=10.0)

    # -------------------------------------------------------------
    # 0. SETUP: ADMIN AUTHENTICATION
    # -------------------------------------------------------------
    print("\n--- Phase 0: Setup & Authentication ---")
    login_resp = await client.post("/api/v1/auth/login", json={"username": "admin", "password": "password123"})
    if login_resp.status_code == 200 and "token" in login_resp.json():
        admin_token = login_resp.json()["token"]
        record("AUTH-01", "SETUP", "Admin JWT authentication succeeds", True, "200 OK + JWT", f"{login_resp.status_code} OK")
    else:
        record("AUTH-01", "SETUP", "Admin JWT authentication succeeds", False, "200 OK + JWT", f"{login_resp.status_code}", login_resp.text)
        print("CRITICAL: Cannot authenticate as admin. Aborting.")
        return

    admin_headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }

    # -------------------------------------------------------------
    # 1. ATTACK VECTOR: EMPTY PAYLOADS ({}) ON WRITE ENDPOINTS
    # -------------------------------------------------------------
    print("\n--- Phase 1: Empty Payloads ({}) on Write Endpoints ---")
    
    # 1.1 POST /api/v1/admin/cms/fasilitas with {}
    r = await client.post("/api/v1/admin/cms/fasilitas", json={}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("EMPTY-01", "EMPTY_PAYLOAD", "POST /api/v1/admin/cms/fasilitas with {}", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 1.2 POST /api/v1/admin/cms/hero-section with {}
    r = await client.post("/api/v1/admin/cms/hero-section", json={}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("EMPTY-02", "EMPTY_PAYLOAD", "POST /api/v1/admin/cms/hero-section with {}", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 1.3 POST /api/v1/admin/cms/tenaga-pengajar with {}
    r = await client.post("/api/v1/admin/cms/tenaga-pengajar", json={}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("EMPTY-03", "EMPTY_PAYLOAD", "POST /api/v1/admin/cms/tenaga-pengajar with {}", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 1.4 PUT /api/v1/admin/cms/fasilitas/1 with {}
    r = await client.put("/api/v1/admin/cms/fasilitas/1", json={}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("EMPTY-04", "EMPTY_PAYLOAD", "PUT /api/v1/admin/cms/fasilitas/1 with {}", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 1.5 POST /api/v1/admin/blog/posts with {}
    r = await client.post("/api/v1/admin/blog/posts", json={}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("EMPTY-05", "EMPTY_PAYLOAD", "POST /api/v1/admin/blog/posts with {}", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 1.6 PUT /api/v1/admin/blog/posts/1 with {}
    r = await client.put("/api/v1/admin/blog/posts/1", json={}, headers=admin_headers)
    passed = (r.status_code in [200, 400])
    record("EMPTY-06", "EMPTY_PAYLOAD", "PUT /api/v1/admin/blog/posts/1 with {}", passed, "200 OK or 400 Bad Request", f"{r.status_code}", r.text[:120])

    # 1.7 POST /api/v1/public/psb/daftar with {}
    r = await client.post("/api/v1/public/psb/daftar", json={})
    passed = (r.status_code == 400)
    record("EMPTY-07", "EMPTY_PAYLOAD", "POST /api/v1/public/psb/daftar with {}", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 1.8 POST /api/core/contact with {}
    r = await client.post("/api/core/contact", json={})
    passed = (r.status_code == 400)
    record("EMPTY-08", "EMPTY_PAYLOAD", "POST /api/core/contact with {}", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 1.9 PUT /api/v1/admin/psb/pendaftar/1 with {}
    r = await client.put("/api/v1/admin/psb/pendaftar/1", json={}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("EMPTY-09", "EMPTY_PAYLOAD", "PUT /api/v1/admin/psb/pendaftar/1 with {}", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # -------------------------------------------------------------
    # 2. ATTACK VECTOR: DB CONSTRAINT ERROR CLASSIFICATION (4xx vs 500)
    # -------------------------------------------------------------
    print("\n--- Phase 2: DB Constraint & Error Classification Coverage ---")

    # 2.1 Constraint 23502 (NOT NULL violation) in POST /api/v1/admin/cms/fasilitas
    r = await client.post("/api/v1/admin/cms/fasilitas", json={"icon": "star"}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("ERR-23502-01", "CONSTRAINT_23502", "POST /api/v1/admin/cms/fasilitas missing required 'nama'", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 2.2 Constraint 23502 (NOT NULL violation) in POST /api/v1/admin/cms/hero-section
    r = await client.post("/api/v1/admin/cms/hero-section", json={"image": "banner.png"}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("ERR-23502-02", "CONSTRAINT_23502", "POST /api/v1/admin/cms/hero-section missing required 'title'/'subtitle'", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 2.3 Constraint 23502 (NOT NULL violation) in PUT /api/v1/admin/cms/fasilitas/1
    r = await client.put("/api/v1/admin/cms/fasilitas/1", json={"nama": None}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("ERR-23502-03", "CONSTRAINT_23502", "PUT /api/v1/admin/cms/fasilitas/1 set 'nama'=null", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 2.4 Constraint 22001 (String length exceeded) in POST /api/v1/admin/cms/fasilitas
    r = await client.post("/api/v1/admin/cms/fasilitas", json={"nama": "X" * 205}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("ERR-22001-01", "CONSTRAINT_22001", "POST /api/v1/admin/cms/fasilitas nama > 200 chars", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 2.5 Constraint 22001 in POST /api/v1/public/psb/daftar
    r = await client.post("/api/v1/public/psb/daftar", json={"nama_lengkap": "Y" * 205, "nisn": "1234567890"})
    passed = (r.status_code == 400)
    record("ERR-22001-02", "CONSTRAINT_22001", "POST /api/v1/public/psb/daftar nama > 200 chars", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 2.6 Constraint 22P02 (Invalid type / text representation) in POST /api/v1/admin/cms/hero-section
    r = await client.post("/api/v1/admin/cms/hero-section", json={"title": "Test Title", "subtitle": "Test Sub", "order": "not_an_int"}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("ERR-22P02-01", "CONSTRAINT_22P02", "POST /api/v1/admin/cms/hero-section order='not_an_int'", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 2.7 Constraint 22P02 in PUT /api/v1/admin/psb/pendaftar/1
    r = await client.put("/api/v1/admin/psb/pendaftar/1", json={"tanggal_lahir": "not-a-date"}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("ERR-22P02-02", "CONSTRAINT_22P02", "PUT /api/v1/admin/psb/pendaftar/1 tanggal_lahir='not-a-date'", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 2.8 Constraint 23505 (Unique violation) duplicate slug in blog posts
    unique_slug = f"test-post-unique-{int(time.time())}"
    r1 = await client.post("/api/v1/admin/blog/posts", json={"title": "Unique Post", "slug": unique_slug, "content": "Content", "excerpt": "Excerpt"}, headers=admin_headers)
    r2 = await client.post("/api/v1/admin/blog/posts", json={"title": "Duplicate Post", "slug": unique_slug, "content": "Content", "excerpt": "Excerpt"}, headers=admin_headers)
    passed = (r2.status_code == 400)
    record("ERR-23505-01", "CONSTRAINT_23505", "POST /api/v1/admin/blog/posts duplicate slug", passed, "400 Bad Request", f"{r2.status_code}", r2.text[:120])

    # 2.9 Unvalidated column name injection in PUT /api/v1/admin/blog/posts/:id (Undefined Column error 42703)
    created_post_id = r1.json().get("data", {}).get("id", 1) if r1.status_code == 201 else 1
    r = await client.put(f"/api/v1/admin/blog/posts/{created_post_id}", json={"non_existent_column_injection": "val"}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("QUERY-INJ-01", "QUERY_INSPECTION", "PUT /api/v1/admin/blog/posts unvalidated column name", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 2.10 Malformed column name with quotes in PUT /api/v1/admin/blog/posts/:id
    r = await client.put(f"/api/v1/admin/blog/posts/{created_post_id}", json={"bogus\"column": "val"}, headers=admin_headers)
    passed = (r.status_code == 400)
    record("QUERY-INJ-02", "QUERY_INSPECTION", "PUT /api/v1/admin/blog/posts column name with quote", passed, "400 Bad Request", f"{r.status_code}", r.text[:120])

    # 2.11 Referential integrity / Foreign key: invalid category_id
    r = await client.post("/api/v1/admin/blog/posts", json={"title": f"Post FK Test {int(time.time())}", "slug": f"post-fk-{int(time.time())}", "content": "C", "excerpt": "E", "category_id": 999999}, headers=admin_headers)
    # Notice: does it reject invalid category_id, or silently orphan it?
    record("FK-23503-01", "FOREIGN_KEY", "POST /api/v1/admin/blog/posts with non-existent category_id 999999", r.status_code == 400, "400 Bad Request (FK validation)", f"{r.status_code}", r.text[:120])

    # -------------------------------------------------------------
    # 3. ATTACK VECTOR: RAPID SEQUENTIAL & CONCURRENT WRITES
    # -------------------------------------------------------------
    print("\n--- Phase 3: Rapid Sequential & Concurrent Writes ---")

    # 3.1 Concurrent PSB registrations (20 workers simultaneously)
    async def register_applicant(idx):
        nisn = f"99{int(time.time()) % 10000000:07d}{idx:02d}"
        payload = {
            "nama_lengkap": f"Santri Concurrency Test {idx}",
            "nisn": nisn,
            "tempat_lahir": "Semarang",
            "jenis_kelamin": "L",
            "no_hp": "081234567890",
            "email": f"santri{idx}@example.com",
            "alamat": "Jl. Merdeka No. 1",
            "asal_sekolah": "SMP 1"
        }
        res = await client.post("/api/v1/public/psb/daftar", json=payload)
        return res.status_code

    tasks = [register_applicant(i) for i in range(20)]
    statuses = await asyncio.gather(*tasks)
    concur_pass = all(s == 201 for s in statuses)
    record("CONCUR-01", "CONCURRENCY", "20 concurrent POST /api/v1/public/psb/daftar", concur_pass, "20x 201 Created", f"{statuses.count(201)}/20 succeeded", f"Statuses: {set(statuses)}")

    # 3.2 Rapid sequential writes to CMS (30 requests)
    seq_statuses = []
    for i in range(30):
        res = await client.post("/api/v1/admin/cms/faq", json={
            "pertanyaan": f"Rapid FAQ {i} {int(time.time())}",
            "jawaban": f"Jawaban test {i}",
            "order": i
        }, headers=admin_headers)
        seq_statuses.append(res.status_code)

    seq_pass = all(s == 201 for s in seq_statuses)
    record("RAPID-01", "RAPID_WRITES", "30 rapid sequential POST /api/v1/admin/cms/faq", seq_pass, "30x 201 Created", f"{seq_statuses.count(201)}/30 succeeded", f"Statuses: {set(seq_statuses)}")

    # -------------------------------------------------------------
    # 4. ATTACK VECTOR: HEADER SPOOFING, METHOD TAMPERING & CORS
    # -------------------------------------------------------------
    print("\n--- Phase 4: Header Spoofing, Method Tampering & CORS ---")

    # 4.1 Method tampering: GET on POST-only route /api/v1/public/psb/daftar
    r = await client.get("/api/v1/public/psb/daftar")
    passed = (r.status_code == 405)
    record("METHOD-01", "METHOD_TAMPERING", "GET /api/v1/public/psb/daftar", passed, "405 Method Not Allowed", f"{r.status_code}", r.text[:120])

    # 4.2 Method tampering: POST on GET-only route /api/v1/public/website-settings
    r = await client.post("/api/v1/public/website-settings", json={})
    passed = (r.status_code in [404, 405])
    record("METHOD-02", "METHOD_TAMPERING", "POST /api/v1/public/website-settings", passed, "404 or 405", f"{r.status_code}", r.text[:120])

    # 4.3 Method tampering: PATCH on GET-only route /api/v1/public/posts
    r = await client.patch("/api/v1/public/posts", json={})
    passed = (r.status_code in [404, 405])
    record("METHOD-03", "METHOD_TAMPERING", "PATCH /api/v1/public/posts", passed, "404 or 405", f"{r.status_code}", r.text[:120])

    # 4.4 Path traversal attempt: /..%2f..%2fetc/passwd
    r = await client.get("/..%2f..%2fetc/passwd")
    passed = (r.status_code in [400, 403, 404])
    record("TRAVERSAL-01", "PATH_TRAVERSAL", "GET /..%2f..%2fetc/passwd", passed, "403 Forbidden or 404", f"{r.status_code}", r.text[:120])

    # 4.5 Path traversal in assets: /assets/../../internal/handlers/portal_admin.go
    r = await client.get("/assets/../../internal/handlers/portal_admin.go")
    passed = (r.status_code in [400, 403, 404])
    record("TRAVERSAL-02", "PATH_TRAVERSAL", "GET /assets/../../internal/handlers/portal_admin.go", passed, "403 Forbidden or 404", f"{r.status_code}", r.text[:120])

    # 4.6 CORS Preflight with untrusted origin
    cors_headers = {
        "Origin": "http://evil-attacker-site.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Authorization,Content-Type"
    }
    r = await client.options("/api/v1/admin/cms/fasilitas", headers=cors_headers)
    allow_origin = r.headers.get("access-control-allow-origin", "")
    allow_creds = r.headers.get("access-control-allow-credentials", "")
    passed = (r.status_code == 204 or r.status_code == 200)
    record("CORS-01", "CORS_PREFLIGHT", "OPTIONS preflight with untrusted Origin", passed, "200/204 with CORS headers", f"{r.status_code} (Origin={allow_origin}, Creds={allow_creds})")

    # 4.7 Header spoofing: Forged Authorization token
    r = await client.get("/api/v1/admin/cms/fasilitas", headers={"Authorization": "Bearer forged.token.here"})
    passed = (r.status_code == 401)
    record("AUTH-SPOOF-01", "HEADER_SPOOFING", "Forged Authorization Bearer token", passed, "401 Unauthorized", f"{r.status_code}", r.text[:120])

    # 4.8 Header spoofing: Spoofed IP headers (X-Forwarded-For) without auth
    r = await client.get("/api/v1/admin/cms/fasilitas", headers={"X-Forwarded-For": "127.0.0.1", "X-Real-IP": "127.0.0.1"})
    passed = (r.status_code == 401)
    record("AUTH-SPOOF-02", "HEADER_SPOOFING", "Access admin endpoint using spoofed 127.0.0.1 IP headers", passed, "401 Unauthorized", f"{r.status_code}", r.text[:120])

    # -------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------
    print("\n" + "=" * 80)
    total = len(results)
    passed_count = sum(1 for r in results if r["passed"])
    failed_count = total - passed_count
    print(f"  TOTAL TESTS: {total} | PASSED: {passed_count} | FAILED: {failed_count}")
    print("=" * 80)

    # Output JSON summary for machine verification
    with open("tests/e2e/tier5_adversarial_results.json", "w") as f:
        json.dump(results, f, indent=2)

    await client.aclose()

if __name__ == "__main__":
    asyncio.run(run_suite())
