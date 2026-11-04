package mcp

import (
	"context"
	"strings"
	"testing"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"gobackend/internal/hub"
)

func TestNewMizanMCPServer(t *testing.T) {
	h := hub.NewHub()
	server := NewMizanMCPServer(h)
	require.NotNil(t, server)
}

func TestHealthHandler(t *testing.T) {
	h := hub.NewHub()
	th := NewToolHandlers(h)

	ctx := context.Background()
	_, out, err := th.HandleHealth(ctx, nil, HealthInput{})
	require.NoError(t, err)

	assert.Equal(t, "ok", out.Status)
	assert.Contains(t, out.Engine, "Mizan")
	assert.NotEmpty(t, out.AllocMB)
	assert.NotEmpty(t, out.SysMB)
	assert.NotEmpty(t, out.Uptime)
}

func TestSafeSQLReadSecurityGuards(t *testing.T) {
	h := hub.NewHub()
	th := NewToolHandlers(h)
	ctx := context.Background()

	testCases := []struct {
		name        string
		query       string
		expectError bool
		errorMsg    string
	}{
		{
			name:        "Reject INSERT",
			query:       "INSERT INTO users (name) VALUES ('hacker')",
			expectError: true,
			errorMsg:    "hanya query SELECT",
		},
		{
			name:        "Reject UPDATE",
			query:       "UPDATE santri SET current_score = 100",
			expectError: true,
			errorMsg:    "hanya query SELECT",
		},
		{
			name:        "Reject DELETE",
			query:       "DELETE FROM absensi",
			expectError: true,
			errorMsg:    "hanya query SELECT",
		},
		{
			name:        "Reject DROP TABLE",
			query:       "DROP TABLE users",
			expectError: true,
			errorMsg:    "hanya query SELECT",
		},
		{
			name:        "Reject Query with Semicolon injection",
			query:       "SELECT * FROM santri; DROP TABLE users;",
			expectError: true,
			errorMsg:    "titik koma",
		},
		{
			name:        "Reject Query containing DELETE subclause",
			query:       "SELECT * FROM santri WHERE id IN (DELETE FROM santri)",
			expectError: true,
			errorMsg:    "terlarang",
		},
		{
			name:        "Reject Query containing Newline Obfuscated DELETE",
			query:       "SELECT * FROM santri\nWHERE 1=1\nDELETE FROM santri",
			expectError: true,
			errorMsg:    "terlarang",
		},
		{
			name:        "Reject Query containing Tab Obfuscated UPDATE",
			query:       "SELECT * FROM santri\tUPDATE users",
			expectError: true,
			errorMsg:    "terlarang",
		},
		{
			name:        "Reject Query with Dash Comment",
			query:       "SELECT * FROM santri WHERE id=1--malicious comment",
			expectError: true,
			errorMsg:    "komentar SQL",
		},
		{
			name:        "Reject Query with Block Comment",
			query:       "SELECT * FROM santri /* malicious comment */ WHERE 1=1",
			expectError: true,
			errorMsg:    "komentar SQL",
		},
		{
			name:        "Reject Query with INTO Clause",
			query:       "SELECT * INTO hacker_table FROM santri",
			expectError: true,
			errorMsg:    "terlarang",
		},
		{
			name:        "Reject Query with PG_SLEEP",
			query:       "SELECT pg_sleep(5)",
			expectError: true,
			errorMsg:    "terlarang",
		},
		{
			name:        "Reject Query with PG_TERMINATE_BACKEND",
			query:       "SELECT pg_terminate_backend(1)",
			expectError: true,
			errorMsg:    "terlarang",
		},
		{
			name:        "Reject Query with LO_EXPORT",
			query:       "SELECT lo_export(1, '/tmp/pwn')",
			expectError: true,
			errorMsg:    "terlarang",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			_, _, err := th.HandleSafeSQLRead(ctx, nil, SafeSQLReadInput{Query: tc.query})
			if tc.expectError {
				require.Error(t, err)
				assert.True(t, strings.Contains(err.Error(), tc.errorMsg), "expected error containing '%s', got '%s'", tc.errorMsg, err.Error())
			} else {
				require.NoError(t, err)
			}
		})
	}
}

func TestBroadcastHandler(t *testing.T) {
	h := hub.NewHub()
	go h.Run()
	th := NewToolHandlers(h)

	ctx := context.Background()
	_, out, err := th.HandleBroadcast(ctx, nil, BroadcastMessageInput{
		Channel: "system",
		Action:  "test_ping",
		Message: "MCP integration test event",
	})
	require.NoError(t, err)
	assert.True(t, out["success"].(bool))
	assert.Equal(t, "system", out["channel"])
	assert.Equal(t, "test_ping", out["action"])
}

func TestBroadcastNilHub(t *testing.T) {
	th := NewToolHandlers(nil)
	ctx := context.Background()

	_, _, err := th.HandleBroadcast(ctx, nil, BroadcastMessageInput{
		Channel: "system",
		Action:  "test",
		Message: "hello",
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "tidak aktif")
}

func TestMCPInMemoryRoundTrip(t *testing.T) {
	h := hub.NewHub()
	server := NewMizanMCPServer(h)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	serverTransport, clientTransport := mcp.NewInMemoryTransports()

	go func() {
		_ = server.Run(ctx, serverTransport)
	}()

	client := mcp.NewClient(&mcp.Implementation{Name: "test-client", Version: "1.0.0"}, nil)
	session, err := client.Connect(ctx, clientTransport, nil)
	require.NoError(t, err)
	defer session.Close()

	toolsResult, err := session.ListTools(ctx, nil)
	require.NoError(t, err)
	require.NotEmpty(t, toolsResult.Tools)

	toolNames := make(map[string]bool)
	for _, tool := range toolsResult.Tools {
		toolNames[tool.Name] = true
	}

	assert.True(t, toolNames["mizan_health"])
	assert.True(t, toolNames["mizan_list_santri"])
	assert.True(t, toolNames["mizan_get_santri_detail"])
	assert.True(t, toolNames["mizan_list_classes"])
	assert.True(t, toolNames["mizan_list_absensi"])
	assert.True(t, toolNames["mizan_record_absensi"])
	assert.True(t, toolNames["mizan_list_penilaian"])
	assert.True(t, toolNames["mizan_record_penilaian"])
	assert.True(t, toolNames["mizan_list_feedback"])
	assert.True(t, toolNames["mizan_broadcast_message"])
	assert.True(t, toolNames["mizan_sql_read"])

	callResult, err := session.CallTool(ctx, &mcp.CallToolParams{
		Name:      "mizan_health",
		Arguments: map[string]any{},
	})
	require.NoError(t, err)
	require.NotEmpty(t, callResult.Content)
	text, ok := callResult.Content[0].(*mcp.TextContent)
	require.True(t, ok)
	assert.Contains(t, text.Text, "ok")
	assert.Contains(t, text.Text, "Mizan")

	resResult, err := session.ListResources(ctx, nil)
	require.NoError(t, err)
	require.NotEmpty(t, resResult.Resources)

	promptResult, err := session.ListPrompts(ctx, nil)
	require.NoError(t, err)
	require.NotEmpty(t, promptResult.Prompts)
}
