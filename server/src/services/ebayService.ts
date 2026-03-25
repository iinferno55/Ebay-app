import axios from 'axios';
import { EbayListing } from '../types.js';

const EBAY_FINDING_API = 'https://svcs.ebay.com/services/search/FindingService/v1';

interface EbayFindingItem {
  itemId: string[];
  title: string[];
  viewItemURL: string[];
  galleryURL?: string[];
  location: string[];
  condition?: { conditionDisplayName: string[] }[];
  sellingStatus: {
    currentPrice: { __value__: string; '@currencyId': string }[];
    bidCount?: string[];
    listingStatus: string[];
  }[];
  listingInfo: {
    endTime: string[];
    listingType: string[];
  }[];
  primaryCategory: { categoryName: string[] }[];
}

interface EbayFindingResponse {
  findItemsByKeywordsResponse?: {
    ack: string[];
    searchResult?: {
      '@count': string;
      item?: EbayFindingItem[];
    }[];
    errorMessage?: { error: { message: string[] }[] }[];
  }[];
}

export async function searchEbayMisspelling(
  keyword: string,
  originalKeyword: string,
  category: string,
  appId: string,
  estimatedMarketValue: number
): Promise<EbayListing[]> {
  try {
    const params = new URLSearchParams({
      'OPERATION-NAME': 'findItemsByKeywords',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': appId,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': '',
      keywords: keyword,
      'itemFilter(0).name': 'ListingType',
      'itemFilter(0).value(0)': 'Auction',
      'itemFilter(0).value(1)': 'AuctionWithBIN',
      sortOrder: 'EndTimeSoonest',
      'paginationInput.entriesPerPage': '50',
      'outputSelector(0)': 'GalleryInfo',
    });

    const response = await axios.get<EbayFindingResponse>(
      `${EBAY_FINDING_API}?${params.toString()}`,
      { timeout: 10000 }
    );

    const data = response.data;
    const findResponse = data.findItemsByKeywordsResponse?.[0];

    if (!findResponse || findResponse.ack[0] !== 'Success') {
      return [];
    }

    const items = findResponse.searchResult?.[0]?.item ?? [];
    const now = new Date().toISOString();

    return items.map((item): EbayListing => {
      const selling = item.sellingStatus[0];
      const listing = item.listingInfo[0];
      const priceData = selling.currentPrice[0];

      return {
        itemId: item.itemId[0],
        title: item.title[0],
        currentPrice: parseFloat(priceData.__value__) || 0,
        currency: priceData['@currencyId'] || 'USD',
        bidCount: parseInt(selling.bidCount?.[0] ?? '0', 10),
        endTime: listing.endTime[0],
        galleryUrl: item.galleryURL?.[0] ?? '',
        viewItemUrl: item.viewItemURL[0],
        condition: item.condition?.[0]?.conditionDisplayName?.[0] ?? 'Not Specified',
        location: item.location[0],
        searchedKeyword: keyword,
        originalKeyword,
        category,
        foundAt: now,
        isNew: true,
        estimatedMarketValue,
        estimatedProfit: Math.round(estimatedMarketValue * 0.87 - 15 - (parseFloat(priceData.__value__) || 0)),
      };
    });
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      console.warn('[eBay] Rate limited, backing off...');
      await new Promise((r) => setTimeout(r, 5000));
    }
    return [];
  }
}

export async function validateAppId(appId: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      'OPERATION-NAME': 'findItemsByKeywords',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': appId,
      'RESPONSE-DATA-FORMAT': 'JSON',
      keywords: 'iphone',
      'paginationInput.entriesPerPage': '1',
    });
    const res = await axios.get<EbayFindingResponse>(
      `${EBAY_FINDING_API}?${params.toString()}`,
      { timeout: 8000 }
    );
    const ack = res.data.findItemsByKeywordsResponse?.[0]?.ack?.[0];
    return ack === 'Success';
  } catch {
    return false;
  }
}
