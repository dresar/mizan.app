#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR/gobackend"

while true; do
  ./mizan-server >> "$DIR/mizan-server.log" 2>&1
  sleep 2
done
