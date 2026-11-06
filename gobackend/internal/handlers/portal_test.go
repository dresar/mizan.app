package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestPostPublicPSBDaftarValidation(t *testing.T) {
	app := fiber.New()
	app.Post("/api/v1/public/psb/daftar", PostPublicPSBDaftar)

	reqEmpty := httptest.NewRequest("POST", "/api/v1/public/psb/daftar", bytes.NewBuffer([]byte("{}")))
	reqEmpty.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(reqEmpty)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	reqMalformed := httptest.NewRequest("POST", "/api/v1/public/psb/daftar", bytes.NewBuffer([]byte("{invalid-json")))
	reqMalformed.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(reqMalformed)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	reqEmptyBody := httptest.NewRequest("POST", "/api/v1/public/psb/daftar", nil)
	resp, err = app.Test(reqEmptyBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestResolveCMSTable(t *testing.T) {
	assert.Equal(t, "core_websitesettings", resolveCMSTable("website-settings"))
	assert.Equal(t, "core_websitesettings", resolveCMSTable("websiteSettings"))
	assert.Equal(t, "core_herosection", resolveCMSTable("hero-section"))
	assert.Equal(t, "core_visimisi", resolveCMSTable("visi-misi"))
	assert.Equal(t, "core_fasilitas", resolveCMSTable("fasilitas"))
	assert.Equal(t, "core_tenagapengajar", resolveCMSTable("tenaga-pengajar"))
	assert.Equal(t, "core_program", resolveCMSTable("programs"))
	assert.Equal(t, "core_faq", resolveCMSTable("faq"))
	assert.Equal(t, "core_statistik", resolveCMSTable("statistik"))
	assert.Equal(t, "blog_testimoni", resolveCMSTable("testimonials"))
	assert.Equal(t, "blog_pengumuman", resolveCMSTable("announcements"))
	assert.Equal(t, "", resolveCMSTable("invalid_unknown_resource"))
}

func TestPostPublicPSBDaftarOversizedInputs(t *testing.T) {
	app := fiber.New()
	app.Post("/api/v1/public/psb/daftar", PostPublicPSBDaftar)

	payloadOversizedName := map[string]string{
		"nama_lengkap": strings.Repeat("A", 201),
		"nisn":         "1234567890",
	}
	body, _ := json.Marshal(payloadOversizedName)
	req := httptest.NewRequest("POST", "/api/v1/public/psb/daftar", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	payloadOversizedNISN := map[string]string{
		"nama_lengkap": "Ahmad Valid",
		"nisn":         strings.Repeat("1", 21),
	}
	body, _ = json.Marshal(payloadOversizedNISN)
	req = httptest.NewRequest("POST", "/api/v1/public/psb/daftar", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	payloadOversizedTempat := map[string]string{
		"nama_lengkap": "Ahmad Valid",
		"nisn":         "1234567890",
		"tempat_lahir": strings.Repeat("B", 101),
	}
	body, _ = json.Marshal(payloadOversizedTempat)
	req = httptest.NewRequest("POST", "/api/v1/public/psb/daftar", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	payloadOversizedPhone := map[string]string{
		"nama_lengkap": "Ahmad Valid",
		"nisn":         "1234567890",
		"no_hp":        strings.Repeat("0", 21),
	}
	body, _ = json.Marshal(payloadOversizedPhone)
	req = httptest.NewRequest("POST", "/api/v1/public/psb/daftar", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	payloadOversizedEmail := map[string]string{
		"nama_lengkap": "Ahmad Valid",
		"nisn":         "1234567890",
		"email":        strings.Repeat("e", 255),
	}
	body, _ = json.Marshal(payloadOversizedEmail)
	req = httptest.NewRequest("POST", "/api/v1/public/psb/daftar", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	payloadOversizedSekolah := map[string]string{
		"nama_lengkap": "Ahmad Valid",
		"nisn":         "1234567890",
		"asal_sekolah": strings.Repeat("S", 201),
	}
	body, _ = json.Marshal(payloadOversizedSekolah)
	req = httptest.NewRequest("POST", "/api/v1/public/psb/daftar", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	payloadOversizedAlamat := map[string]string{
		"nama_lengkap": "Ahmad Valid",
		"nisn":         "1234567890",
		"alamat":       strings.Repeat("X", 2001),
	}
	body, _ = json.Marshal(payloadOversizedAlamat)
	req = httptest.NewRequest("POST", "/api/v1/public/psb/daftar", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestPostPublicContactValidation(t *testing.T) {
	app := fiber.New()
	app.Post("/api/core/contact", PostPublicContact)

	payloadEmpty := map[string]string{}
	body, _ := json.Marshal(payloadEmpty)
	req := httptest.NewRequest("POST", "/api/core/contact", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	payloadOversizedNama := map[string]string{
		"nama":  strings.Repeat("N", 201),
		"email": "test@example.com",
		"pesan": "pesan",
	}
	body, _ = json.Marshal(payloadOversizedNama)
	req = httptest.NewRequest("POST", "/api/core/contact", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	payloadOversizedEmail := map[string]string{
		"nama":  "Nama",
		"email": strings.Repeat("e", 255),
		"pesan": "pesan",
	}
	body, _ = json.Marshal(payloadOversizedEmail)
	req = httptest.NewRequest("POST", "/api/core/contact", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	payloadOversizedPhone := map[string]string{
		"nama":  "Nama",
		"email": "test@example.com",
		"no_hp": strings.Repeat("0", 21),
		"pesan": "pesan",
	}
	body, _ = json.Marshal(payloadOversizedPhone)
	req = httptest.NewRequest("POST", "/api/core/contact", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	payloadOversizedSubjek := map[string]string{
		"nama":   "Nama",
		"email":  "test@example.com",
		"subjek": strings.Repeat("S", 201),
		"pesan":  "pesan",
	}
	body, _ = json.Marshal(payloadOversizedSubjek)
	req = httptest.NewRequest("POST", "/api/core/contact", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	payloadOversizedPesan := map[string]string{
		"nama":  "Nama",
		"email": "test@example.com",
		"pesan": strings.Repeat("P", 5001),
	}
	body, _ = json.Marshal(payloadOversizedPesan)
	req = httptest.NewRequest("POST", "/api/core/contact", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestPostAdminBlogPostValidation(t *testing.T) {
	app := fiber.New()
	app.Post("/api/v1/admin/blog/posts", PostAdminBlogPost)

	reqEmpty := httptest.NewRequest("POST", "/api/v1/admin/blog/posts", bytes.NewBuffer([]byte("{}")))
	reqEmpty.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(reqEmpty)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	reqMalformed := httptest.NewRequest("POST", "/api/v1/admin/blog/posts", bytes.NewBuffer([]byte("{invalid-json")))
	reqMalformed.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(reqMalformed)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	payloadOversizedTitle := map[string]string{
		"title": strings.Repeat("A", 201),
	}
	body, _ := json.Marshal(payloadOversizedTitle)
	req := httptest.NewRequest("POST", "/api/v1/admin/blog/posts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestPutAdminBlogPostValidation(t *testing.T) {
	app := fiber.New()
	app.Put("/api/v1/admin/blog/posts/:id", PutAdminBlogPost)

	reqInvalidID := httptest.NewRequest("PUT", "/api/v1/admin/blog/posts/invalid", bytes.NewBuffer([]byte("{}")))
	reqInvalidID.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(reqInvalidID)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

	reqMalformed := httptest.NewRequest("PUT", "/api/v1/admin/blog/posts/1", bytes.NewBuffer([]byte("{invalid-json")))
	reqMalformed.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(reqMalformed)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

func TestCMSItemValidation(t *testing.T) {
	app := fiber.New()
	app.Post("/api/v1/admin/cms/:section", PostAdminCMSItem)
	app.Put("/api/v1/admin/cms/:section/:id", PutAdminCMSItem)

	reqInvalidSection := httptest.NewRequest("POST", "/api/v1/admin/cms/unknown-section", bytes.NewBuffer([]byte("{}")))
	reqInvalidSection.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(reqInvalidSection)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)

	reqPutInvalidID := httptest.NewRequest("PUT", "/api/v1/admin/cms/faq/abc", bytes.NewBuffer([]byte("{}")))
	reqPutInvalidID.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(reqPutInvalidID)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}
