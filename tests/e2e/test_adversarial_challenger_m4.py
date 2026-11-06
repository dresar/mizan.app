#!/usr/bin/env python3
import requests
import json
import sys

BASE_URL = "http://localhost:3000"

def get_admin_token():
    resp = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={"username": "admin", "password": "password123"},
        headers={"Content-Type": "application/json"},
        timeout=5
    )
    if resp.status_code != 200:
        print(f"FAILED TO LOGIN: {resp.status_code} {resp.text}")
        sys.exit(1)
    data = resp.json()
    return data.get("token")

def main():
    token = get_admin_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    tests_run = 0
    tests_passed = 0
    failures = []

    def run_check(test_name, method, url, payload, expected_status, check_no_leak=True):
        nonlocal tests_run, tests_passed
        tests_run += 1
        try:
            if method == "POST":
                r = requests.post(url, json=payload, headers=headers, timeout=5)
            elif method == "PUT":
                r = requests.put(url, json=payload, headers=headers, timeout=5)
            elif method == "GET":
                r = requests.get(url, headers=headers, timeout=5)

            status_ok = (r.status_code == expected_status)
            body_text = r.text
            leaks = []
            if check_no_leak:
                forbidden_markers = ["SQLSTATE", "pq:", "pgx:", "goroutine", "syntax error", "panic:", "admissions_", "core_", "blog_"]
                for marker in forbidden_markers:
                    if marker in body_text and r.status_code >= 500:
                        leaks.append(marker)

            if status_ok and not leaks:
                tests_passed += 1
                print(f"  [PASS] {test_name}: HTTP {r.status_code}")
            else:
                reason = f"Expected {expected_status}, got {r.status_code}. Body: {body_text[:120]}"
                if leaks:
                    reason += f" | Leaked DB markers: {leaks}"
                failures.append((test_name, reason))
                print(f"  [FAIL] {test_name}: {reason}")
        except Exception as e:
            failures.append((test_name, f"Exception: {e}"))
            print(f"  [FAIL] {test_name}: Exception {e}")

    print("=== Empirical Challenger Stress Harness (M4 Final Gate) ===")

    # 1. Attack POST /api/v1/admin/cms/:section with {} and variations
    cms_sections = ["faq", "programs", "fasilitas", "hero-section", "tenaga-pengajar", "testimonials", "ekstrakurikuler"]
    for sec in cms_sections:
        run_check(f"CMS POST empty payload ({sec})", "POST", f"{BASE_URL}/api/v1/admin/cms/{sec}", {}, 400)
        run_check(f"CMS POST only ignored fields ({sec})", "POST", f"{BASE_URL}/api/v1/admin/cms/{sec}", {"id": 99, "created_at": "2026-01-01", "updated_at": "2026-01-01"}, 400)

    # 2. Attack PUT /api/v1/admin/cms/:section/:id with null required fields & empty payloads
    run_check("CMS PUT null required field (faq pertanyaan=null)", "PUT", f"{BASE_URL}/api/v1/admin/cms/faq/1", {"pertanyaan": None}, 400)
    run_check("CMS PUT null required field (fasilitas nama=null)", "PUT", f"{BASE_URL}/api/v1/admin/cms/fasilitas/1", {"nama": None}, 400)
    run_check("CMS PUT empty payload (faq/1)", "PUT", f"{BASE_URL}/api/v1/admin/cms/faq/1", {}, 400)
    run_check("CMS PUT only ignored fields (faq/1)", "PUT", f"{BASE_URL}/api/v1/admin/cms/faq/1", {"id": 1, "created_at": "2026-01-01"}, 400)
    run_check("CMS PUT non-existent section", "PUT", f"{BASE_URL}/api/v1/admin/cms/nonexistent_section_xyz/1", {"nama": "test"}, 404)

    # 3. Attack PUT /api/v1/admin/blog/posts/:id with arbitrary column names & null required
    run_check("Blog PUT arbitrary unknown column", "PUT", f"{BASE_URL}/api/v1/admin/blog/posts/1", {"non_existent_column_xyz": "foo"}, 400)
    run_check("Blog PUT column with double-quote injection", "PUT", f"{BASE_URL}/api/v1/admin/blog/posts/1", {'bogus"col': "bar"}, 400)
    run_check("Blog PUT column with SQL injection syntax", "PUT", f"{BASE_URL}/api/v1/admin/blog/posts/1", {'col; DROP TABLE blog_blogpost; --': "val"}, 400)
    run_check("Blog PUT null title", "PUT", f"{BASE_URL}/api/v1/admin/blog/posts/1", {"title": None}, 400)
    run_check("Blog PUT empty payload", "PUT", f"{BASE_URL}/api/v1/admin/blog/posts/1", {}, 400)
    run_check("Blog PUT only ignored fields", "PUT", f"{BASE_URL}/api/v1/admin/blog/posts/1", {"id": 1, "created_at": "2026-01-01", "updated_at": "2026-01-01"}, 400)

    # 4. Attack PUT /api/v1/admin/psb/pendaftar/:id with invalid dates & nulls
    run_check("PSB PUT invalid date string", "PUT", f"{BASE_URL}/api/v1/admin/psb/pendaftar/1", {"tanggal_lahir": "not-a-date"}, 400)
    run_check("PSB PUT out-of-range month date", "PUT", f"{BASE_URL}/api/v1/admin/psb/pendaftar/1", {"tanggal_lahir": "2026-13-45"}, 400)
    run_check("PSB PUT null required field nama_lengkap", "PUT", f"{BASE_URL}/api/v1/admin/psb/pendaftar/1", {"nama_lengkap": None}, 400)
    run_check("PSB PUT null required field nisn", "PUT", f"{BASE_URL}/api/v1/admin/psb/pendaftar/1", {"nisn": None}, 400)
    run_check("PSB PUT empty payload", "PUT", f"{BASE_URL}/api/v1/admin/psb/pendaftar/1", {}, 400)
    run_check("PSB PUT only ignored fields", "PUT", f"{BASE_URL}/api/v1/admin/psb/pendaftar/1", {"id": 1, "created_at": "2026-01-01"}, 400)

    # 5. Attack POST /api/v1/admin/blog/posts with invalid category_id & empty/invalid payloads
    run_check("Blog POST category_id: 999999", "POST", f"{BASE_URL}/api/v1/admin/blog/posts", {
        "title": "Adversarial Blog Post 999999",
        "content": "Test content",
        "category_id": 999999
    }, 400)
    run_check("Blog POST category_id: -1", "POST", f"{BASE_URL}/api/v1/admin/blog/posts", {
        "title": "Adversarial Blog Post Negative Cat",
        "content": "Test content",
        "category_id": -1
    }, 400)
    run_check("Blog POST empty title", "POST", f"{BASE_URL}/api/v1/admin/blog/posts", {
        "title": "",
        "content": "Test content"
    }, 400)
    run_check("Blog POST whitespace title", "POST", f"{BASE_URL}/api/v1/admin/blog/posts", {
        "title": "    \t\n   ",
        "content": "Test content"
    }, 400)
    run_check("Blog POST empty body", "POST", f"{BASE_URL}/api/v1/admin/blog/posts", {}, 400)

    # 6. Additional Boundary & Stress Attacks
    # Malformed JSON payload strings
    malformed_headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    tests_run += 1
    resp_malformed = requests.post(f"{BASE_URL}/api/v1/admin/cms/faq", data="{not-valid-json", headers=malformed_headers, timeout=5)
    if resp_malformed.status_code == 400:
        tests_passed += 1
        print("  [PASS] Malformed JSON syntax on CMS POST: HTTP 400")
    else:
        failures.append(("Malformed JSON syntax", f"Expected 400, got {resp_malformed.status_code}"))
        print(f"  [FAIL] Malformed JSON syntax: {resp_malformed.status_code}")

    tests_run += 1
    resp_malformed_blog = requests.put(f"{BASE_URL}/api/v1/admin/blog/posts/1", data="{title: no_quotes}", headers=malformed_headers, timeout=5)
    if resp_malformed_blog.status_code == 400:
        tests_passed += 1
        print("  [PASS] Malformed JSON syntax on Blog PUT: HTTP 400")
    else:
        failures.append(("Malformed JSON syntax Blog PUT", f"Expected 400, got {resp_malformed_blog.status_code}"))
        print(f"  [FAIL] Malformed JSON syntax Blog PUT: {resp_malformed_blog.status_code}")

    # Massive payload on CMS
    tests_run += 1
    huge_str = "A" * 50000
    resp_huge = requests.post(f"{BASE_URL}/api/v1/admin/cms/faq", json={"pertanyaan": huge_str, "jawaban": "Valid"}, headers=headers, timeout=5)
    # Could be 400 or 201/200, but MUST NOT be 500
    if resp_huge.status_code != 500:
        tests_passed += 1
        print(f"  [PASS] Massive string (50KB) on CMS POST: HTTP {resp_huge.status_code} (safe, no 500)")
    else:
        failures.append(("Massive string on CMS POST", f"Got HTTP 500: {resp_huge.text}"))
        print(f"  [FAIL] Massive string on CMS POST: HTTP 500")

    print("\n=======================================================")
    print(f"TOTAL ADVERSARIAL STRESS TESTS: {tests_run}")
    print(f"PASSED: {tests_passed}")
    print(f"FAILED: {len(failures)}")
    print("=======================================================")

    if failures:
        print("\nFailures:")
        for name, reason in failures:
            print(f"  - {name}: {reason}")
        sys.exit(1)
    else:
        print("\nALL ADVERSARIAL STRESS HARNESS TESTS PASSED (0 BUGS)")
        sys.exit(0)

if __name__ == "__main__":
    main()
