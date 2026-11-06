#!/usr/bin/env python3
import asyncio
import concurrent.futures
import json
import socket
import sys
import time
import uuid
import asyncpg
import httpx

BASE_URL = "http://127.0.0.1:3000"
PG_DSN = "postgresql://postgres@127.0.0.1:5432/mizan"

results = []

def record(test_id, desc, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    results.append({"id": test_id, "desc": desc, "status": status, "detail": detail})
    mark = "[PASS]" if passed else "[FAIL]"
    msg = f"  {mark} {test_id:8} {desc}"
    if not passed and detail:
        msg += f" -> {detail}"
    print(msg)

async def run_challenges():
    print("=== Milestone M3 Empirical Adversarial Stress Suite ===")
    
    client = httpx.AsyncClient(base_url=BASE_URL, timeout=10.0)
    
    # -------------------------------------------------------------
    # SETUP & AUTHENTICATION
    # -------------------------------------------------------------
    print("--- Phase 0: Admin Authentication ---")
    login_resp = await client.post("/api/v1/auth/login", json={"username": "admin", "password": "password123"})
    if login_resp.status_code == 200 and "token" in login_resp.json():
        admin_token = login_resp.json()["token"]
        record("AUTH-1", "Admin authentication yields valid JWT", True)
    else:
        record("AUTH-1", "Admin authentication yields valid JWT", False, f"HTTP {login_resp.status_code}: {login_resp.text}")
        return

    admin_headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }

    # -------------------------------------------------------------
    # CHALLENGE 1: SEQUENCE SYNCHRONIZATION STRESS TEST
    # -------------------------------------------------------------
    print("\n--- Phase 1: Sequence Synchronization Stress Test ---")
    pg_conn = await asyncpg.connect(PG_DSN)
    
    # Check baseline sequences
    cms_tables = {
        "faq": "core_faq",
        "herosection": "core_herosection",
        "statistik": "core_statistik",
        "visimisi": "core_visimisi",
        "fasilitas": "core_fasilitas",
        "blog": "blog_blogpost"
    }
    
    # Rapid sequential inserts
    seq_failures = 0
    created_ids = {sec: [] for sec in cms_tables}
    
    for i in range(5):
        run_uid = f"adv_seq_{uuid.uuid4().hex[:6]}"
        
        # 1. faq
        r_faq = await client.post("/api/v1/admin/cms/faq", headers=admin_headers, json={
            "pertanyaan": f"Adv Question {i} {run_uid}?",
            "jawaban": f"Adv Answer {i}",
            "kategori": "umum",
            "order": 100 + i,
            "is_published": True
        })
        if r_faq.status_code != 201:
            seq_failures += 1
            print(f"FAQ insert fail: {r_faq.status_code} {r_faq.text}")
            
        # 2. herosection
        r_hero = await client.post("/api/v1/admin/cms/herosection", headers=admin_headers, json={
            "title": f"Adv Hero {i} {run_uid}",
            "subtitle": "Adv Hero Subtitle",
            "order": 100 + i,
            "is_active": True
        })
        if r_hero.status_code != 201:
            seq_failures += 1
            print(f"Hero insert fail: {r_hero.status_code} {r_hero.text}")
            
        # 3. statistik
        r_stat = await client.post("/api/v1/admin/cms/statistik", headers=admin_headers, json={
            "judul": f"Adv Stat {i} {run_uid}",
            "nilai": f"{1000 + i}",
            "icon": "Users",
            "deskripsi": "Statistik stress test",
            "warna": "#1B4D3E",
            "order": 100 + i,
            "is_published": True
        })
        if r_stat.status_code != 201:
            seq_failures += 1
            print(f"Statistik insert fail: {r_stat.status_code} {r_stat.text}")
            
        # 4. visimisi
        r_vm = await client.post("/api/v1/admin/cms/visimisi", headers=admin_headers, json={
            "visi": f"Adv Visi {i} {run_uid}",
            "misi": f"Adv Misi {i} {run_uid}"
        })
        if r_vm.status_code != 201:
            seq_failures += 1
            print(f"VisiMisi insert fail: {r_vm.status_code} {r_vm.text}")
            
        # 5. fasilitas
        r_fas = await client.post("/api/v1/admin/cms/fasilitas", headers=admin_headers, json={
            "nama": f"Adv Fasilitas {i} {run_uid}",
            "icon": "Building",
            "order": 100 + i
        })
        if r_fas.status_code != 201:
            seq_failures += 1
            print(f"Fasilitas insert fail: {r_fas.status_code} {r_fas.text}")
            
        # 6. blog post
        r_post = await client.post("/api/v1/admin/blog/posts", headers=admin_headers, json={
            "title": f"Adv Article {i} {run_uid}",
            "slug": f"adv-article-{i}-{run_uid}",
            "content": f"Comprehensive content for stress test {i}",
            "excerpt": f"Excerpt {i}",
            "status": "published",
            "is_featured": False
        })
        if r_post.status_code != 201:
            seq_failures += 1
            print(f"Blog post insert fail: {r_post.status_code} {r_post.text}")

    record("SEQ-1", "Rapid sequential inserts across 5 CMS sections + Blog (30 inserts) return HTTP 201", seq_failures == 0, f"Failures: {seq_failures}")

    # Rapid concurrent inserts (24 concurrent requests across endpoints)
    print("Testing rapid concurrent inserts across CMS and Blog...")
    async def post_task(section, payload):
        if section == "blog":
            url = "/api/v1/admin/blog/posts"
        else:
            url = f"/api/v1/admin/cms/{section}"
        res = await client.post(url, headers=admin_headers, json=payload)
        return section, res.status_code, res.text

    concurrent_tasks = []
    for c_idx in range(4):
        c_uid = f"adv_con_{uuid.uuid4().hex[:6]}"
        concurrent_tasks.append(post_task("faq", {
            "pertanyaan": f"Concurrent FAQ {c_idx} {c_uid}?",
            "jawaban": "Answer",
            "kategori": "umum",
            "order": 200 + c_idx,
            "is_published": True
        }))
        concurrent_tasks.append(post_task("herosection", {
            "title": f"Concurrent Hero {c_idx} {c_uid}",
            "subtitle": "Subtitle",
            "order": 200 + c_idx,
            "is_active": True
        }))
        concurrent_tasks.append(post_task("statistik", {
            "judul": f"Concurrent Stat {c_idx} {c_uid}",
            "nilai": f"{2000 + c_idx}",
            "icon": "Users",
            "deskripsi": "Desc",
            "warna": "#1B4D3E",
            "order": 200 + c_idx,
            "is_published": True
        }))
        concurrent_tasks.append(post_task("visimisi", {
            "visi": f"Concurrent Visi {c_idx} {c_uid}",
            "misi": f"Concurrent Misi {c_idx} {c_uid}"
        }))
        concurrent_tasks.append(post_task("fasilitas", {
            "nama": f"Concurrent Fasilitas {c_idx} {c_uid}",
            "icon": "Building",
            "order": 200 + c_idx
        }))
        concurrent_tasks.append(post_task("blog", {
            "title": f"Concurrent Article {c_idx} {c_uid}",
            "slug": f"concurrent-article-{c_idx}-{c_uid}",
            "content": "Content",
            "excerpt": "Excerpt",
            "status": "published"
        }))

    concurrent_results = await asyncio.gather(*concurrent_tasks)
    con_fails = [r for r in concurrent_results if r[1] != 201]
    has_23505 = any("23505" in r[2] for r in concurrent_results)
    
    record("SEQ-2", "24 concurrent inserts across all sections return HTTP 201 with zero 23505 collisions", len(con_fails) == 0 and not has_23505, f"Failures: {len(con_fails)}, 23505 found: {has_23505}")

    # Database sequence integrity check
    seq_integrity_ok = True
    integrity_details = []
    for sec, tbl in cms_tables.items():
        seq = await pg_conn.fetchval(f"SELECT pg_get_serial_sequence('{tbl}', 'id')")
        max_id = await pg_conn.fetchval(f"SELECT MAX(id) FROM {tbl}")
        seq_row = await pg_conn.fetchrow(f"SELECT last_value, is_called FROM {seq}")
        last_val, is_called = seq_row[0], seq_row[1]
        if not (last_val >= max_id and is_called == True):
            seq_integrity_ok = False
            integrity_details.append(f"{tbl}: last_val={last_val}, max_id={max_id}, is_called={is_called}")
            
    record("SEQ-3", "PostgreSQL sequences across all tables maintain last_value >= max_id and is_called=True", seq_integrity_ok, "; ".join(integrity_details))

    # -------------------------------------------------------------
    # CHALLENGE 2: INPUT LENGTH BOUNDARIES & ADVERSARIAL OVERFLOWS
    # -------------------------------------------------------------
    print("\n--- Phase 2: Input Length Boundary Stress Tests ---")
    
    # PSB Daftar: nama_lengkap, nisn, phone, email
    psb_url = "/api/v1/public/psb/daftar"
    
    # 2.1 nama_lengkap boundary
    # Valid: 200 ASCII chars
    r = await client.post(psb_url, json={"nama_lengkap": "A" * 200, "nisn": f"9{uuid.uuid4().int % 10**9}"})
    record("BND-1.1", "POST psb/daftar nama_lengkap exact 200 chars returns 201/200", r.status_code in (200, 201), f"HTTP {r.status_code}")
    
    # Overflow: 201 ASCII chars
    r = await client.post(psb_url, json={"nama_lengkap": "A" * 201, "nisn": f"9{uuid.uuid4().int % 10**9}"})
    no_500_or_22001 = r.status_code == 400 and "22001" not in r.text and "500" not in str(r.status_code)
    record("BND-1.2", "POST psb/daftar nama_lengkap 201 chars returns HTTP 400 (no 500, no 22001)", no_500_or_22001, f"HTTP {r.status_code}: {r.text}")

    # Unicode multi-byte: 200 runes (each rune is 2 bytes in UTF-8)
    r = await client.post(psb_url, json={"nama_lengkap": "م" * 200, "nisn": f"9{uuid.uuid4().int % 10**9}"})
    record("BND-1.3", "POST psb/daftar nama_lengkap 200 multibyte Unicode runes returns 201/200", r.status_code in (200, 201), f"HTTP {r.status_code}")

    # Unicode multi-byte: 201 runes
    r = await client.post(psb_url, json={"nama_lengkap": "م" * 201, "nisn": f"9{uuid.uuid4().int % 10**9}"})
    record("BND-1.4", "POST psb/daftar nama_lengkap 201 multibyte runes returns HTTP 400", r.status_code == 400 and "22001" not in r.text, f"HTTP {r.status_code}")

    # Massive 10,000 char string
    r = await client.post(psb_url, json={"nama_lengkap": "X" * 10000, "nisn": "1234567890"})
    record("BND-1.5", "POST psb/daftar nama_lengkap 10,000 chars returns HTTP 400 without crashing", r.status_code == 400 and "22001" not in r.text, f"HTTP {r.status_code}")

    # 2.2 nisn boundary
    # Valid: 20 chars
    r = await client.post(psb_url, json={"nama_lengkap": "Valid Santri", "nisn": "9" * 20})
    record("BND-2.1", "POST psb/daftar nisn exact 20 chars returns 201/200", r.status_code in (200, 201), f"HTTP {r.status_code}")

    # Overflow: 21 chars
    r = await client.post(psb_url, json={"nama_lengkap": "Valid Santri", "nisn": "9" * 21})
    record("BND-2.2", "POST psb/daftar nisn 21 chars returns HTTP 400 (no 500, no 22001)", r.status_code == 400 and "22001" not in r.text, f"HTTP {r.status_code}")

    # 2.3 phone boundary
    # Valid: 20 chars
    r = await client.post(psb_url, json={"nama_lengkap": "Valid Santri", "nisn": f"9{uuid.uuid4().int % 10**9}", "phone": "0" * 20})
    record("BND-3.1", "POST psb/daftar phone exact 20 chars returns 201/200", r.status_code in (200, 201), f"HTTP {r.status_code}")

    # Overflow: 21 chars
    r = await client.post(psb_url, json={"nama_lengkap": "Valid Santri", "nisn": f"9{uuid.uuid4().int % 10**9}", "phone": "0" * 21})
    record("BND-3.2", "POST psb/daftar phone 21 chars returns HTTP 400 (no 500, no 22001)", r.status_code == 400 and "22001" not in r.text, f"HTTP {r.status_code}")

    # 2.4 email boundary
    # Valid: 254 chars (e.g. prefix 242 chars + @example.com (12 chars))
    valid_email = "e" * 242 + "@example.com"
    r = await client.post(psb_url, json={"nama_lengkap": "Valid Santri", "nisn": f"9{uuid.uuid4().int % 10**9}", "email": valid_email})
    record("BND-4.1", "POST psb/daftar email exact 254 chars returns 201/200", r.status_code in (200, 201), f"HTTP {r.status_code}")

    # Overflow: 255 chars
    overflow_email = "e" * 243 + "@example.com"
    r = await client.post(psb_url, json={"nama_lengkap": "Valid Santri", "nisn": f"9{uuid.uuid4().int % 10**9}", "email": overflow_email})
    record("BND-4.2", "POST psb/daftar email 255 chars returns HTTP 400 (no 500, no 22001)", r.status_code == 400 and "22001" not in r.text, f"HTTP {r.status_code}")

    # 2.5 Contact API: /api/core/contact
    contact_url = "/api/core/contact"
    # Valid nama 200 chars
    r = await client.post(contact_url, json={"nama": "C" * 200, "email": "adv@test.com", "no_hp": "0812345", "subjek": "Hi", "pesan": "Hello"})
    record("BND-5.1", "POST /api/core/contact nama 200 chars returns HTTP 201", r.status_code == 201, f"HTTP {r.status_code}")

    # Overflow nama 201 chars
    r = await client.post(contact_url, json={"nama": "C" * 201, "email": "adv@test.com", "no_hp": "0812345", "subjek": "Hi", "pesan": "Hello"})
    record("BND-5.2", "POST /api/core/contact nama 201 chars returns HTTP 400 (no 500, no 22001)", r.status_code == 400 and "22001" not in r.text, f"HTTP {r.status_code}")

    # Overflow email 255 chars
    r = await client.post(contact_url, json={"nama": "Valid", "email": overflow_email, "no_hp": "0812345", "subjek": "Hi", "pesan": "Hello"})
    record("BND-5.3", "POST /api/core/contact email 255 chars returns HTTP 400", r.status_code == 400 and "22001" not in r.text, f"HTTP {r.status_code}")

    # Overflow no_hp 21 chars
    r = await client.post(contact_url, json={"nama": "Valid", "email": "adv@test.com", "no_hp": "0" * 21, "subjek": "Hi", "pesan": "Hello"})
    record("BND-5.4", "POST /api/core/contact no_hp 21 chars returns HTTP 400", r.status_code == 400 and "22001" not in r.text, f"HTTP {r.status_code}")

    # Overflow pesan 5001 chars
    r = await client.post(contact_url, json={"nama": "Valid", "email": "adv@test.com", "no_hp": "0812345", "subjek": "Hi", "pesan": "P" * 5001})
    record("BND-5.5", "POST /api/core/contact pesan 5001 chars returns HTTP 400", r.status_code == 400 and "22001" not in r.text, f"HTTP {r.status_code}")

    # 2.6 Admin Blog Post: /api/v1/admin/blog/posts
    blog_url = "/api/v1/admin/blog/posts"
    # Title 201 chars
    r = await client.post(blog_url, headers=admin_headers, json={"title": "T" * 201, "content": "Valid Content"})
    record("BND-6.1", "POST /api/v1/admin/blog/posts title 201 chars returns HTTP 400", r.status_code == 400 and "22001" not in r.text, f"HTTP {r.status_code}")

    # Slug 201 chars
    r = await client.post(blog_url, headers=admin_headers, json={"title": "Valid Title", "slug": "s" * 201, "content": "Valid Content"})
    record("BND-6.2", "POST /api/v1/admin/blog/posts slug 201 chars returns HTTP 400", r.status_code == 400 and "22001" not in r.text, f"HTTP {r.status_code}")

    # Status 21 chars
    r = await client.post(blog_url, headers=admin_headers, json={"title": "Valid Title", "slug": f"valid-slug-{uuid.uuid4().hex[:4]}", "status": "s" * 21, "content": "Valid Content"})
    record("BND-6.3", "POST /api/v1/admin/blog/posts status 21 chars returns HTTP 400", r.status_code == 400 and "22001" not in r.text, f"HTTP {r.status_code}")

    # -------------------------------------------------------------
    # CHALLENGE 3: ROUTER BOUNDARY & TRAVERSAL
    # -------------------------------------------------------------
    print("\n--- Phase 3: Router Boundary & Path Traversal Tests ---")
    
    # 3.1 GET /api/v1/public/psb/daftar returns HTTP 405
    r = await client.get("/api/v1/public/psb/daftar")
    record("RTR-1.1", "GET /api/v1/public/psb/daftar returns HTTP 405 Method Not Allowed", r.status_code == 405, f"HTTP {r.status_code}")

    # 3.2 Unmapped public routes return HTTP 404
    r1 = await client.get("/api/v1/public/unmapped-endpoint-xyz")
    r2 = await client.get("/api/v1/public/deeply/nested/nonexistent/route")
    r3 = await client.post("/api/v1/public/unmapped-post-action", json={})
    unmapped_ok = r1.status_code == 404 and r2.status_code == 404 and r3.status_code == 404
    record("RTR-2.1", "Unmapped routes under /api/v1/public/* strictly return HTTP 404 Not Found", unmapped_ok, f"GET1={r1.status_code}, GET2={r2.status_code}, POST={r3.status_code}")

    # 3.3 Path traversal tests via raw HTTP request socket
    def send_raw_request(req_str):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(("127.0.0.1", 3000))
        s.sendall(req_str.encode("utf-8"))
        res = s.recv(4096).decode("utf-8", errors="ignore")
        s.close()
        code = int(res.split(" ")[1]) if " " in res else 0
        return code, res

    # Traversal test 1: /robots.txt/../etc/passwd
    code1, res1 = send_raw_request("GET /robots.txt/../etc/passwd HTTP/1.1\r\nHost: 127.0.0.1:3000\r\nConnection: close\r\n\r\n")
    record("TRV-1.1", "Path traversal /robots.txt/../etc/passwd returns HTTP 403 Forbidden", code1 == 403, f"HTTP {code1}")

    # Traversal test 2: /public/../../etc/passwd
    code2, res2 = send_raw_request("GET /public/../../etc/passwd HTTP/1.1\r\nHost: 127.0.0.1:3000\r\nConnection: close\r\n\r\n")
    record("TRV-1.2", "Path traversal /public/../../etc/passwd returns HTTP 403 Forbidden", code2 == 403, f"HTTP {code2}")

    # Traversal test 3: /assets/../cmd/server/main.go
    code3, res3 = send_raw_request("GET /assets/../cmd/server/main.go HTTP/1.1\r\nHost: 127.0.0.1:3000\r\nConnection: close\r\n\r\n")
    record("TRV-1.3", "Path traversal /assets/../cmd/server/main.go returns HTTP 403 Forbidden", code3 == 403, f"HTTP {code3}")

    # Traversal test 4: /../../etc/shadow
    code4, res4 = send_raw_request("GET /../../etc/shadow HTTP/1.1\r\nHost: 127.0.0.1:3000\r\nConnection: close\r\n\r\n")
    record("TRV-1.4", "Path traversal /../../etc/shadow returns HTTP 403 Forbidden", code4 == 403, f"HTTP {code4}")

    # Traversal test 5: /api/v1/../../etc/passwd
    code5, res5 = send_raw_request("GET /api/v1/../../etc/passwd HTTP/1.1\r\nHost: 127.0.0.1:3000\r\nConnection: close\r\n\r\n")
    record("TRV-1.5", "Path traversal /api/v1/../../etc/passwd rejected safely (403 or 401)", code5 in (401, 403), f"HTTP {code5}")

    # Cleanup DB connection and client
    await pg_conn.close()
    await client.aclose()

    # -------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------
    total = len(results)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = total - passed
    print(f"\n=== Adversarial Suite Complete: Total={total}, Passed={passed}, Failed={failed} ===")
    return failed == 0

if __name__ == "__main__":
    success = asyncio.run(run_challenges())
    sys.exit(0 if success else 1)
