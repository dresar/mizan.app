package hub

import (
	"sync"
	"github.com/gofiber/contrib/websocket"
)

type Hub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mutex      sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case conn := <-h.register:
			h.mutex.Lock()
			h.clients[conn] = true
			h.mutex.Unlock()

		case conn := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				conn.Close()
			}
			h.mutex.Unlock()

		case message := <-h.broadcast:
			h.mutex.RLock()
			for conn := range h.clients {
				go func(c *websocket.Conn, msg []byte) {
					_ = c.WriteMessage(websocket.TextMessage, msg)
				}(conn, message)
			}
			h.mutex.RUnlock()
		}
	}
}

func (h *Hub) BroadcastMessage(msg []byte) {
	h.broadcast <- msg
}

func (h *Hub) ClientCount() int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	return len(h.clients)
}

func (h *Hub) Register(conn *websocket.Conn) {
	h.register <- conn
}

func (h *Hub) Unregister(conn *websocket.Conn) {
	h.unregister <- conn
}
