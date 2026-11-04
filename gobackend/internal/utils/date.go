package utils

import (
	"time"
)

var wibLocation *time.Location

func init() {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		loc = time.FixedZone("WIB", 7*3600)
	}
	wibLocation = loc
}

func NowWIB() time.Time {
	return time.Now().In(wibLocation)
}

func FormatWIBDateTime(t time.Time) string {
	return t.In(wibLocation).Format("2006-01-02 15:04:05")
}

func FormatWIBDate(t time.Time) string {
	return t.In(wibLocation).Format("2006-01-02")
}

func FormatWIBTime(t time.Time) string {
	return t.In(wibLocation).Format("15:04 WIB")
}
