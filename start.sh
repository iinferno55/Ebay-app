#!/usr/bin/env bash
set -e

# ── eBay Misspelling Hunter — one-click launcher ──────────────────────────────

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
RESET="\033[0m"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo -e "${BOLD}${CYAN}  eBay Misspelling Hunter${RESET}"
echo "  ─────────────────────────────────────"

# 1. Check Node.js
if ! command -v node &>/dev/null; then
  echo ""
  echo "  Node.js is not installed."
  echo "  Download it from: https://nodejs.org  (use the LTS version)"
  echo ""
  exit 1
fi

NODE_VER=$(node -e "process.stdout.write(process.versions.node)")
echo -e "  Node.js ${GREEN}${NODE_VER}${RESET} detected"

# 2. Install dependencies (only if needed)
if [ ! -d "$ROOT/node_modules" ] || [ ! -d "$ROOT/server/node_modules" ] || [ ! -d "$ROOT/client/node_modules" ]; then
  echo ""
  echo "  Installing dependencies (first run — this takes ~30 seconds)..."
  cd "$ROOT" && npm run install:all --silent
  echo -e "  ${GREEN}Dependencies installed${RESET}"
fi

# 3. Create server/.env if missing
ENV_FILE="$ROOT/server/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo ""
  echo -e "  ${YELLOW}No eBay API key found.${RESET}"
  echo "  Get a free key at: https://developer.ebay.com/my/keys"
  echo ""
  read -rp "  Paste your eBay App ID (or press Enter to skip): " APP_ID
  echo "EBAY_APP_ID=${APP_ID}" > "$ENV_FILE"
  echo "PORT=3001" >> "$ENV_FILE"
  echo "SCAN_INTERVAL_MINUTES=120" >> "$ENV_FILE"
  echo "MAX_LISTINGS=500" >> "$ENV_FILE"
  echo -e "  ${GREEN}server/.env created${RESET}"
fi

# 4. Build the client (only if dist is missing or source is newer)
DIST_DIR="$ROOT/client/dist"
if [ ! -d "$DIST_DIR" ] || [ "$ROOT/client/src" -nt "$DIST_DIR" ]; then
  echo ""
  echo "  Building the app..."
  cd "$ROOT" && npm run build --silent
  echo -e "  ${GREEN}Build complete${RESET}"
fi

# 5. Launch the server
echo ""
echo -e "  ${GREEN}${BOLD}Launching...${RESET}"
echo -e "  Open ${CYAN}http://localhost:3001${RESET} in your browser"
echo "  Press Ctrl+C to stop"
echo ""

# Auto-open browser
URL="http://localhost:3001"
sleep 1.5 &
SLEEP_PID=$!
wait $SLEEP_PID 2>/dev/null || true
if command -v xdg-open &>/dev/null; then
  xdg-open "$URL" &>/dev/null &
elif command -v open &>/dev/null; then
  open "$URL" &
fi

# Start server
cd "$ROOT"
npm start
