# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (root + server + client)
npm run install:all

# Development (starts both server and client with hot reload)
npm run dev              # both (server :3001, client :5173)
npm run dev:server       # server only (tsx watch)
npm run dev:client       # client only (vite)

# Production
npm run build            # builds client to client/dist
npm start                # starts server (serves API + built client on :3001)

# One-click launch (installs deps, builds, opens browser)
./start.sh               # Linux/Mac
start.bat                # Windows
```

There are no tests or linting configured.

## Architecture

Monorepo with two packages: `server/` (Express + TypeScript) and `client/` (React + Vite + Tailwind). All data is **in-memory only** — resets on server restart.

### Data Flow

1. **Scanner** (`server/src/services/scanner.ts`) runs on startup and on a cron schedule
2. For each enabled keyword, the **misspelling engine** (`server/src/services/misspellingEngine.ts`) generates typo variants (transpositions, deletions, adjacent-key replacements, known misspellings)
3. Each variant is searched via the **eBay Finding API** (`server/src/services/ebayService.ts`) — Auction/AuctionWithBIN only, sorted by EndTimeSoonest
4. Results are deduped by `itemId`, profit-filtered, and stored in memory
5. The React client polls the Express REST API (`/api/status`, `/api/listings`, `/api/listings/stats`, `/api/keywords`, `/api/settings`) via TanStack React Query

### Profit Calculation

`estimatedProfit = estimatedMarketValue × 0.87 − $15 shipping − currentPrice`

Each keyword in `server/src/data/defaultKeywords.ts` has a hardcoded `estimatedMarketValue`.

### Key Server Files

- `server/src/services/scanner.ts` — scan loop, in-memory state (listings, keywords, settings, scanStatus), scheduling
- `server/src/services/misspellingEngine.ts` — typo generation algorithm with QWERTY adjacency map
- `server/src/services/ebayService.ts` — eBay Finding API v1 integration
- `server/src/routes/api.ts` — all REST endpoints
- `server/src/types.ts` — shared TypeScript interfaces

### Key Client Files

- `client/src/services/api.ts` — axios wrapper for all API calls
- `client/src/pages/` — Dashboard (stats), Listings (browse/filter), Settings (config/keywords)
- `client/src/components/FilterPanel.tsx` — category, price, bid, and text filters

### Environment

Server reads from `server/.env`:
- `EBAY_APP_ID` — required for scanning (free key from developer.ebay.com)
- `PORT` — server port (default 3001)
- `SCAN_INTERVAL_MINUTES` — scan frequency (default 120)
- `MAX_LISTINGS` — in-memory cap (default 500)

In dev mode, Vite proxies `/api` requests to `localhost:3001`. In production, Express serves `client/dist` as static files.
