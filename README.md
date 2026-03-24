# eBay Hunter — Misspelling Finder

An automated eBay auction scraper that finds misspelled listings — the same idea as FatFingers, TypoHound, and NoBidz, but fully automated with a clean SaaS dashboard.

## How it works

1. The app has a built-in list of ~40 popular product keywords (iPhone, MacBook, Rolex, Pokemon cards, etc.)
2. For each keyword, a misspelling engine generates realistic typos (transpositions, deletions, adjacent keys)
3. eBay's Finding API is searched for each misspelled term — sellers who mistype listings get far fewer bidders
4. Results are shown in a clean dashboard, sortable by price, bid count, and time remaining
5. Scans run automatically every 2 hours (configurable)

## Setup

### 1. Get an eBay App ID (free)

1. Go to [developer.ebay.com](https://developer.ebay.com) and create an account
2. Create a new application
3. Copy the **Production App ID (Client ID)**

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your App ID:

```
EBAY_APP_ID=YourAppId-xxxxxxxx-Prod-xxxxxxxxx
PORT=3001
SCAN_INTERVAL_MINUTES=120
```

### 3. Install & run

```bash
# Install all dependencies
npm run install:all

# Start both server and client in development mode
npm run dev
```

- **Client**: http://localhost:5173
- **Server API**: http://localhost:3001/api

### 4. Production build

```bash
npm run build     # builds client
npm start         # serves everything from port 3001
```

## Features

- **Auto-scanning** — Scans eBay every 2 hours automatically (configurable 30m–8h)
- **40+ default keywords** — Electronics, Gaming, Watches, Collectibles, Sneakers, Cameras, Jewelry
- **Custom keywords** — Add your own keywords in Settings
- **Smart filters** — Filter by category, price, bid count, ending time
- **Grid & table view** — Switch between card grid and sortable table
- **Misspelling highlight** — Shows exactly which word was misspelled
- **0-bid detector** — Quickly find listings with zero competition

## eBay API limits

The free eBay Developer account allows 5,000 API calls per day.
One full scan uses approximately 400–500 calls (40 keywords × 10 misspellings each).
At the default 2-hour interval, you'll use ~3,000 calls/day — safely within limits.

## Gixen Integration (planned)

Gixen snipe integration is planned for a future update. Once your account is connected, you'll be able to queue bids directly from the dashboard.
