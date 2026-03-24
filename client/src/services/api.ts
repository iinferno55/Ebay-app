import axios from 'axios';
import type {
  EbayListing,
  KeywordEntry,
  ScanStatus,
  StatsData,
  AppSettings,
  ListingFilters,
} from '../types';

const api = axios.create({ baseURL: '/api' });

export const statusApi = {
  get: () => api.get<ScanStatus>('/status').then((r) => r.data),
  triggerScan: () => api.post<{ message: string; status: ScanStatus }>('/scan').then((r) => r.data),
};

export const listingsApi = {
  get: (filters?: Partial<ListingFilters>) =>
    api
      .get<{ listings: EbayListing[]; total: number }>('/listings', { params: filters })
      .then((r) => r.data),
  getStats: () => api.get<StatsData>('/listings/stats').then((r) => r.data),
};

export const keywordsApi = {
  get: () => api.get<KeywordEntry[]>('/keywords').then((r) => r.data),
  add: (keyword: string, category: string) =>
    api.post<KeywordEntry>('/keywords', { keyword, category }).then((r) => r.data),
  remove: (id: string) => api.delete(`/keywords/${id}`).then((r) => r.data),
  toggle: (id: string, enabled: boolean) =>
    api.patch(`/keywords/${id}`, { enabled }).then((r) => r.data),
};

export const settingsApi = {
  get: () => api.get<AppSettings>('/settings').then((r) => r.data),
  update: (settings: Partial<AppSettings>) =>
    api.patch<AppSettings>('/settings', settings).then((r) => r.data),
  validateApiKey: (appId: string) =>
    api.post<{ valid: boolean }>('/settings/validate-api-key', { appId }).then((r) => r.data),
};
