package handlers

import (
	"context"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/database"
	"gobackend/internal/middleware"
)

func resolveCMSTable(section string) string {
	switch strings.ToLower(strings.TrimSpace(section)) {
	case "website-settings", "websitesettings":
		return "core_websitesettings"
	case "hero-section", "hero-sections", "herosection", "herosections":
		return "core_herosection"
	case "visi-misi", "visimisi":
		return "core_visimisi"
	case "fasilitas", "facilities":
		return "core_fasilitas"
	case "tenaga-pengajar", "teachers", "tenagapengajar":
		return "core_tenagapengajar"
	case "programs", "program":
		return "core_program"
	case "education", "program-pendidikan", "programpendidikan":
		return "core_programpendidikan"
	case "history", "sejarah-timeline", "sejarahtimeline":
		return "core_sejarahtimeline"
	case "faq":
		return "core_faq"
	case "statistik", "statistics":
		return "core_statistik"
	case "founders":
		return "core_founders"
	case "whatsapp-templates", "whatsapptemplate", "whatsapptemplates":
		return "core_whatsapptemplate"
	case "testimonials", "blogtestimoni":
		return "blog_testimoni"
	case "announcements", "blogpengumuman":
		return "blog_pengumuman"
	case "struktur-organisasi", "strukturorganisasi":
		return "core_struktur_organisasi"
	case "form-config", "formconfig":
		return "core_form_config"
	case "document-templates", "documenttemplates":
		return "document_templates"
	case "document-settings", "documentsettings":
		return "document_settings"
	case "bankaccounts", "bank-accounts", "bankaccount":
		return "payments_bankaccount"
	case "ekstrakurikuler":
		return "core_ekstrakurikuler"
	case "jadwalharian", "jadwal-harian":
		return "core_jadwalharian"
	case "persyaratan":
		return "core_persyaratan"
	case "alurpendaftaran", "alur-pendaftaran":
		return "core_alurpendaftaran"
	case "registration-flow", "registrationflow":
		return "core_registration_flow"
	case "biayapendidikan", "biaya-pendidikan":
		return "core_biayapendidikan"
	case "kontak", "contacts":
		return "core_kontak"
	default:
		return ""
	}
}

func GetAdminCMSList(c *fiber.Ctx) error {
	section := c.Params("section")
	tableName := resolveCMSTable(section)
	if tableName == "" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Resource not found",
		})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := fmt.Sprintf("SELECT * FROM %s ORDER BY id ASC", tableName)
	rows, err := pool.Query(ctx, query)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal memuat data CMS",
		})
	}
	defer rows.Close()

	fields := rows.FieldDescriptions()
	list := make([]fiber.Map, 0)
	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			continue
		}
		item := make(fiber.Map)
		for i, field := range fields {
			colName := string(field.Name)
			val := values[i]
			if t, ok := val.(time.Time); ok {
				item[colName] = t.Format(time.RFC3339)
			} else if b, ok := val.([]byte); ok {
				item[colName] = string(b)
			} else {
				item[colName] = val
			}
		}
		list = append(list, item)
	}

	return c.JSON(fiber.Map{
		"data": list,
	})
}

func GetAdminCMSDetail(c *fiber.Ctx) error {
	section := c.Params("section")
	tableName := resolveCMSTable(section)
	if tableName == "" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Resource not found",
		})
	}

	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID tidak valid",
		})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := fmt.Sprintf("SELECT * FROM %s WHERE id = $1 LIMIT 1", tableName)
	rows, err := pool.Query(ctx, query, id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal membaca item CMS",
		})
	}
	defer rows.Close()

	fields := rows.FieldDescriptions()
	if !rows.Next() {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Item not found",
		})
	}

	values, err := rows.Values()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal mengurai nilai item",
		})
	}

	item := make(fiber.Map)
	for i, field := range fields {
		colName := string(field.Name)
		val := values[i]
		if t, ok := val.(time.Time); ok {
			item[colName] = t.Format(time.RFC3339)
		} else if b, ok := val.([]byte); ok {
			item[colName] = string(b)
		} else {
			item[colName] = val
		}
	}

	return c.JSON(fiber.Map{
		"data": item,
	})
}

func PostAdminCMSItem(c *fiber.Ctx) error {
	section := c.Params("section")
	tableName := resolveCMSTable(section)
	if tableName == "" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Resource not found",
		})
	}

	var body map[string]interface{}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format JSON tidak valid",
		})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	delete(body, "id")
	delete(body, "created_at")
	delete(body, "createdAt")
	delete(body, "updated_at")
	delete(body, "updatedAt")

	colRows, err := pool.Query(ctx, `
		SELECT column_name
		FROM information_schema.columns
		WHERE table_name = $1 AND table_schema = 'public'
	`, tableName)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal memeriksa skema tabel",
		})
	}
	defer colRows.Close()

	validCols := make(map[string]bool)
	for colRows.Next() {
		var col string
		if err := colRows.Scan(&col); err == nil {
			validCols[col] = true
		}
	}

	cols := make([]string, 0)
	placeholders := make([]string, 0)
	args := make([]interface{}, 0)
	idx := 1
	userColCount := 0

	for k, v := range body {
		colName := strings.ToLower(k)
		if validCols[colName] {
			cols = append(cols, `"`+colName+`"`)
			placeholders = append(placeholders, fmt.Sprintf("$%d", idx))
			args = append(args, v)
			idx++
			userColCount++
		}
	}

	if userColCount == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Payload tidak boleh kosong",
		})
	}

	if validCols["created_at"] {
		cols = append(cols, `"created_at"`)
		placeholders = append(placeholders, fmt.Sprintf("$%d", idx))
		args = append(args, time.Now())
		idx++
	}
	if validCols["updated_at"] {
		cols = append(cols, `"updated_at"`)
		placeholders = append(placeholders, fmt.Sprintf("$%d", idx))
		args = append(args, time.Now())
		idx++
	}

	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)", tableName, strings.Join(cols, ", "), strings.Join(placeholders, ", "))
	_, err = pool.Exec(ctx, query, args...)
	if err != nil {
		if strings.Contains(err.Error(), "22001") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Data input melebihi batas panjang karakter yang diperbolehkan",
				"details": "Data melebihi batas panjang karakter",
			})
		}
		if strings.Contains(err.Error(), "23505") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Data duplikat sudah terdaftar",
				"details": "Data duplikat sudah terdaftar",
			})
		}
		if strings.Contains(err.Error(), "22P02") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Format data tidak valid untuk tipe kolom",
				"details": "Format data tidak valid",
			})
		}
		if strings.Contains(err.Error(), "22007") || strings.Contains(err.Error(), "22008") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Format tanggal atau waktu tidak valid",
				"details": "Format tanggal tidak valid",
			})
		}
		if strings.Contains(err.Error(), "23502") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Field wajib tidak boleh kosong",
				"details": "Data yang dikirim tidak memenuhi syarat kolom wajib",
			})
		}
		if strings.Contains(err.Error(), "23503") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Referensi relasi tidak valid",
				"details": "Data referensi tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menambahkan item CMS",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Created",
		"success": true,
	})
}

func PutAdminCMSItem(c *fiber.Ctx) error {
	section := c.Params("section")
	tableName := resolveCMSTable(section)
	if tableName == "" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Resource not found",
		})
	}

	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID tidak valid",
		})
	}

	var body map[string]interface{}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format JSON tidak valid",
		})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	delete(body, "id")
	delete(body, "created_at")
	delete(body, "createdAt")
	delete(body, "updated_at")
	delete(body, "updatedAt")

	colRows, err := pool.Query(ctx, `
		SELECT column_name
		FROM information_schema.columns
		WHERE table_name = $1 AND table_schema = 'public'
	`, tableName)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal memeriksa skema tabel",
		})
	}
	defer colRows.Close()

	validCols := make(map[string]bool)
	for colRows.Next() {
		var col string
		if err := colRows.Scan(&col); err == nil {
			validCols[col] = true
		}
	}

	setClauses := make([]string, 0)
	args := make([]interface{}, 0)
	idx := 1
	userColCount := 0

	for k, v := range body {
		colName := strings.ToLower(k)
		if validCols[colName] {
			setClauses = append(setClauses, fmt.Sprintf(`"%s" = $%d`, colName, idx))
			args = append(args, v)
			idx++
			userColCount++
		}
	}

	if userColCount == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Tidak ada kolom valid yang diperbarui",
		})
	}

	if validCols["updated_at"] {
		setClauses = append(setClauses, fmt.Sprintf(`"updated_at" = $%d`, idx))
		args = append(args, time.Now())
		idx++
	}

	args = append(args, id)
	query := fmt.Sprintf("UPDATE %s SET %s WHERE id = $%d", tableName, strings.Join(setClauses, ", "), idx)
	res, err := pool.Exec(ctx, query, args...)
	if err != nil {
		if strings.Contains(err.Error(), "22001") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Data input melebihi batas panjang karakter yang diperbolehkan",
				"details": "Data melebihi batas panjang karakter",
			})
		}
		if strings.Contains(err.Error(), "23505") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Data duplikat sudah terdaftar",
				"details": "Data duplikat sudah terdaftar",
			})
		}
		if strings.Contains(err.Error(), "22P02") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Format data tidak valid untuk tipe kolom",
				"details": "Format data tidak valid",
			})
		}
		if strings.Contains(err.Error(), "22007") || strings.Contains(err.Error(), "22008") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Format tanggal atau waktu tidak valid",
				"details": "Format tanggal tidak valid",
			})
		}
		if strings.Contains(err.Error(), "23502") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Field wajib tidak boleh kosong",
				"details": "Data yang dikirim tidak memenuhi syarat kolom wajib",
			})
		}
		if strings.Contains(err.Error(), "23503") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Referensi relasi tidak valid",
				"details": "Data referensi tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal memperbarui item CMS",
		})
	}

	if res.RowsAffected() == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Item not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Updated",
		"success": true,
	})
}

func DeleteAdminCMSItem(c *fiber.Ctx) error {
	section := c.Params("section")
	tableName := resolveCMSTable(section)
	if tableName == "" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Resource not found",
		})
	}

	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID tidak valid",
		})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := fmt.Sprintf("DELETE FROM %s WHERE id = $1", tableName)
	_, err = pool.Exec(ctx, query, id)
	if err != nil {
		if strings.Contains(err.Error(), "23503") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Item tidak dapat dihapus karena masih digunakan",
				"details": "Referensi relasi masih aktif",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menghapus item CMS",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Deleted",
		"success": true,
	})
}

func PostAdminCMSBulkDelete(c *fiber.Ctx) error {
	section := c.Params("section")
	tableName := resolveCMSTable(section)
	if tableName == "" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Resource not found",
		})
	}

	var req struct {
		IDs []int64 `json:"ids"`
	}
	if err := c.BodyParser(&req); err != nil || len(req.IDs) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No IDs provided",
		})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := fmt.Sprintf("DELETE FROM %s WHERE id = ANY($1)", tableName)
	_, err := pool.Exec(ctx, query, req.IDs)
	if err != nil {
		if strings.Contains(err.Error(), "23503") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Beberapa item tidak dapat dihapus karena masih digunakan",
				"details": "Referensi relasi masih aktif",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menghapus beberapa item",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Bulk deleted successfully",
		"count":   len(req.IDs),
		"success": true,
	})
}

func GetAdminBlogPosts(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON(fiber.Map{
			"data": []fiber.Map{},
			"meta": fiber.Map{"page": 1, "limit": 10, "total": 0, "totalPages": 0},
		})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var total int
	_ = pool.QueryRow(ctx, `SELECT count(*) FROM blog_blogpost`).Scan(&total)

	rows, err := pool.Query(ctx, `
		SELECT 
			b.id, b.title, b.slug, b.content, b.excerpt, COALESCE(b.featured_image, ''),
			b.views_count, b.likes_count, b.shares_count, b.status, b.is_featured,
			b.published_at, b.created_at, b.updated_at,
			COALESCE(u.id, 0), COALESCE(u.username, ''), COALESCE(u.first_name, ''), COALESCE(u.last_name, ''),
			COALESCE(c.id, 0), COALESCE(c.name, ''), COALESCE(c.slug, '')
		FROM blog_blogpost b
		LEFT JOIN users_user u ON b.author_id = u.id
		LEFT JOIN blog_category c ON b.category_id = c.id
		ORDER BY b.created_at DESC
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		return c.JSON(fiber.Map{
			"data": []fiber.Map{},
			"meta": fiber.Map{"page": page, "limit": limit, "total": total, "totalPages": 0},
		})
	}
	defer rows.Close()

	posts := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var title, slug, content, excerpt, featuredImage, status string
		var viewsCount, likesCount, sharesCount int
		var isFeatured bool
		var publishedAt, createdAt, updatedAt *time.Time
		var authorID int64
		var authorUsername, authorFirst, authorLast string
		var catID int64
		var catName, catSlug string

		if err := rows.Scan(
			&id, &title, &slug, &content, &excerpt, &featuredImage,
			&viewsCount, &likesCount, &sharesCount, &status, &isFeatured,
			&publishedAt, &createdAt, &updatedAt,
			&authorID, &authorUsername, &authorFirst, &authorLast,
			&catID, &catName, &catSlug,
		); err == nil {
			posts = append(posts, fiber.Map{
				"id":             id,
				"title":          title,
				"slug":           slug,
				"content":        content,
				"excerpt":        excerpt,
				"featured_image": featuredImage,
				"featuredImage":  featuredImage,
				"views_count":    viewsCount,
				"viewsCount":     viewsCount,
				"status":         status,
				"is_featured":    isFeatured,
				"published_at":   publishedAt,
				"created_at":     createdAt,
				"updated_at":     updatedAt,
				"author": fiber.Map{
					"id":        authorID,
					"username":  authorUsername,
					"firstName": authorFirst,
					"lastName":  authorLast,
				},
				"category": fiber.Map{
					"id":   catID,
					"name": catName,
					"slug": catSlug,
				},
			})
		}
	}

	totalPages := 0
	if limit > 0 {
		totalPages = int(math.Ceil(float64(total) / float64(limit)))
	}

	return c.JSON(fiber.Map{
		"data": posts,
		"meta": fiber.Map{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": totalPages,
		},
	})
}

func PostAdminBlogPost(c *fiber.Ctx) error {
	var body struct {
		Title         string  `json:"title"`
		Slug          string  `json:"slug"`
		Content       string  `json:"content"`
		Excerpt       string  `json:"excerpt"`
		FeaturedImage string  `json:"featured_image"`
		Status        string  `json:"status"`
		CategoryID    *int64  `json:"category_id"`
		IsFeatured    bool    `json:"is_featured"`
		Tags          []int64 `json:"tags"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format JSON tidak valid",
		})
	}

	if strings.TrimSpace(body.Title) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Judul artikel wajib diisi",
		})
	}

	slug := strings.TrimSpace(body.Slug)
	if slug == "" {
		slug = strings.ToLower(strings.ReplaceAll(body.Title, " ", "-"))
	}

	status := body.Status
	if status == "" {
		status = "published"
	}

	if utf8.RuneCountInString(body.Title) > 200 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Judul artikel tidak boleh lebih dari 200 karakter",
		})
	}
	if utf8.RuneCountInString(slug) > 200 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Slug artikel tidak boleh lebih dari 200 karakter",
		})
	}
	if len(status) > 20 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Status artikel tidak boleh lebih dari 20 karakter",
		})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if body.CategoryID != nil {
		if *body.CategoryID <= 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Kategori tidak ditemukan",
				"details": "Referensi kategori tidak valid",
			})
		}
		var catExists bool
		err := pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM blog_category WHERE id = $1)", *body.CategoryID).Scan(&catExists)
		if err != nil || !catExists {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Kategori tidak ditemukan",
				"details": "Referensi kategori tidak ditemukan",
			})
		}
	}

	authorID := int64(1)
	if adminUser, ok := c.Locals("admin_user").(*middleware.AdminClaims); ok && adminUser != nil {
		authorID = adminUser.ID
	}

	var newID int64
	var createdAt time.Time
	err := pool.QueryRow(ctx, `
		INSERT INTO blog_blogpost (
			title, slug, content, excerpt, featured_image,
			meta_title, meta_description, meta_keywords,
			status, is_featured, published_at, created_at, updated_at,
			author_id, category_id
		) VALUES (
			$1, $2, $3, $4, $5,
			$1, $4, '',
			$6, $7, NOW(), NOW(), NOW(),
			$8, $9
		)
		RETURNING id, created_at
	`, body.Title, slug, body.Content, body.Excerpt, body.FeaturedImage, status, body.IsFeatured, authorID, body.CategoryID).Scan(&newID, &createdAt)

	if err != nil {
		if strings.Contains(err.Error(), "22001") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Data artikel melebihi batas panjang karakter",
				"details": "Data melebihi batas panjang karakter",
			})
		}
		if strings.Contains(err.Error(), "23505") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Slug artikel sudah digunakan",
				"details": "Slug artikel sudah digunakan",
			})
		}
		if strings.Contains(err.Error(), "23502") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Field wajib tidak boleh kosong",
				"details": "Data yang dikirim tidak memenuhi syarat kolom wajib",
			})
		}
		if strings.Contains(err.Error(), "23503") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Referensi kategori tidak valid",
				"details": "Kategori referensi tidak ditemukan",
			})
		}
		if strings.Contains(err.Error(), "22P02") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Format data tidak valid untuk tipe kolom",
				"details": "Format data tidak valid",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menyimpan artikel blog",
		})
	}

	for _, tagID := range body.Tags {
		_, _ = pool.Exec(ctx, `INSERT INTO blog_blogpost_tags (blogpost_id, tag_id) VALUES ($1, $2)`, newID, tagID)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Created",
		"data": fiber.Map{
			"id":         newID,
			"title":      body.Title,
			"slug":       slug,
			"created_at": createdAt.Format(time.RFC3339),
		},
	})
}

func PutAdminBlogPost(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID tidak valid",
		})
	}

	var body map[string]interface{}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format JSON tidak valid",
		})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	delete(body, "id")
	delete(body, "created_at")
	delete(body, "createdAt")
	delete(body, "updated_at")
	delete(body, "updatedAt")

	colRows, err := pool.Query(ctx, `
		SELECT column_name
		FROM information_schema.columns
		WHERE table_name = 'blog_blogpost' AND table_schema = 'public'
	`)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal memeriksa skema tabel",
		})
	}
	defer colRows.Close()

	validCols := make(map[string]bool)
	for colRows.Next() {
		var col string
		if err := colRows.Scan(&col); err == nil {
			validCols[col] = true
		}
	}

	setClauses := make([]string, 0)
	args := make([]interface{}, 0)
	idx := 1
	userColCount := 0

	for k, v := range body {
		if k == "tags" {
			continue
		}
		colName := strings.ToLower(k)
		if colName == "featuredimage" {
			colName = "featured_image"
		} else if colName == "isfeatured" {
			colName = "is_featured"
		} else if colName == "categoryid" {
			colName = "category_id"
		}
		if !validCols[colName] {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Kolom tidak valid",
				"details": "Permintaan berisi kolom yang tidak terdaftar pada skema",
			})
		}
		if colName == "category_id" && v != nil {
			var catID int64
			switch cv := v.(type) {
			case float64:
				catID = int64(cv)
			case int64:
				catID = cv
			case int:
				catID = int64(cv)
			case string:
				catID, _ = strconv.ParseInt(cv, 10, 64)
			}
			if catID <= 0 {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error":   "Kategori tidak ditemukan",
					"details": "Referensi kategori tidak valid",
				})
			}
			var catExists bool
			err := pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM blog_category WHERE id = $1)", catID).Scan(&catExists)
			if err != nil || !catExists {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error":   "Kategori tidak ditemukan",
					"details": "Referensi kategori tidak ditemukan",
				})
			}
		}
		setClauses = append(setClauses, fmt.Sprintf(`"%s" = $%d`, colName, idx))
		args = append(args, v)
		idx++
		userColCount++
	}

	if userColCount == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Tidak ada kolom valid yang diperbarui",
		})
	}

	if validCols["updated_at"] {
		setClauses = append(setClauses, fmt.Sprintf(`"updated_at" = $%d`, idx))
		args = append(args, time.Now())
		idx++
	}

	args = append(args, id)
	query := fmt.Sprintf("UPDATE blog_blogpost SET %s WHERE id = $%d", strings.Join(setClauses, ", "), idx)
	res, err := pool.Exec(ctx, query, args...)
	if err != nil {
		if strings.Contains(err.Error(), "22001") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Data artikel melebihi batas panjang karakter",
				"details": "Data melebihi batas panjang karakter",
			})
		}
		if strings.Contains(err.Error(), "23505") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Slug artikel sudah digunakan",
				"details": "Slug artikel sudah digunakan",
			})
		}
		if strings.Contains(err.Error(), "23502") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Field wajib tidak boleh kosong",
				"details": "Data yang dikirim tidak memenuhi syarat kolom wajib",
			})
		}
		if strings.Contains(err.Error(), "23503") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Referensi kategori tidak valid",
				"details": "Kategori referensi tidak ditemukan",
			})
		}
		if strings.Contains(err.Error(), "42703") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Kolom tidak valid",
				"details": "Permintaan berisi kolom yang tidak terdaftar pada skema",
			})
		}
		if strings.Contains(err.Error(), "42601") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Format kueri kolom tidak valid",
				"details": "Karakter tidak valid dalam nama kolom",
			})
		}
		if strings.Contains(err.Error(), "22P02") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Format data tidak valid untuk tipe kolom",
				"details": "Format data tidak valid",
			})
		}
		if strings.Contains(err.Error(), "22007") || strings.Contains(err.Error(), "22008") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Format tanggal atau waktu tidak valid",
				"details": "Format tanggal tidak valid",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal memperbarui artikel",
		})
	}

	if res.RowsAffected() == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Post not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Updated",
		"success": true,
	})
}

func DeleteAdminBlogPost(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID tidak valid",
		})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, _ = pool.Exec(ctx, `DELETE FROM blog_blogpost_tags WHERE blogpost_id = $1`, id)
	res, err := pool.Exec(ctx, `DELETE FROM blog_blogpost WHERE id = $1`, id)
	if err != nil {
		if strings.Contains(err.Error(), "23503") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Artikel tidak dapat dihapus karena masih digunakan",
				"details": "Referensi relasi masih aktif",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menghapus artikel",
		})
	}

	if res.RowsAffected() == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Post not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Post deleted successfully",
		"success": true,
	})
}

func GetAdminPSBPendaftar(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON(fiber.Map{
			"data": []fiber.Map{},
			"meta": fiber.Map{"page": 1, "limit": 12, "total": 0, "totalPages": 0},
		})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.Query("limit", "12"))
	if limit < 1 || limit > 100 {
		limit = 12
	}
	offset := (page - 1) * limit

	status := c.Query("status")
	gender := c.Query("jenisKelamin")
	if gender == "" {
		gender = c.Query("gender")
	}
	search := c.Query("search")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	conditions := []string{"1=1"}
	args := []interface{}{}
	idx := 1

	if status != "" {
		conditions = append(conditions, fmt.Sprintf("status = $%d", idx))
		args = append(args, status)
		idx++
	}
	if gender != "" {
		conditions = append(conditions, fmt.Sprintf("jenis_kelamin = $%d", idx))
		args = append(args, gender)
		idx++
	}
	if search != "" {
		conditions = append(conditions, fmt.Sprintf("(nama_lengkap ILIKE $%d OR nisn ILIKE $%d)", idx, idx))
		args = append(args, "%"+search+"%")
		idx++
	}

	whereClause := strings.Join(conditions, " AND ")

	var total int
	countQuery := fmt.Sprintf("SELECT count(*) FROM admissions_santri WHERE %s", whereClause)
	_ = pool.QueryRow(ctx, countQuery, args...).Scan(&total)

	selectQuery := fmt.Sprintf(`
		SELECT id, nama_lengkap, nisn, tempat_lahir, tanggal_lahir, jenis_kelamin,
		       COALESCE(no_hp, ''), COALESCE(email, ''), COALESCE(alamat, ''), COALESCE(asal_sekolah, ''),
		       status, created_at, updated_at
		FROM admissions_santri
		WHERE %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, idx, idx+1)

	args = append(args, limit, offset)
	rows, err := pool.Query(ctx, selectQuery, args...)
	if err != nil {
		return c.JSON(fiber.Map{
			"data": []fiber.Map{},
			"meta": fiber.Map{"page": page, "limit": limit, "total": total, "totalPages": 0},
		})
	}
	defer rows.Close()

	santriList := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var namaLengkap, nisn, tempatLahir, jenisKelamin, noHp, email, alamat, asalSekolah, santriStatus string
		var tanggalLahir, createdAt, updatedAt time.Time

		if err := rows.Scan(
			&id, &namaLengkap, &nisn, &tempatLahir, &tanggalLahir, &jenisKelamin,
			&noHp, &email, &alamat, &asalSekolah, &santriStatus, &createdAt, &updatedAt,
		); err == nil {
			santriList = append(santriList, fiber.Map{
				"id":            id,
				"nama_lengkap":  namaLengkap,
				"namaLengkap":   namaLengkap,
				"nisn":          nisn,
				"tempat_lahir":  tempatLahir,
				"tanggal_lahir": tanggalLahir.Format("2006-01-02"),
				"jenis_kelamin": jenisKelamin,
				"jenisKelamin":  jenisKelamin,
				"no_hp":         noHp,
				"email":         email,
				"alamat":        alamat,
				"asal_sekolah":  asalSekolah,
				"status":        santriStatus,
				"created_at":    createdAt.Format(time.RFC3339),
				"updated_at":    updatedAt.Format(time.RFC3339),
			})
		}
	}

	totalPages := 0
	if limit > 0 {
		totalPages = int(math.Ceil(float64(total) / float64(limit)))
	}

	return c.JSON(fiber.Map{
		"data": santriList,
		"meta": fiber.Map{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": totalPages,
		},
	})
}

func GetAdminPSBPendaftarDetail(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID tidak valid",
		})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT * FROM admissions_santri WHERE id = $1 LIMIT 1`, id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal membaca data pendaftar",
		})
	}
	defer rows.Close()

	if !rows.Next() {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Santri not found",
		})
	}

	fields := rows.FieldDescriptions()
	values, err := rows.Values()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal membaca kolom pendaftar",
		})
	}

	item := make(fiber.Map)
	for i, field := range fields {
		colName := string(field.Name)
		val := values[i]
		if t, ok := val.(time.Time); ok {
			item[colName] = t.Format(time.RFC3339)
		} else if b, ok := val.([]byte); ok {
			item[colName] = string(b)
		} else {
			item[colName] = val
		}
	}

	return c.JSON(item)
}

func PutAdminPSBPendaftar(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID tidak valid",
		})
	}

	var body map[string]interface{}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format JSON tidak valid",
		})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	delete(body, "id")
	delete(body, "created_at")
	delete(body, "createdAt")

	colRows, err := pool.Query(ctx, `
		SELECT column_name
		FROM information_schema.columns
		WHERE table_name = 'admissions_santri' AND table_schema = 'public'
	`)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal memeriksa skema tabel",
		})
	}
	defer colRows.Close()

	validCols := make(map[string]bool)
	for colRows.Next() {
		var col string
		if err := colRows.Scan(&col); err == nil {
			validCols[col] = true
		}
	}

	setClauses := make([]string, 0)
	args := make([]interface{}, 0)
	idx := 1

	for k, v := range body {
		colName := strings.ToLower(k)
		if colName == "namalengkap" {
			colName = "nama_lengkap"
		} else if colName == "jeniskelamin" {
			colName = "jenis_kelamin"
		} else if colName == "nohp" {
			colName = "no_hp"
		} else if colName == "asalsekolah" {
			colName = "asal_sekolah"
		}
		if validCols[colName] {
			setClauses = append(setClauses, fmt.Sprintf(`"%s" = $%d`, colName, idx))
			args = append(args, v)
			idx++
		}
	}

	setClauses = append(setClauses, fmt.Sprintf(`"updated_at" = $%d`, idx))
	args = append(args, time.Now())
	idx++

	if len(setClauses) <= 1 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Tidak ada kolom valid yang diperbarui",
		})
	}

	args = append(args, id)
	query := fmt.Sprintf("UPDATE admissions_santri SET %s WHERE id = $%d", strings.Join(setClauses, ", "), idx)
	res, err := pool.Exec(ctx, query, args...)
	if err != nil {
		if strings.Contains(err.Error(), "22001") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Data santri melebihi batas panjang karakter",
				"details": "Data melebihi batas panjang karakter",
			})
		}
		if strings.Contains(err.Error(), "23505") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "NISN sudah terdaftar",
				"details": "NISN sudah terdaftar",
			})
		}
		if strings.Contains(err.Error(), "22P02") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Format data tidak valid untuk tipe kolom",
				"details": "Format data tidak valid",
			})
		}
		if strings.Contains(err.Error(), "22007") || strings.Contains(err.Error(), "22008") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Format tanggal atau waktu tidak valid",
				"details": "Format tanggal tidak valid",
			})
		}
		if strings.Contains(err.Error(), "23502") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Field wajib tidak boleh kosong",
				"details": "Data yang dikirim tidak memenuhi syarat kolom wajib",
			})
		}
		if strings.Contains(err.Error(), "23503") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Referensi relasi tidak valid",
				"details": "Data referensi tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal memperbarui status santri",
		})
	}

	if res.RowsAffected() == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Santri not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Updated",
		"success": true,
	})
}

func PostAdminPSBApplicantBulkAction(c *fiber.Ctx) error {
	var req struct {
		Action string  `json:"action"`
		IDs    []int64 `json:"ids"`
	}
	if err := c.BodyParser(&req); err != nil || len(req.IDs) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No IDs provided",
		})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if req.Action == "delete" {
		_, err := pool.Exec(ctx, `DELETE FROM admissions_santri WHERE id = ANY($1)`, req.IDs)
		if err != nil {
			if strings.Contains(err.Error(), "23503") {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error":   "Beberapa santri tidak dapat dihapus karena masih digunakan",
					"details": "Referensi relasi masih aktif",
				})
			}
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menghapus santri"})
		}
		return c.JSON(fiber.Map{"message": "Deleted santri", "success": true})
	}

	newStatus := "pending"
	if req.Action == "accept" {
		newStatus = "accepted"
	} else if req.Action == "reject" {
		newStatus = "rejected"
	}

	_, err := pool.Exec(ctx, `UPDATE admissions_santri SET status = $1, updated_at = NOW() WHERE id = ANY($2)`, newStatus, req.IDs)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal memperbarui status santri"})
	}

	return c.JSON(fiber.Map{
		"message": "Bulk action completed",
		"action":  req.Action,
		"count":   len(req.IDs),
		"success": true,
	})
}
