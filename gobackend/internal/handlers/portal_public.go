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
)

type PSBDaftarRequest struct {
	FullName     string `json:"full_name"`
	NamaLengkap  string `json:"nama_lengkap"`
	NISN         string `json:"nisn"`
	Gender       string `json:"gender"`
	JenisKelamin string `json:"jenis_kelamin"`
	Phone        string `json:"phone"`
	NoHP         string `json:"no_hp"`
	Email        string `json:"email"`
	Address      string `json:"address"`
	Alamat       string `json:"alamat"`
	ProgramID    int    `json:"program_id"`
	TempatLahir  string `json:"tempat_lahir"`
	TanggalLahir string `json:"tanggal_lahir"`
	AsalSekolah  string `json:"asal_sekolah"`
}

func GetPublicWebsiteSettings(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var id int64
	var namaPondok, arabicName, alamat, logo, noTelepon, email, website string
	var facebook, instagram, twitter, tiktok, heroTitle, heroSubtitle, heroTagline string
	var heroCtaPrimaryText, heroCtaPrimaryLink, heroCtaSecondaryText, heroCtaSecondaryLink string
	var ctaTitle, ctaDescription, ctaPrimaryText, ctaPrimaryLink, ctaSecondaryText, ctaSecondaryLink string
	var announcementText, announcementLink, lokasiPendaftaran, googleMapsLink, googleMapsEmbedCode string
	var deskripsi, metaTitle, metaDescription, metaKeywords, profilSingkat, profilLengkap string
	var announcementActive, maintenanceMode bool
	var updatedAt time.Time
	var headerMobileHeight int

	err := pool.QueryRow(ctx, `
		SELECT 
			id, nama_pondok, arabic_name, alamat, COALESCE(logo, ''), no_telepon, email, website,
			facebook, instagram, twitter, tiktok, hero_title, hero_subtitle, hero_tagline,
			hero_cta_primary_text, hero_cta_primary_link, hero_cta_secondary_text, hero_cta_secondary_link,
			cta_title, cta_description, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link,
			COALESCE(announcement_text, ''), COALESCE(announcement_link, ''), announcement_active,
			lokasi_pendaftaran, google_maps_link, google_maps_embed_code,
			deskripsi, meta_title, meta_description, meta_keywords,
			updated_at, header_mobile_height, maintenance_mode,
			COALESCE(profil_singkat, ''), COALESCE(profil_lengkap, '')
		FROM core_websitesettings
		LIMIT 1
	`).Scan(
		&id, &namaPondok, &arabicName, &alamat, &logo, &noTelepon, &email, &website,
		&facebook, &instagram, &twitter, &tiktok, &heroTitle, &heroSubtitle, &heroTagline,
		&heroCtaPrimaryText, &heroCtaPrimaryLink, &heroCtaSecondaryText, &heroCtaSecondaryLink,
		&ctaTitle, &ctaDescription, &ctaPrimaryText, &ctaPrimaryLink, &ctaSecondaryText, &ctaSecondaryLink,
		&announcementText, &announcementLink, &announcementActive,
		&lokasiPendaftaran, &googleMapsLink, &googleMapsEmbedCode,
		&deskripsi, &metaTitle, &metaDescription, &metaKeywords,
		&updatedAt, &headerMobileHeight, &maintenanceMode,
		&profilSingkat, &profilLengkap,
	)

	if err != nil {
		return c.JSON(fiber.Map{
			"id":                      1,
			"name":                    "Pondok Pesantren Mizan",
			"nama_pondok":             "Pondok Pesantren Mizan",
			"namaPondok":              "Pondok Pesantren Mizan",
			"email":                   "admin@pesantren.com",
			"phone":                   "081234567890",
			"no_telepon":              "081234567890",
			"noTelepon":               "081234567890",
			"heroTitle":               "Selamat Datang di Pondok Pesantren Mizan",
			"hero_title":              "Selamat Datang di Pondok Pesantren Mizan",
			"heroSubtitle":            "Mencetak Generasi Qurani Berkarakter",
			"hero_subtitle":           "Mencetak Generasi Qurani Berkarakter",
			"heroTagline":             "Berilmu, Beramal, Bertaqwa",
			"hero_tagline":            "Berilmu, Beramal, Bertaqwa",
			"announcementText":        "",
			"announcementActive":      false,
			"maintenanceMode":         false,
			"updated_at":              time.Now().Format(time.RFC3339),
		})
	}

	return c.JSON(fiber.Map{
		"id":                      id,
		"name":                    namaPondok,
		"nama_pondok":             namaPondok,
		"namaPondok":              namaPondok,
		"arabic_name":             arabicName,
		"arabicName":              arabicName,
		"alamat":                  alamat,
		"address":                 alamat,
		"logo":                    logo,
		"phone":                   noTelepon,
		"no_telepon":              noTelepon,
		"noTelepon":               noTelepon,
		"email":                   email,
		"website":                 website,
		"facebook":                facebook,
		"instagram":               instagram,
		"twitter":                 twitter,
		"tiktok":                  tiktok,
		"hero_title":              heroTitle,
		"heroTitle":               heroTitle,
		"hero_subtitle":           heroSubtitle,
		"heroSubtitle":            heroSubtitle,
		"hero_tagline":            heroTagline,
		"heroTagline":             heroTagline,
		"hero_cta_primary_text":   heroCtaPrimaryText,
		"hero_cta_primary_link":   heroCtaPrimaryLink,
		"hero_cta_secondary_text": heroCtaSecondaryText,
		"hero_cta_secondary_link": heroCtaSecondaryLink,
		"cta_title":               ctaTitle,
		"cta_description":         ctaDescription,
		"cta_primary_text":        ctaPrimaryText,
		"cta_primary_link":        ctaPrimaryLink,
		"cta_secondary_text":      ctaSecondaryText,
		"cta_secondary_link":      ctaSecondaryLink,
		"announcement_text":       announcementText,
		"announcement_link":       announcementLink,
		"announcement_active":     announcementActive,
		"announcementText":        announcementText,
		"announcementActive":      announcementActive,
		"lokasi_pendaftaran":      lokasiPendaftaran,
		"google_maps_link":        googleMapsLink,
		"google_maps_embed_code":  googleMapsEmbedCode,
		"deskripsi":               deskripsi,
		"description":             deskripsi,
		"meta_title":              metaTitle,
		"meta_description":        metaDescription,
		"meta_keywords":           metaKeywords,
		"updated_at":              updatedAt.Format(time.RFC3339),
		"updatedAt":               updatedAt.Format(time.RFC3339),
		"header_mobile_height":    headerMobileHeight,
		"maintenance_mode":        maintenanceMode,
		"profil_singkat":          profilSingkat,
		"profil_lengkap":          profilLengkap,
	})
}

func GetPublicHeroSection(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `
		SELECT id, title, subtitle, COALESCE(image, ''), "order", is_active, created_at
		FROM core_herosection
		WHERE is_active = true
		ORDER BY "order" ASC, id ASC
	`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var title, subtitle, image string
		var order int
		var isActive bool
		var createdAt time.Time

		if err := rows.Scan(&id, &title, &subtitle, &image, &order, &isActive, &createdAt); err == nil {
			items = append(items, fiber.Map{
				"id":         id,
				"title":      title,
				"subtitle":   subtitle,
				"image":      image,
				"order":      order,
				"is_active":  isActive,
				"isActive":   isActive,
				"created_at": createdAt.Format(time.RFC3339),
			})
		}
	}

	return c.JSON(items)
}

func GetPublicVisiMisi(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var id int64
	var visi, misi string
	var updatedAt time.Time

	err := pool.QueryRow(ctx, `
		SELECT id, visi, misi, updated_at
		FROM core_visimisi
		LIMIT 1
	`).Scan(&id, &visi, &misi, &updatedAt)

	if err != nil {
		return c.JSON(fiber.Map{
			"id":         1,
			"visi":       "Menjadi pusat keunggulan pendidikan Islam yang menghasilkan generasi bertauhid kokoh, berwawasan luas, dan berakhlak mulia.",
			"misi":       "1. Menyelenggarakan pendidikan tahfidz Al-Quran berstandar mutqin.\n2. Mengintegrasikan kurikulum kepesantrenan dan kurikulum nasional.",
			"updated_at": time.Now().Format(time.RFC3339),
			"updatedAt":  time.Now().Format(time.RFC3339),
		})
	}

	return c.JSON(fiber.Map{
		"id":         id,
		"visi":       visi,
		"misi":       misi,
		"updated_at": updatedAt.Format(time.RFC3339),
		"updatedAt":  updatedAt.Format(time.RFC3339),
	})
}

func GetPublicFasilitas(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `
		SELECT id, nama, icon, COALESCE(gambar, ''), "order", created_at
		FROM core_fasilitas
		ORDER BY "order" ASC, id ASC
	`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var nama, icon, gambar string
		var order int
		var createdAt time.Time

		if err := rows.Scan(&id, &nama, &icon, &gambar, &order, &createdAt); err == nil {
			items = append(items, fiber.Map{
				"id":          id,
				"name":        nama,
				"nama":        nama,
				"description": nama,
				"deskripsi":   nama,
				"icon":        icon,
				"gambar":      gambar,
				"image":       gambar,
				"order":       order,
				"created_at":  createdAt.Format(time.RFC3339),
			})
		}
	}

	return c.JSON(items)
}

func GetPublicTenagaPengajar(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON(fiber.Map{
			"data": []fiber.Map{},
			"pagination": fiber.Map{
				"total":      0,
				"page":       1,
				"limit":      12,
				"totalPages": 0,
			},
			"total": 0,
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

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var total int
	_ = pool.QueryRow(ctx, `SELECT count(*) FROM core_tenagapengajar WHERE is_published = true`).Scan(&total)

	rows, err := pool.Query(ctx, `
		SELECT id, nama_lengkap, COALESCE(nama_panggilan, ''), jenis_kelamin, COALESCE(foto, ''),
		       COALESCE(jabatan, ''), COALESCE(mata_pelajaran, ''), COALESCE(email, ''), no_hp, "order"
		FROM core_tenagapengajar
		WHERE is_published = true
		ORDER BY "order" ASC, id ASC
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		return c.JSON(fiber.Map{
			"data": []fiber.Map{},
			"pagination": fiber.Map{
				"total":      total,
				"page":       page,
				"limit":      limit,
				"totalPages": int(math.Ceil(float64(total) / float64(limit))),
			},
			"total": total,
		})
	}
	defer rows.Close()

	teachers := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var namaLengkap, namaPanggilan, jenisKelamin, foto, jabatan, mataPelajaran, email, noHp string
		var order int

		if err := rows.Scan(&id, &namaLengkap, &namaPanggilan, &jenisKelamin, &foto, &jabatan, &mataPelajaran, &email, &noHp, &order); err == nil {
			teachers = append(teachers, fiber.Map{
				"id":             id,
				"name":           namaLengkap,
				"nama_lengkap":   namaLengkap,
				"namaLengkap":    namaLengkap,
				"nama_panggilan": namaPanggilan,
				"namaPanggilan":  namaPanggilan,
				"jenis_kelamin":  jenisKelamin,
				"jenisKelamin":   jenisKelamin,
				"foto":           foto,
				"jabatan":        jabatan,
				"mata_pelajaran": mataPelajaran,
				"mataPelajaran":  mataPelajaran,
				"email":          email,
				"no_hp":          noHp,
				"noHp":           noHp,
				"order":          order,
			})
		}
	}

	totalPages := 0
	if limit > 0 {
		totalPages = int(math.Ceil(float64(total) / float64(limit)))
	}

	return c.JSON(fiber.Map{
		"data": teachers,
		"pagination": fiber.Map{
			"total":      total,
			"page":       page,
			"limit":      limit,
			"totalPages": totalPages,
		},
		"total": total,
	})
}

func GetPublicPosts(c *fiber.Ctx) error {
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
	if limit < 1 || limit > 50 {
		limit = 10
	}
	offset := (page - 1) * limit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var total int
	_ = pool.QueryRow(ctx, `SELECT count(*) FROM blog_blogpost WHERE status = 'published'`).Scan(&total)

	rows, err := pool.Query(ctx, `
		SELECT 
			b.id, b.title, b.slug, b.content, b.excerpt, COALESCE(b.featured_image, ''),
			b.views_count, b.likes_count, b.shares_count, b.status, b.is_featured,
			b.published_at, b.created_at, b.updated_at,
			COALESCE(u.id, 0), COALESCE(u.username, ''), COALESCE(u.first_name, ''), COALESCE(u.last_name, ''), COALESCE(u.avatar, ''),
			COALESCE(c.id, 0), COALESCE(c.name, ''), COALESCE(c.slug, '')
		FROM blog_blogpost b
		LEFT JOIN users_user u ON b.author_id = u.id
		LEFT JOIN blog_category c ON b.category_id = c.id
		WHERE b.status = 'published'
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
		var authorUsername, authorFirst, authorLast, authorAvatar string
		var catID int64
		var catName, catSlug string

		if err := rows.Scan(
			&id, &title, &slug, &content, &excerpt, &featuredImage,
			&viewsCount, &likesCount, &sharesCount, &status, &isFeatured,
			&publishedAt, &createdAt, &updatedAt,
			&authorID, &authorUsername, &authorFirst, &authorLast, &authorAvatar,
			&catID, &catName, &catSlug,
		); err == nil {
			var catMap fiber.Map
			if catID > 0 {
				catMap = fiber.Map{
					"id":   catID,
					"name": catName,
					"slug": catSlug,
				}
			}

			var authorMap fiber.Map
			if authorID > 0 {
				authorMap = fiber.Map{
					"id":        authorID,
					"username":  authorUsername,
					"firstName": authorFirst,
					"lastName":  authorLast,
					"avatar":    authorAvatar,
				}
			}

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
				"likes_count":    likesCount,
				"shares_count":   sharesCount,
				"status":         status,
				"is_featured":    isFeatured,
				"isFeatured":     isFeatured,
				"published_at":   publishedAt,
				"publishedAt":    publishedAt,
				"created_at":     createdAt,
				"createdAt":      createdAt,
				"author":         authorMap,
				"category":       catMap,
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
		"pagination": fiber.Map{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": totalPages,
		},
		"total": total,
	})
}

func GetPublicPostBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	if slug == "" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Post tidak ditemukan",
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

	var id int64
	var title, postSlug, content, excerpt, featuredImage, status string
	var viewsCount, likesCount, sharesCount int
	var isFeatured bool
	var publishedAt, createdAt, updatedAt *time.Time
	var authorID int64
	var authorUsername, authorFirst, authorLast, authorAvatar string
	var catID int64
	var catName, catSlug string

	query := `
		SELECT 
			b.id, b.title, b.slug, b.content, b.excerpt, COALESCE(b.featured_image, ''),
			b.views_count, b.likes_count, b.shares_count, b.status, b.is_featured,
			b.published_at, b.created_at, b.updated_at,
			COALESCE(u.id, 0), COALESCE(u.username, ''), COALESCE(u.first_name, ''), COALESCE(u.last_name, ''), COALESCE(u.avatar, ''),
			COALESCE(c.id, 0), COALESCE(c.name, ''), COALESCE(c.slug, '')
		FROM blog_blogpost b
		LEFT JOIN users_user u ON b.author_id = u.id
		LEFT JOIN blog_category c ON b.category_id = c.id
		WHERE b.slug = $1 OR CAST(b.id AS TEXT) = $1
		LIMIT 1
	`

	err := pool.QueryRow(ctx, query, slug).Scan(
		&id, &title, &postSlug, &content, &excerpt, &featuredImage,
		&viewsCount, &likesCount, &sharesCount, &status, &isFeatured,
		&publishedAt, &createdAt, &updatedAt,
		&authorID, &authorUsername, &authorFirst, &authorLast, &authorAvatar,
		&catID, &catName, &catSlug,
	)

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Post not found",
		})
	}

	_, _ = pool.Exec(ctx, `UPDATE blog_blogpost SET views_count = views_count + 1 WHERE id = $1`, id)

	var catMap fiber.Map
	if catID > 0 {
		catMap = fiber.Map{
			"id":   catID,
			"name": catName,
			"slug": catSlug,
		}
	}

	var authorMap fiber.Map
	if authorID > 0 {
		authorMap = fiber.Map{
			"id":        authorID,
			"username":  authorUsername,
			"firstName": authorFirst,
			"lastName":  authorLast,
			"avatar":    authorAvatar,
		}
	}

	return c.JSON(fiber.Map{
		"id":             id,
		"title":          title,
		"slug":           postSlug,
		"content":        content,
		"excerpt":        excerpt,
		"featured_image": featuredImage,
		"featuredImage":  featuredImage,
		"views_count":    viewsCount + 1,
		"viewsCount":     viewsCount + 1,
		"likes_count":    likesCount,
		"shares_count":   sharesCount,
		"status":         status,
		"is_featured":    isFeatured,
		"isFeatured":     isFeatured,
		"published_at":   publishedAt,
		"publishedAt":    publishedAt,
		"created_at":     createdAt,
		"createdAt":      createdAt,
		"updated_at":     updatedAt,
		"author":         authorMap,
		"category":       catMap,
	})
}

func PostPublicPSBDaftar(c *fiber.Ctx) error {
	raw := c.Body()
	if len(raw) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Request body tidak boleh kosong",
		})
	}

	var req PSBDaftarRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format JSON tidak valid",
		})
	}

	fullName := strings.TrimSpace(req.FullName)
	if fullName == "" {
		fullName = strings.TrimSpace(req.NamaLengkap)
	}

	nisn := strings.TrimSpace(req.NISN)
	if fullName == "" && nisn == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Nama lengkap dan NISN wajib diisi",
		})
	}
	if fullName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Nama lengkap wajib diisi",
		})
	}
	if nisn == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "NISN wajib diisi",
		})
	}

	if utf8.RuneCountInString(fullName) > 200 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Nama lengkap tidak boleh lebih dari 200 karakter",
		})
	}

	if len(nisn) > 20 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "NISN tidak boleh lebih dari 20 karakter",
		})
	}

	gender := strings.TrimSpace(req.Gender)
	if gender == "" {
		gender = strings.TrimSpace(req.JenisKelamin)
	}
	if gender == "" {
		gender = "L"
	}
	if len(gender) > 10 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Jenis kelamin tidak boleh lebih dari 10 karakter",
		})
	}

	phone := strings.TrimSpace(req.Phone)
	if phone == "" {
		phone = strings.TrimSpace(req.NoHP)
	}
	if phone == "" {
		phone = "-"
	}
	if len(phone) > 20 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Nomor HP tidak boleh lebih dari 20 karakter",
		})
	}

	email := strings.TrimSpace(req.Email)
	if email == "" {
		email = "-"
	}
	if len(email) > 254 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email tidak boleh lebih dari 254 karakter",
		})
	}

	address := strings.TrimSpace(req.Address)
	if address == "" {
		address = strings.TrimSpace(req.Alamat)
	}
	if address == "" {
		address = "-"
	}
	if utf8.RuneCountInString(address) > 2000 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Alamat tidak boleh lebih dari 2000 karakter",
		})
	}

	tempatLahir := strings.TrimSpace(req.TempatLahir)
	if tempatLahir == "" {
		tempatLahir = "-"
	}
	if utf8.RuneCountInString(tempatLahir) > 100 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Tempat lahir tidak boleh lebih dari 100 karakter",
		})
	}

	asalSekolah := strings.TrimSpace(req.AsalSekolah)
	if asalSekolah == "" {
		asalSekolah = "-"
	}
	if utf8.RuneCountInString(asalSekolah) > 200 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Asal sekolah tidak boleh lebih dari 200 karakter",
		})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"error": "Database tidak terhubung",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var existingID int64
	err := pool.QueryRow(ctx, `SELECT id FROM admissions_santri WHERE nisn = $1 LIMIT 1`, nisn).Scan(&existingID)
	if err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "NISN sudah terdaftar",
		})
	}

	var newID int64
	var createdAt time.Time
	err = pool.QueryRow(ctx, `
		INSERT INTO admissions_santri (
			nama_lengkap, nisn, tempat_lahir, tanggal_lahir, jenis_kelamin,
			no_hp, email, alamat, asal_sekolah, status, created_at, updated_at
		) VALUES (
			$1, $2, $3, '2010-01-01', $4,
			$5, $6, $7, $8, 'pending', NOW(), NOW()
		)
		RETURNING id, created_at
	`, fullName, nisn, tempatLahir, gender, phone, email, address, asalSekolah).Scan(&newID, &createdAt)

	if err != nil {
		if strings.Contains(err.Error(), "22001") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Data input melebihi batas panjang karakter",
				"details": "Data melebihi batas panjang karakter",
			})
		}
		if strings.Contains(err.Error(), "23505") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "NISN sudah terdaftar",
				"details": "NISN sudah terdaftar",
			})
		}
		if strings.Contains(err.Error(), "23502") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Field wajib tidak boleh kosong",
				"details": "Data yang dikirim tidak memenuhi syarat kolom wajib",
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
		if strings.Contains(err.Error(), "23503") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   "Referensi relasi tidak valid",
				"details": "Data referensi tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menyimpan data pendaftaran",
		})
	}

	regNo := fmt.Sprintf("PSB-%s-%04d", time.Now().Format("20060102"), newID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success":         true,
		"message":         "Pendaftaran santri baru berhasil",
		"registration_no": regNo,
		"data": fiber.Map{
			"id":              newID,
			"registration_no": regNo,
			"nama_lengkap":    fullName,
			"nisn":            nisn,
			"status":          "pending",
			"created_at":      createdAt.Format(time.RFC3339),
		},
	})
}

func GetPublicPrograms(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, nama, slug, deskripsi, COALESCE(gambar, ''), status, is_featured, "order" FROM core_program ORDER BY "order" ASC, id ASC`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var nama, slug, deskripsi, gambar, status string
		var isFeatured bool
		var order int
		if err := rows.Scan(&id, &nama, &slug, &deskripsi, &gambar, &status, &isFeatured, &order); err == nil {
			items = append(items, fiber.Map{
				"id":          id,
				"name":        nama,
				"nama":        nama,
				"slug":        slug,
				"description": deskripsi,
				"deskripsi":   deskripsi,
				"gambar":      gambar,
				"status":      status,
				"is_featured": isFeatured,
				"order":       order,
			})
		}
	}
	return c.JSON(items)
}

func GetPublicProgramPendidikan(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, nama, akreditasi, icon, COALESCE(gambar, ''), "order" FROM core_programpendidikan ORDER BY "order" ASC, id ASC`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var nama, akreditasi, icon, gambar string
		var order int
		if err := rows.Scan(&id, &nama, &akreditasi, &icon, &gambar, &order); err == nil {
			items = append(items, fiber.Map{
				"id":         id,
				"nama":       nama,
				"name":       nama,
				"akreditasi": akreditasi,
				"icon":       icon,
				"gambar":     gambar,
				"order":      order,
			})
		}
	}
	return c.JSON(items)
}

func GetPublicSejarahTimeline(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, judul, icon, deskripsi, "order" FROM core_sejarahtimeline ORDER BY "order" ASC, id ASC`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var judul, icon, deskripsi string
		var order int
		if err := rows.Scan(&id, &judul, &icon, &deskripsi, &order); err == nil {
			items = append(items, fiber.Map{
				"id":          id,
				"title":       judul,
				"judul":       judul,
				"icon":        icon,
				"description": deskripsi,
				"deskripsi":   deskripsi,
				"order":       order,
			})
		}
	}
	return c.JSON(items)
}

func GetPublicEkstrakurikuler(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, nama, icon, COALESCE(gambar, ''), "order" FROM core_ekstrakurikuler ORDER BY "order" ASC, id ASC`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var nama, icon, gambar string
		var order int
		if err := rows.Scan(&id, &nama, &icon, &gambar, &order); err == nil {
			items = append(items, fiber.Map{
				"id":     id,
				"nama":   nama,
				"name":   nama,
				"icon":   icon,
				"gambar": gambar,
				"order":  order,
			})
		}
	}
	return c.JSON(items)
}

func GetPublicJadwalHarian(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, waktu, judul, deskripsi, kategori, COALESCE(target, ''), "order" FROM core_jadwalharian ORDER BY "order" ASC, id ASC`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var waktu, judul, deskripsi, kategori, target string
		var order int
		if err := rows.Scan(&id, &waktu, &judul, &deskripsi, &kategori, &target, &order); err == nil {
			items = append(items, fiber.Map{
				"id":        id,
				"waktu":     waktu,
				"time":      waktu,
				"title":     judul,
				"judul":     judul,
				"deskripsi": deskripsi,
				"kategori":  kategori,
				"target":    target,
				"order":     order,
			})
		}
	}
	return c.JSON(items)
}

func GetPublicPersyaratan(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON(fiber.Map{
			"persyaratan_santri":    "",
			"persyaratan_santriwati": "",
		})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var id int64
	var santri, santriwati string
	var updatedAt time.Time
	err := pool.QueryRow(ctx, `SELECT id, persyaratan_santri, persyaratan_santriwati, updated_at FROM core_persyaratan LIMIT 1`).Scan(&id, &santri, &santriwati, &updatedAt)
	if err != nil {
		return c.JSON(fiber.Map{
			"id":                     1,
			"persyaratan_santri":     "1. Mengisi formulir pendaftaran\n2. Melampirkan fotokopi ijazah & kartu keluarga\n3. Surat keterangan sehat dari dokter",
			"persyaratan_santriwati": "1. Mengisi formulir pendaftaran\n2. Melampirkan fotokopi ijazah & kartu keluarga\n3. Surat keterangan sehat dari dokter",
			"updated_at":             time.Now().Format(time.RFC3339),
		})
	}
	return c.JSON(fiber.Map{
		"id":                     id,
		"persyaratan_santri":     santri,
		"persyaratan_santriwati": santriwati,
		"persyaratanSantri":     santri,
		"persyaratanSantriwati": santriwati,
		"updated_at":             updatedAt.Format(time.RFC3339),
	})
}

func GetPublicAlurPendaftaran(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON(fiber.Map{"alur_pendaftaran": "", "tahapan_tes": ""})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var id int64
	var gambarUtama, alur, tes string
	var updatedAt time.Time
	err := pool.QueryRow(ctx, `SELECT id, COALESCE(gambar_utama, ''), alur_pendaftaran, tahapan_tes, updated_at FROM core_alurpendaftaran LIMIT 1`).Scan(&id, &gambarUtama, &alur, &tes, &updatedAt)
	if err != nil {
		return c.JSON(fiber.Map{
			"id":               1,
			"gambar_utama":     "",
			"alur_pendaftaran": "1. Pendaftaran Online\n2. Verifikasi Berkas\n3. Ujian Seleksi\n4. Pengumuman\n5. Daftar Ulang",
			"tahapan_tes":      "1. Tes Baca Tulis Al-Quran\n2. Wawancara Santri & Wali\n3. Tes Akademik Dasar",
			"updated_at":       time.Now().Format(time.RFC3339),
		})
	}
	return c.JSON(fiber.Map{
		"id":               id,
		"gambar_utama":     gambarUtama,
		"alur_pendaftaran": alur,
		"tahapan_tes":      tes,
		"updated_at":       updatedAt.Format(time.RFC3339),
	})
}

func GetPublicBiayaPendidikan(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, tipe, nama, jumlah, keterangan, "order" FROM core_biayapendidikan ORDER BY "order" ASC, id ASC`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var tipe, nama, keterangan string
		var jumlah float64
		var order int
		if err := rows.Scan(&id, &tipe, &nama, &jumlah, &keterangan, &order); err == nil {
			items = append(items, fiber.Map{
				"id":         id,
				"tipe":       tipe,
				"nama":       nama,
				"name":       nama,
				"jumlah":     jumlah,
				"amount":     jumlah,
				"keterangan": keterangan,
				"order":      order,
			})
		}
	}
	return c.JSON(items)
}

func GetPublicStatistik(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, judul, nilai, icon, deskripsi, warna, "order" FROM core_statistik WHERE is_published = true ORDER BY "order" ASC, id ASC`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var judul, nilai, icon, deskripsi, warna string
		var order int
		if err := rows.Scan(&id, &judul, &nilai, &icon, &deskripsi, &warna, &order); err == nil {
			items = append(items, fiber.Map{
				"id":          id,
				"title":       judul,
				"judul":       judul,
				"value":       nilai,
				"nilai":       nilai,
				"icon":        icon,
				"description": deskripsi,
				"deskripsi":   deskripsi,
				"color":       warna,
				"warna":       warna,
				"order":       order,
			})
		}
	}
	return c.JSON(items)
}

func GetPublicFounders(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, nama_lengkap, jabatan, alamat, foto, profil_singkat FROM core_founders WHERE is_deleted = false ORDER BY id ASC`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var nama, jabatan, alamat, foto, profil string
		if err := rows.Scan(&id, &nama, &jabatan, &alamat, &foto, &profil); err == nil {
			items = append(items, fiber.Map{
				"id":             id,
				"nama_lengkap":   nama,
				"name":           nama,
				"jabatan":        jabatan,
				"alamat":         alamat,
				"foto":           foto,
				"profil_singkat": profil,
			})
		}
	}
	return c.JSON(items)
}

func GetPublicStrukturOrganisasi(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, nama, jabatan, COALESCE(foto, ''), parent_id, level, "order" FROM core_struktur_organisasi WHERE is_active = true ORDER BY level ASC, "order" ASC, id ASC`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var nama, jabatan, foto string
		var parentID *int64
		var level, order int
		if err := rows.Scan(&id, &nama, &jabatan, &foto, &parentID, &level, &order); err == nil {
			items = append(items, fiber.Map{
				"id":       id,
				"nama":     nama,
				"name":     nama,
				"jabatan":  jabatan,
				"foto":     foto,
				"parentId": parentID,
				"level":    level,
				"order":    order,
			})
		}
	}
	return c.JSON(items)
}

func GetPublicFormConfig(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, form_name, field_key, field_label, field_value FROM core_form_config`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var formName, fieldKey, fieldLabel, fieldValue string
		if err := rows.Scan(&id, &formName, &fieldKey, &fieldLabel, &fieldValue); err == nil {
			items = append(items, fiber.Map{
				"id":         id,
				"formName":   formName,
				"fieldKey":   fieldKey,
				"fieldLabel": fieldLabel,
				"fieldValue": fieldValue,
			})
		}
	}
	return c.JSON(items)
}

func GetPublicLastUpdates(c *fiber.Ctx) error {
	pool := database.GetPool()
	now := time.Now().Format(time.RFC3339)
	if pool == nil {
		return c.JSON(fiber.Map{"timestamp": now, "serverTime": now})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var updatedAt time.Time
	err := pool.QueryRow(ctx, `SELECT updated_at FROM core_websitesettings LIMIT 1`).Scan(&updatedAt)
	if err != nil {
		return c.JSON(fiber.Map{"timestamp": now, "serverTime": now})
	}
	return c.JSON(fiber.Map{
		"timestamp":  updatedAt.Format(time.RFC3339),
		"serverTime": now,
	})
}

func PostPublicContact(c *fiber.Ctx) error {
	var body struct {
		Nama   string `json:"nama"`
		Email  string `json:"email"`
		NoHp   string `json:"no_hp"`
		Subjek string `json:"subjek"`
		Pesan  string `json:"pesan"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid payload"})
	}
	nama := strings.TrimSpace(body.Nama)
	email := strings.TrimSpace(body.Email)
	pesan := strings.TrimSpace(body.Pesan)
	noHp := strings.TrimSpace(body.NoHp)
	subjek := strings.TrimSpace(body.Subjek)

	if nama == "" || email == "" || pesan == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Nama, email, dan pesan wajib diisi"})
	}
	if utf8.RuneCountInString(nama) > 200 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Nama tidak boleh lebih dari 200 karakter"})
	}
	if len(email) > 254 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email tidak boleh lebih dari 254 karakter"})
	}
	if len(noHp) > 20 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Nomor HP tidak boleh lebih dari 20 karakter"})
	}
	if utf8.RuneCountInString(subjek) > 200 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Subjek tidak boleh lebih dari 200 karakter"})
	}
	if utf8.RuneCountInString(pesan) > 5000 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Pesan tidak boleh lebih dari 5000 karakter"})
	}

	pool := database.GetPool()
	if pool == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"error": "Database tidak terhubung"})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, `
		INSERT INTO core_kontak (nama, email, no_hp, subjek, pesan, status, balasan, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, 'unread', '', NOW(), NOW())
	`, nama, email, noHp, subjek, pesan)
	if err != nil {
		if strings.Contains(err.Error(), "22001") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Data input melebihi batas panjang karakter"})
		}
		if strings.Contains(err.Error(), "23502") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Field wajib tidak boleh kosong"})
		}
		if strings.Contains(err.Error(), "23505") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Data duplikat sudah terdaftar"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Gagal menyimpan pesan kontak"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Pesan Anda telah berhasil dikirim",
	})
}

func GetPublicBlogCategories(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, name, slug, "order" FROM blog_category ORDER BY "order" ASC, id ASC`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var name, slug string
		var order int
		if err := rows.Scan(&id, &name, &slug, &order); err == nil {
			items = append(items, fiber.Map{
				"id":    id,
				"name":  name,
				"slug":  slug,
				"order": order,
			})
		}
	}
	return c.JSON(items)
}

func GetPublicBlogTags(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, name, slug, "order" FROM blog_tag ORDER BY "order" ASC, id ASC`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var name, slug string
		var order int
		if err := rows.Scan(&id, &name, &slug, &order); err == nil {
			items = append(items, fiber.Map{
				"id":    id,
				"name":  name,
				"slug":  slug,
				"order": order,
			})
		}
	}
	return c.JSON(items)
}

func GetPublicBlogAnnouncements(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, judul, slug, konten, COALESCE(gambar, ''), status, is_penting, published_at FROM blog_pengumuman WHERE status = 'published' ORDER BY created_at DESC`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var judul, slug, konten, gambar, status string
		var isPenting bool
		var publishedAt *time.Time
		if err := rows.Scan(&id, &judul, &slug, &konten, &gambar, &status, &isPenting, &publishedAt); err == nil {
			items = append(items, fiber.Map{
				"id":          id,
				"title":       judul,
				"judul":       judul,
				"slug":        slug,
				"content":     konten,
				"konten":      konten,
				"gambar":      gambar,
				"status":      status,
				"isPenting":   isPenting,
				"publishedAt": publishedAt,
			})
		}
	}
	return c.JSON(items)
}

func GetPublicBlogTestimonials(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return c.JSON([]fiber.Map{})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := pool.Query(ctx, `SELECT id, nama, COALESCE(foto, ''), jabatan, testimoni, rating, "order" FROM blog_testimoni WHERE is_published = true ORDER BY "order" ASC, id ASC`)
	if err != nil {
		return c.JSON([]fiber.Map{})
	}
	defer rows.Close()

	items := make([]fiber.Map, 0)
	for rows.Next() {
		var id int64
		var nama, foto, jabatan, testimoni string
		var rating, order int
		if err := rows.Scan(&id, &nama, &foto, &jabatan, &testimoni, &rating, &order); err == nil {
			items = append(items, fiber.Map{
				"id":        id,
				"nama":      nama,
				"name":      nama,
				"foto":      foto,
				"jabatan":   jabatan,
				"testimoni": testimoni,
				"rating":    rating,
				"order":     order,
			})
		}
	}
	return c.JSON(items)
}
