export interface EbayListing {
  itemId: string;
  title: string;
  currentPrice: number;
  currency: string;
  bidCount: number;
  endTime: string;
  galleryUrl: string;
  viewItemUrl: string;
  condition: string;
  location: string;
  searchedKeyword: string;
  originalKeyword: string;
  category: string;
  foundAt: string;
  isNew: boolean;
  estimatedMarketValue: number;
  estimatedProfit: number;
}

export interface KeywordEntry {
  id: string;
  keyword: string;
  category: string;
  enabled: boolean;
  isCustom: boolean;
  estimatedMarketValue: number;
}

export interface ScanStatus {
  isScanning: boolean;
  lastScanAt: string | null;
  nextScanAt: string | null;
  totalListingsFound: number;
  keywordsScanned: number;
  totalKeywords: number;
  scanIntervalMinutes: number;
  apiCallsUsed: number;
}

export interface StatsData {
  totalListings: number;
  zeroOrOneBid: number;
  endingSoon: number;
  averagePrice: number;
  categories: Record<string, number>;
  newSinceLastVisit: number;
}

export interface Settings {
  scanIntervalMinutes: number;
  maxBidFilter: number;
  maxPriceFilter: number;
  minPriceFilter: number;
  autoScanEnabled: boolean;
  minFlipProfit: number;
}
