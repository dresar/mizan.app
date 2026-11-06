package handlers

import (
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"

	"gobackend/internal/database"
	"gobackend/internal/models"
	"gobackend/internal/utils"
)

func GetCategories(c *fiber.Ctx) error {
	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	catRows, err := pool.Query(ctx, "SELECT id, code, name FROM categories ORDER BY code ASC")
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	defer catRows.Close()

	unsurRows, _ := pool.Query(ctx, "SELECT id, category_name, name, COALESCE(type, 'HASANAH') FROM unsurs ORDER BY id ASC")
	type rawUnsur struct {
		id, catName, name, uType string
	}
	var allUnsurs []rawUnsur
	if unsurRows != nil {
		defer unsurRows.Close()
		for unsurRows.Next() {
			var u rawUnsur
			if err := unsurRows.Scan(&u.id, &u.catName, &u.name, &u.uType); err == nil {
				allUnsurs = append(allUnsurs, u)
			}
		}
	}

	indRows, _ := pool.Query(ctx, "SELECT id, unsur_id, text, type, default_score, tingkat FROM indicators ORDER BY id ASC")
	type rawInd struct {
		id, unsurID, text, iType, tingkat string
		score                             float64
	}
	var allInds []rawInd
	if indRows != nil {
		defer indRows.Close()
		for indRows.Next() {
			var i rawInd
			if err := indRows.Scan(&i.id, &i.unsurID, &i.text, &i.iType, &i.score, &i.tingkat); err == nil {
				allInds = append(allInds, i)
			}
		}
	}

	var categories []models.Kategori
	for catRows.Next() {
		var cat models.Kategori
		if err := catRows.Scan(&cat.ID, &cat.Code, &cat.Name); err == nil {
			for _, u := range allUnsurs {
				if u.catName == cat.Name {
					unsur := models.Unsur{
						ID:   u.id,
						Name: u.name,
						Type: u.uType,
					}
					for _, ind := range allInds {
						if ind.unsurID == u.id {
							unsur.Indicators = append(unsur.Indicators, models.Indikator{
								ID:           ind.id,
								Text:         ind.text,
								Type:         ind.iType,
								DefaultScore: ind.score,
								Tingkat:      ind.tingkat,
							})
						}
					}
					cat.Unsurs = append(cat.Unsurs, unsur)
				}
			}
			categories = append(categories, cat)
		}
	}

	return c.JSON(fiber.Map{
		"success":    true,
		"categories": categories,
	})
}

func CreateCategory(c *fiber.Ctx) error {
	var req struct {
		Code string `json:"code"`
		Name string `json:"name"`
	}
	if err := c.BodyParser(&req); err != nil || req.Name == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "Nama kategori wajib diisi")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	id := fmt.Sprintf("cat-%d", time.Now().Unix())
	_, err := pool.Exec(ctx, "INSERT INTO categories (id, code, name) VALUES ($1,$2,$3)", id, req.Code, req.Name)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, fiber.Map{"id": id}, "Kategori berhasil dibuat")
}

func CreateUnsur(c *fiber.Ctx) error {
	var req struct {
		CategoryName string `json:"categoryName"`
		Name         string `json:"name"`
		Type         string `json:"type"`
	}
	if err := c.BodyParser(&req); err != nil || req.Name == "" || req.CategoryName == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "Data unsur tidak lengkap")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	id := fmt.Sprintf("unsur-%d", time.Now().UnixNano())
	if req.Type == "" {
		req.Type = "HASANAH"
	}

	_, err := pool.Exec(ctx, "INSERT INTO unsurs (id, category_name, name, type) VALUES ($1,$2,$3,$4)", id, req.CategoryName, req.Name, req.Type)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, fiber.Map{"id": id}, "Unsur berhasil ditambahkan")
}

func CreateIndicator(c *fiber.Ctx) error {
	var req struct {
		ID           string  `json:"id"`
		UnsurID      string  `json:"unsurId"`
		Text         string  `json:"text"`
		Type         string  `json:"type"`
		DefaultScore float64 `json:"defaultScore"`
		Tingkat      string  `json:"tingkat"`
	}
	if err := c.BodyParser(&req); err != nil || req.UnsurID == "" || req.Text == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "Data indikator tidak lengkap")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if req.ID == "" {
		req.ID = fmt.Sprintf("ind-%d", time.Now().UnixNano())
	}
	if req.Type == "" {
		req.Type = "HASANAH"
	}
	if req.Tingkat == "" {
		req.Tingkat = "Sedang"
	}

	_, err := pool.Exec(ctx, "INSERT INTO indicators (id, unsur_id, text, type, default_score, tingkat) VALUES ($1,$2,$3,$4,$5,$6)", req.ID, req.UnsurID, req.Text, req.Type, req.DefaultScore, req.Tingkat)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, fiber.Map{"id": req.ID}, "Indikator berhasil ditambahkan")
}

func UpdateIndicator(c *fiber.Ctx) error {
	var req struct {
		ID           string   `json:"id"`
		Text         *string  `json:"text"`
		Type         *string  `json:"type"`
		DefaultScore *float64 `json:"defaultScore"`
		Tingkat      *string  `json:"tingkat"`
	}
	if err := c.BodyParser(&req); err != nil || req.ID == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID indikator wajib diisi")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if req.Text != nil {
		_, _ = pool.Exec(ctx, "UPDATE indicators SET text = $1 WHERE id = $2", *req.Text, req.ID)
	}
	if req.Type != nil {
		_, _ = pool.Exec(ctx, "UPDATE indicators SET type = $1 WHERE id = $2", *req.Type, req.ID)
	}
	if req.DefaultScore != nil {
		_, _ = pool.Exec(ctx, "UPDATE indicators SET default_score = $1 WHERE id = $2", *req.DefaultScore, req.ID)
	}
	if req.Tingkat != nil {
		_, _ = pool.Exec(ctx, "UPDATE indicators SET tingkat = $1 WHERE id = $2", *req.Tingkat, req.ID)
	}

	return utils.SendSuccess(c, fiber.Map{"id": req.ID}, "Indikator berhasil diperbarui")
}

func DeleteIndicator(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return utils.SendError(c, fiber.StatusBadRequest, "ID indikator wajib diisi")
	}

	pool := database.GetPool()
	if pool == nil {
		return utils.SendError(c, fiber.StatusServiceUnavailable, "Database belum terhubung")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := pool.Exec(ctx, "DELETE FROM indicators WHERE id = $1", id)
	if err != nil {
		return utils.SendError(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, fiber.Map{"id": id}, "Indikator berhasil dihapus")
}
