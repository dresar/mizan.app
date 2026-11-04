package main

import (
	"context"
	"flag"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/modelcontextprotocol/go-sdk/mcp"

	"gobackend/config"
	"gobackend/internal/database"
	"gobackend/internal/hub"
	mizanserver "gobackend/internal/mcp"
)

func main() {
	httpAddr := flag.String("http", "", "HTTP listen address for Streamable HTTP transport (e.g. :8081)")
	stdioMode := flag.Bool("stdio", false, "Run in stdio mode (default when --http is not set)")
	flag.Parse()

	cfg := config.LoadConfig()
	_, _ = database.InitDB(cfg.DatabaseURL)

	realtimeHub := hub.NewHub()
	go realtimeHub.Run()

	server := mizanserver.NewMizanMCPServer(realtimeHub)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-sigCh
		cancel()
	}()

	if *httpAddr != "" {
		addr := *httpAddr
		if !strings.Contains(addr, ":") {
			addr = ":" + addr
		}

		handler := mcp.NewStreamableHTTPHandler(func(r *http.Request) *mcp.Server {
			return server
		}, nil)

		mux := http.NewServeMux()
		mux.Handle("/mcp", handler)
		mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"status":"ok","service":"mizan-mcp"}`))
		})

		httpServer := &http.Server{
			Addr:    addr,
			Handler: mux,
		}

		go func() {
			<-ctx.Done()
			_ = httpServer.Shutdown(context.Background())
		}()

		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			os.Exit(1)
		}
		return
	}

	_ = stdioMode
	if err := server.Run(ctx, &mcp.StdioTransport{}); err != nil {
		os.Exit(1)
	}
}
