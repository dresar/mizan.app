package utils

import (
	"github.com/gofiber/fiber/v2"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func SendSuccess(c *fiber.Ctx, data interface{}, message ...string) error {
	msg := ""
	if len(message) > 0 {
		msg = message[0]
	}
	return c.Status(fiber.StatusOK).JSON(APIResponse{
		Success: true,
		Data:    data,
		Message: msg,
	})
}

func SendError(c *fiber.Ctx, statusCode int, message string) error {
	return c.Status(statusCode).JSON(APIResponse{
		Success: false,
		Message: message,
		Error:   message,
	})
}
