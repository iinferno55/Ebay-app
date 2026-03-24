import { Router, Request, Response } from 'express';
import {
  getListings,
  getScanStatus,
  getKeywords,
  getSettings,
  updateSettings,
  addKeyword,
  removeKeyword,
  toggleKeyword,
  runScan,
  clearNewFlags,
} from '../services/scanner.js';
import { validateAppId } from '../services/ebayService.js';
import { EbayListing } from '../types.js';

const router = Router();

// ─── Status ──────────────────────────────────────────────────────────────────

router.get('/status', (_req: Request, res: Response) => {
  res.json(getScanStatus());
});

router.post('/scan', async (_req: Request, res: Response) => {
  const appId = process.env.EBAY_APP_ID;
  if (!appId) {
    return res.status(400).json({ error: 'eBay App ID not configured. Add it in Settings.' });
  }
  // Run scan in background, respond immediately
  runScan().catch(console.error);
  res.json({ message: 'Scan started', status: getScanStatus() });
});

// ─── Listings ─────────────────────────────────────────────────────────────────

router.get('/listings', (req: Request, res: Response) => {
  let results = getListings();

  // Filters
  const { category, maxBids, maxPrice, minPrice, query, sort } = req.query as Record<string, string>;

  if (category && category !== 'all') {
    results = results.filter((l) => l.category.toLowerCase() === category.toLowerCase());
  }
  if (maxBids) {
    const max = parseInt(maxBids, 10);
    results = results.filter((l) => l.bidCount <= max);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice);
    results = results.filter((l) => l.currentPrice <= max);
  }
  if (minPrice) {
    const min = parseFloat(minPrice);
    results = results.filter((l) => l.currentPrice >= min);
  }
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (l) => l.title.toLowerCase().includes(q) || l.originalKeyword.toLowerCase().includes(q)
    );
  }

  // Sorting
  const sortBy = sort ?? 'endTime';
  const sorted = [...results].sort((a: EbayListing, b: EbayListing) => {
    switch (sortBy) {
      case 'price_asc':
        return a.currentPrice - b.currentPrice;
      case 'price_desc':
        return b.currentPrice - a.currentPrice;
      case 'bids_asc':
        return a.bidCount - b.bidCount;
      case 'foundAt':
        return new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime();
      case 'endTime':
      default:
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    }
  });

  // Mark as viewed
  clearNewFlags();

  res.json({
    listings: sorted,
    total: sorted.length,
  });
});

router.get('/listings/stats', (_req: Request, res: Response) => {
  const all = getListings();
  const now = new Date();
  const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  const categories: Record<string, number> = {};
  let totalPrice = 0;
  let priceCount = 0;

  for (const l of all) {
    categories[l.category] = (categories[l.category] ?? 0) + 1;
    if (l.currentPrice > 0) {
      totalPrice += l.currentPrice;
      priceCount++;
    }
  }

  res.json({
    totalListings: all.length,
    zeroOrOneBid: all.filter((l) => l.bidCount <= 1).length,
    endingSoon: all.filter((l) => new Date(l.endTime) <= sixHoursFromNow).length,
    averagePrice: priceCount > 0 ? Math.round((totalPrice / priceCount) * 100) / 100 : 0,
    categories,
    newSinceLastVisit: all.filter((l) => l.isNew).length,
  });
});

// ─── Keywords ────────────────────────────────────────────────────────────────

router.get('/keywords', (_req: Request, res: Response) => {
  res.json(getKeywords());
});

router.post('/keywords', (req: Request, res: Response) => {
  const { keyword, category } = req.body as { keyword?: string; category?: string };
  if (!keyword || keyword.trim().length < 2) {
    return res.status(400).json({ error: 'Keyword must be at least 2 characters.' });
  }
  const entry = addKeyword(keyword, category ?? 'Custom');
  res.status(201).json(entry);
});

router.delete('/keywords/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = removeKeyword(id);
  if (!success) return res.status(404).json({ error: 'Keyword not found.' });
  res.json({ success: true });
});

router.patch('/keywords/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { enabled } = req.body as { enabled?: boolean };
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'enabled must be a boolean.' });
  }
  const success = toggleKeyword(id, enabled);
  if (!success) return res.status(404).json({ error: 'Keyword not found.' });
  res.json({ success: true });
});

// ─── Settings ────────────────────────────────────────────────────────────────

router.get('/settings', (_req: Request, res: Response) => {
  const s = getSettings();
  res.json({
    ...s,
    hasApiKey: !!process.env.EBAY_APP_ID,
    appIdMasked: process.env.EBAY_APP_ID
      ? `${process.env.EBAY_APP_ID.slice(0, 8)}...`
      : null,
  });
});

router.patch('/settings', (req: Request, res: Response) => {
  const { scanIntervalMinutes, maxBidFilter, maxPriceFilter, minPriceFilter, autoScanEnabled } =
    req.body as Record<string, unknown>;
  const updated = updateSettings({
    ...(typeof scanIntervalMinutes === 'number' && { scanIntervalMinutes }),
    ...(typeof maxBidFilter === 'number' && { maxBidFilter }),
    ...(typeof maxPriceFilter === 'number' && { maxPriceFilter }),
    ...(typeof minPriceFilter === 'number' && { minPriceFilter }),
    ...(typeof autoScanEnabled === 'boolean' && { autoScanEnabled }),
  });
  res.json(updated);
});

router.post('/settings/validate-api-key', async (req: Request, res: Response) => {
  const { appId } = req.body as { appId?: string };
  if (!appId) return res.status(400).json({ error: 'appId is required.' });
  const valid = await validateAppId(appId);
  res.json({ valid });
});

export default router;
