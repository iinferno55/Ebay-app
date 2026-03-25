import schedule from 'node-schedule';
import { EbayListing, KeywordEntry, ScanStatus, Settings } from '../types.js';
import { generateKeywordMisspellings } from './misspellingEngine.js';
import { searchEbayMisspelling } from './ebayService.js';
import { DEFAULT_KEYWORDS } from '../data/defaultKeywords.js';

// In-memory store
let listings: EbayListing[] = [];
let keywords: KeywordEntry[] = [...DEFAULT_KEYWORDS];
let settings: Settings = {
  scanIntervalMinutes: parseInt(process.env.SCAN_INTERVAL_MINUTES ?? '120', 10),
  maxBidFilter: 5,
  maxPriceFilter: 0, // 0 = no limit
  minPriceFilter: 0,
  autoScanEnabled: true,
  minFlipProfit: 0,
};

let scanStatus: ScanStatus = {
  isScanning: false,
  lastScanAt: null,
  nextScanAt: null,
  totalListingsFound: 0,
  keywordsScanned: 0,
  totalKeywords: 0,
  scanIntervalMinutes: settings.scanIntervalMinutes,
  apiCallsUsed: 0,
};

let scheduledJob: schedule.Job | null = null;
let seenItemIds = new Set<string>();

function getAppId(): string {
  return process.env.EBAY_APP_ID ?? '';
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function runScan(): Promise<void> {
  const appId = getAppId();
  if (!appId) {
    console.warn('[Scanner] No eBay App ID configured. Skipping scan.');
    return;
  }
  if (scanStatus.isScanning) {
    console.log('[Scanner] Scan already in progress, skipping.');
    return;
  }

  const enabledKeywords = keywords.filter((k) => k.enabled);
  scanStatus.isScanning = true;
  scanStatus.keywordsScanned = 0;
  scanStatus.totalKeywords = enabledKeywords.length;
  scanStatus.apiCallsUsed = 0;

  console.log(`[Scanner] Starting scan for ${enabledKeywords.length} keywords...`);

  const newListings: EbayListing[] = [];

  for (const entry of enabledKeywords) {
    const misspellings = generateKeywordMisspellings(entry.keyword);
    console.log(
      `[Scanner] Scanning "${entry.keyword}" → ${misspellings.length} misspellings`
    );

    for (const misspelling of misspellings) {
      try {
        const results = await searchEbayMisspelling(
          misspelling,
          entry.keyword,
          entry.category,
          appId,
          entry.estimatedMarketValue
        );
        scanStatus.apiCallsUsed++;

        if (results.length > 0) {
          console.log(`[Scanner]   "${misspelling}" → ${results.length} raw results`);
        }

        for (const listing of results) {
          if (!seenItemIds.has(listing.itemId)) {
            if (settings.minFlipProfit > 0 && listing.estimatedProfit < settings.minFlipProfit) continue;
            seenItemIds.add(listing.itemId);
            listing.isNew = true;
            newListings.push(listing);
          }
        }

        // Polite delay between calls (200ms)
        await delay(200);
      } catch (err) {
        console.error(`[Scanner] Error searching "${misspelling}":`, err);
      }
    }

    scanStatus.keywordsScanned++;
  }

  // Mark existing listings as no longer new
  listings = listings.map((l) => ({ ...l, isNew: false }));

  // Prepend new listings, cap at MAX_LISTINGS
  const maxListings = parseInt(process.env.MAX_LISTINGS ?? '500', 10);
  listings = [...newListings, ...listings].slice(0, maxListings);

  scanStatus.isScanning = false;
  scanStatus.lastScanAt = new Date().toISOString();
  scanStatus.totalListingsFound = listings.length;

  // Calculate next scan time
  const nextScan = new Date(Date.now() + settings.scanIntervalMinutes * 60 * 1000);
  scanStatus.nextScanAt = nextScan.toISOString();

  console.log(
    `[Scanner] Scan complete. Found ${newListings.length} new listings. Total: ${listings.length}. API calls: ${scanStatus.apiCallsUsed}`
  );
}

export function scheduleScans(): void {
  if (scheduledJob) {
    scheduledJob.cancel();
    scheduledJob = null;
  }

  if (!settings.autoScanEnabled) return;

  const intervalMs = settings.scanIntervalMinutes * 60 * 1000;
  const rule = new schedule.RecurrenceRule();
  // Run every N minutes
  rule.second = 0;
  rule.minute = new schedule.Range(0, 59, settings.scanIntervalMinutes);

  scheduledJob = schedule.scheduleJob(
    { start: new Date(Date.now() + intervalMs), rule: `*/${settings.scanIntervalMinutes} * * * *` },
    () => {
      runScan().catch(console.error);
    }
  );

  const nextScan = new Date(Date.now() + intervalMs);
  scanStatus.nextScanAt = nextScan.toISOString();
  scanStatus.scanIntervalMinutes = settings.scanIntervalMinutes;
  console.log(
    `[Scanner] Scheduled. Next scan at ${nextScan.toLocaleTimeString()} (every ${settings.scanIntervalMinutes} min)`
  );
}

// ─── Getters / Setters ────────────────────────────────────────────────────────

export function getListings(): EbayListing[] {
  return listings;
}

export function getScanStatus(): ScanStatus {
  return {
    ...scanStatus,
    totalListingsFound: listings.length,
    totalKeywords: keywords.filter((k) => k.enabled).length,
  };
}

export function getKeywords(): KeywordEntry[] {
  return keywords;
}

export function getSettings(): Settings {
  return settings;
}

export function updateSettings(newSettings: Partial<Settings>): Settings {
  const oldInterval = settings.scanIntervalMinutes;
  settings = { ...settings, ...newSettings };

  if (newSettings.scanIntervalMinutes && newSettings.scanIntervalMinutes !== oldInterval) {
    scanStatus.scanIntervalMinutes = settings.scanIntervalMinutes;
    scheduleScans(); // reschedule with new interval
  }

  if (typeof newSettings.autoScanEnabled !== 'undefined') {
    scheduleScans();
  }

  return settings;
}

export function addKeyword(keyword: string, category: string): KeywordEntry {
  const entry: KeywordEntry = {
    id: `custom_${Date.now()}`,
    keyword: keyword.toLowerCase().trim(),
    category,
    enabled: true,
    isCustom: true,
    estimatedMarketValue: 0,
  };
  keywords.push(entry);
  return entry;
}

export function removeKeyword(id: string): boolean {
  const idx = keywords.findIndex((k) => k.id === id);
  if (idx === -1) return false;
  keywords.splice(idx, 1);
  return true;
}

export function toggleKeyword(id: string, enabled: boolean): boolean {
  const entry = keywords.find((k) => k.id === id);
  if (!entry) return false;
  entry.enabled = enabled;
  return true;
}

export function clearNewFlags(): void {
  listings = listings.map((l) => ({ ...l, isNew: false }));
}
