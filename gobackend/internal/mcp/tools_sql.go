package mcp

import (
	"context"
	"fmt"
	"strings"

	"github.com/modelcontextprotocol/go-sdk/mcp"

	"gobackend/internal/database"
)

var forbiddenTokens = map[string]struct{}{
	"INSERT":               {},
	"UPDATE":               {},
	"DELETE":               {},
	"DROP":                 {},
	"ALTER":                {},
	"TRUNCATE":             {},
	"CREATE":               {},
	"GRANT":                {},
	"REVOKE":               {},
	"EXEC":                 {},
	"EXECUTE":              {},
	"INTO":                 {},
	"COPY":                 {},
	"VACUUM":               {},
	"ANALYZE":              {},
	"REINDEX":              {},
	"CALL":                 {},
	"DO":                   {},
	"PG_SLEEP":             {},
	"PG_TERMINATE_BACKEND": {},
	"PG_CANCEL_BACKEND":    {},
	"PG_READ_FILE":         {},
	"PG_WRITE_FILE":        {},
	"PG_READ_BINARY_FILE":  {},
	"LO_EXPORT":            {},
	"LO_IMPORT":            {},
	"LO_UNLINK":            {},
	"SET_CONFIG":           {},
}

func ValidateSafeSQLRead(rawQuery string) error {
	cleanQuery := strings.TrimSpace(rawQuery)
	upperQuery := strings.ToUpper(cleanQuery)

	if !strings.HasPrefix(upperQuery, "SELECT") {
		return fmt.Errorf("hanya query SELECT yang diperbolehkan")
	}

	if strings.Contains(cleanQuery, ";") {
		return fmt.Errorf("query tidak boleh mengandung titik koma (;)")
	}

	if strings.Contains(cleanQuery, "--") || strings.Contains(cleanQuery, "/*") || strings.Contains(cleanQuery, "*/") {
		return fmt.Errorf("query tidak boleh mengandung komentar SQL (--, /*, */)")
	}

	tokens := strings.FieldsFunc(upperQuery, func(r rune) bool {
		return !((r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '_')
	})

	for _, token := range tokens {
		if _, forbidden := forbiddenTokens[token]; forbidden {
			return fmt.Errorf("query mengandung kata terlarang untuk keamanan: %s", token)
		}
	}

	return nil
}

func (th *ToolHandlers) HandleSafeSQLRead(ctx context.Context, req *mcp.CallToolRequest, in SafeSQLReadInput) (*mcp.CallToolResult, []map[string]any, error) {
	cleanQuery := strings.TrimSpace(in.Query)
	if err := ValidateSafeSQLRead(cleanQuery); err != nil {
		return nil, nil, err
	}

	pool := database.GetPool()
	if pool == nil {
		return nil, nil, fmt.Errorf("database belum terhubung")
	}

	rows, err := pool.Query(ctx, cleanQuery)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	fieldDescriptions := rows.FieldDescriptions()
	var results []map[string]any

	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			continue
		}
		rowMap := make(map[string]any)
		for i, fd := range fieldDescriptions {
			rowMap[fd.Name] = values[i]
		}
		results = append(results, rowMap)
		if len(results) >= 200 {
			break
		}
	}

	return nil, results, nil
}
