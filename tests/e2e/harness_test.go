package e2e_test

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"testing"
	"time"
)

var baseURL = getBaseURL()

func getBaseURL() string {
	u := os.Getenv("BASE_URL")
	if u == "" {
		return "http://localhost:3000"
	}
	return u
}

func TestBuildAndServing(t *testing.T) {
	client := &http.Client{Timeout: 5 * time.Second}

	t.Run("PublicPortalRootReturns200", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/")
		if err != nil {
			t.Fatalf("failed to GET /: %v", err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200, got %d", resp.StatusCode)
		}
	})

	t.Run("AdminCMSReturns200", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/admin-cms")
		if err != nil {
			t.Fatalf("failed to GET /admin-cms: %v", err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200, got %d", resp.StatusCode)
		}
	})

	t.Run("OperationalMizanAbsensiReturns200", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/admin/absensi")
		if err != nil {
			t.Fatalf("failed to GET /admin/absensi: %v", err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200, got %d", resp.StatusCode)
		}
	})
}

func TestPublicAPIEndpoints(t *testing.T) {
	client := &http.Client{Timeout: 5 * time.Second}

	endpoints := []struct {
		name       string
		path       string
		expectCode int
	}{
		{"WebsiteSettings", "/api/v1/public/website-settings", http.StatusOK},
		{"HeroSection", "/api/v1/public/hero-section", http.StatusOK},
		{"VisiMisi", "/api/v1/public/visi-misi", http.StatusOK},
		{"Fasilitas", "/api/v1/public/fasilitas", http.StatusOK},
		{"TenagaPengajar", "/api/v1/public/tenaga-pengajar", http.StatusOK},
		{"Posts", "/api/v1/public/posts", http.StatusOK},
	}

	for _, tc := range endpoints {
		t.Run(tc.name, func(t *testing.T) {
			resp, err := client.Get(baseURL + tc.path)
			if err != nil {
				t.Fatalf("failed GET %s: %v", tc.path, err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tc.expectCode {
				t.Errorf("%s returned status %d, expected %d", tc.path, resp.StatusCode, tc.expectCode)
			}
			ct := resp.Header.Get("Content-Type")
			if !strings.Contains(ct, "application/json") {
				t.Errorf("%s Content-Type %s does not contain application/json", tc.path, ct)
			}
		})
	}
}

func TestAdminEndpointsSecurity(t *testing.T) {
	client := &http.Client{Timeout: 5 * time.Second}

	protectedPaths := []string{
		"/api/v1/admin/cms/website-settings",
		"/api/v1/admin/cms/fasilitas",
		"/api/v1/admin/blog/posts",
		"/api/v1/admin/psb/pendaftar",
	}

	for _, p := range protectedPaths {
		t.Run("UnauthorizedNoToken_"+p, func(t *testing.T) {
			resp, err := client.Get(baseURL + p)
			if err != nil {
				t.Fatalf("failed GET %s: %v", p, err)
			}
			defer resp.Body.Close()
			if resp.StatusCode != http.StatusUnauthorized {
				t.Errorf("%s expected 401 Unauthorized, got %d", p, resp.StatusCode)
			}
		})

		t.Run("UnauthorizedBadToken_"+p, func(t *testing.T) {
			req, err := http.NewRequest("GET", baseURL+p, nil)
			if err != nil {
				t.Fatalf("failed create request: %v", err)
			}
			req.Header.Set("Authorization", "Bearer invalidtoken")
			resp, err := client.Do(req)
			if err != nil {
				t.Fatalf("failed GET %s with token: %v", p, err)
			}
			defer resp.Body.Close()
			if resp.StatusCode != http.StatusUnauthorized {
				t.Errorf("%s with invalid token expected 401, got %d", p, resp.StatusCode)
			}
		})
	}
}

func TestSEOValidation(t *testing.T) {
	client := &http.Client{Timeout: 5 * time.Second}

	t.Run("RobotsTxtAccessibility", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/robots.txt")
		if err != nil {
			t.Fatalf("failed GET /robots.txt: %v", err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200, got %d", resp.StatusCode)
		}
		body, _ := io.ReadAll(resp.Body)
		if !strings.Contains(string(body), "User-agent:") {
			t.Errorf("robots.txt missing User-agent directive")
		}
	})

	t.Run("SitemapXmlAccessibility", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/sitemap.xml")
		if err != nil {
			t.Fatalf("failed GET /sitemap.xml: %v", err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected 200, got %d", resp.StatusCode)
		}
	})

	t.Run("IndexHTMLStructuredData", func(t *testing.T) {
		content, err := os.ReadFile("/opt/data/home/mizan.apps/gobackend/web_public/index.html")
		if err != nil {
			content, err = os.ReadFile("/opt/data/home/mizan.apps/portal/index.html")
			if err != nil {
				t.Fatalf("index.html not found: %v", err)
			}
		}

		s := string(content)
		if !strings.Contains(s, "<title>") {
			t.Errorf("missing <title> tag in index.html")
		}
		if !strings.Contains(s, "description") {
			t.Errorf("missing description meta tag in index.html")
		}
		if !strings.Contains(s, "og:title") {
			t.Errorf("missing og:title in index.html")
		}
		if !strings.Contains(s, "twitter:card") {
			t.Errorf("missing twitter:card in index.html")
		}
		if !strings.Contains(s, "application/ld+json") {
			t.Errorf("missing application/ld+json script in index.html")
		}
	})
}

func TestPSBRegistrationSubmission(t *testing.T) {
	client := &http.Client{Timeout: 5 * time.Second}

	payload := map[string]interface{}{
		"full_name":  "Santri Test Go Harness",
		"nisn":       "NISN" + time.Now().Format("150405"),
		"phone":      "081234567890",
		"email":      "test@example.com",
		"program_id": 1,
	}
	b, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", baseURL+"/api/v1/public/psb/daftar", strings.NewReader(string(b)))
	if err != nil {
		t.Fatalf("failed create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("failed POST /api/v1/public/psb/daftar: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		t.Errorf("expected 201 Created or 200 OK, got %d", resp.StatusCode)
	}
}

func TestAppDirectoryPreservation(t *testing.T) {
	cmd := exec.Command("git", "status", "--porcelain", "/opt/data/home/mizan.apps/app")
	out, err := cmd.Output()
	if err != nil {
		t.Fatalf("git status error: %v", err)
	}
	if len(strings.TrimSpace(string(out))) > 0 {
		t.Errorf("operational directory app/ has modifications: %s", string(out))
	}
}
