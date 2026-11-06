package logger

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"gobackend/internal/hub"
)

type LogActor struct {
	ID   string `json:"id,omitempty"`
	Name string `json:"name,omitempty"`
	Role string `json:"role,omitempty"`
	IP   string `json:"ip,omitempty"`
}

type LogEntry struct {
	ID        string                 `json:"id"`
	Timestamp string                 `json:"timestamp"`
	Level     string                 `json:"level"`
	Category  string                 `json:"category"`
	Action    string                 `json:"action"`
	Actor     LogActor               `json:"actor"`
	Message   string                 `json:"message"`
	Details   map[string]interface{} `json:"details,omitempty"`
}

type LogService struct {
	filePath string
	hub      *hub.Hub
	mu       sync.RWMutex
	logs     []LogEntry
}

var globalLogger *LogService
var once sync.Once

func InitLogger(filePath string, h *hub.Hub) *LogService {
	once.Do(func() {
		resolvedPath := resolvePath(filePath)
		svc := &LogService{
			filePath: resolvedPath,
			hub:      h,
			logs:     make([]LogEntry, 0),
		}
		svc.load()
		svc.pruneOldLogs()
		svc.save()

		go svc.startPruneLoop()
		globalLogger = svc
	})
	return globalLogger
}

func GetLogger() *LogService {
	return globalLogger
}

func resolvePath(p string) string {
	if filepath.IsAbs(p) {
		return p
	}
	candidates := []string{
		"/opt/data/home/mizan.apps/data/system_logs.json",
		filepath.Join(".", "data", "system_logs.json"),
		filepath.Join("..", "data", "system_logs.json"),
	}
	for _, c := range candidates {
		dir := filepath.Dir(c)
		if _, err := os.Stat(dir); err == nil {
			return c
		}
	}
	_ = os.MkdirAll(filepath.Dir(candidates[0]), 0755)
	return candidates[0]
}

func (s *LogService) startPruneLoop() {
	ticker := time.NewTicker(15 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		s.mu.Lock()
		changed := s.pruneOldLogs()
		if changed {
			s.save()
		}
		s.mu.Unlock()
	}
}

func (s *LogService) pruneOldLogs() bool {
	cutoff := time.Now().Add(-24 * time.Hour)
	originalLen := len(s.logs)
	validLogs := make([]LogEntry, 0, len(s.logs))

	for _, l := range s.logs {
		t, err := time.Parse(time.RFC3339, l.Timestamp)
		if err != nil {
			validLogs = append(validLogs, l)
			continue
		}
		if t.After(cutoff) {
			validLogs = append(validLogs, l)
		}
	}

	s.logs = validLogs
	return len(s.logs) != originalLen
}

func (s *LogService) load() {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := os.ReadFile(s.filePath)
	if err != nil {
		s.logs = make([]LogEntry, 0)
		return
	}

	var loaded []LogEntry
	if err := json.Unmarshal(data, &loaded); err != nil {
		s.logs = make([]LogEntry, 0)
		return
	}
	s.logs = loaded
}

func (s *LogService) save() {
	dir := filepath.Dir(s.filePath)
	_ = os.MkdirAll(dir, 0755)

	data, err := json.MarshalIndent(s.logs, "", "  ")
	if err != nil {
		return
	}
	_ = os.WriteFile(s.filePath, data, 0644)
}

func (s *LogService) Log(entry LogEntry) {
	if entry.ID == "" {
		entry.ID = fmt.Sprintf("log_%d_%d", time.Now().UnixNano()/1e6, len(s.logs)+1)
	}
	if entry.Timestamp == "" {
		entry.Timestamp = time.Now().Format(time.RFC3339)
	}
	if entry.Level == "" {
		entry.Level = "INFO"
	}
	if entry.Category == "" {
		entry.Category = "SYSTEM"
	}

	s.mu.Lock()
	s.logs = append([]LogEntry{entry}, s.logs...)
	if len(s.logs) > 3000 {
		s.logs = s.logs[:3000]
	}
	s.pruneOldLogs()
	s.save()
	s.mu.Unlock()

	if s.hub != nil {
		eventData := map[string]interface{}{
			"channel":   "system_log",
			"action":    "new_log",
			"data":      entry,
			"timestamp": entry.Timestamp,
		}
		bytes, err := json.Marshal(eventData)
		if err == nil {
			s.hub.BroadcastMessage(bytes)
		}
	}
}

func (s *LogService) GetLogs(limit int, level, category, search string) []LogEntry {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if limit <= 0 || limit > 500 {
		limit = 100
	}

	filtered := make([]LogEntry, 0, limit)
	searchLower := strings.ToLower(search)

	for _, l := range s.logs {
		if level != "" && !strings.EqualFold(level, "ALL") && !strings.EqualFold(l.Level, level) {
			continue
		}
		if category != "" && !strings.EqualFold(category, "ALL") && !strings.EqualFold(l.Category, category) {
			continue
		}
		if search != "" {
			msgMatch := strings.Contains(strings.ToLower(l.Message), searchLower)
			actionMatch := strings.Contains(strings.ToLower(l.Action), searchLower)
			actorMatch := strings.Contains(strings.ToLower(l.Actor.Name), searchLower) || strings.Contains(strings.ToLower(l.Actor.Role), searchLower)
			if !msgMatch && !actionMatch && !actorMatch {
				continue
			}
		}

		filtered = append(filtered, l)
		if len(filtered) >= limit {
			break
		}
	}

	return filtered
}

func (s *LogService) Clear() {
	s.mu.Lock()
	s.logs = make([]LogEntry, 0)
	s.save()
	s.mu.Unlock()

	if s.hub != nil {
		eventData := map[string]interface{}{
			"channel":   "system_log",
			"action":    "logs_cleared",
			"timestamp": time.Now().Format(time.RFC3339),
		}
		bytes, err := json.Marshal(eventData)
		if err == nil {
			s.hub.BroadcastMessage(bytes)
		}
	}
}

func (s *LogService) GetStats() map[string]interface{} {
	s.mu.RLock()
	defer s.mu.RUnlock()

	total := len(s.logs)
	errCount := 0
	warnCount := 0
	infoCount := 0

	for _, l := range s.logs {
		switch strings.ToUpper(l.Level) {
		case "ERROR", "CRITICAL":
			errCount++
		case "WARN", "WARNING":
			warnCount++
		case "INFO":
			infoCount++
		}
	}

	var oldest string
	var newest string
	if total > 0 {
		newest = s.logs[0].Timestamp
		oldest = s.logs[total-1].Timestamp
	}

	fi, err := os.Stat(s.filePath)
	fileSizeBytes := int64(0)
	if err == nil {
		fileSizeBytes = fi.Size()
	}

	return map[string]interface{}{
		"total":           total,
		"errors":          errCount,
		"warnings":        warnCount,
		"info":            infoCount,
		"oldest":          oldest,
		"newest":          newest,
		"file_size_bytes": fileSizeBytes,
		"retention":       "24_HOURS",
		"storage":         "JSON_FILE",
		"file_path":       s.filePath,
	}
}
