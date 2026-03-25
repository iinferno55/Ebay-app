import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, List } from 'lucide-react';
import { listingsApi } from '../services/api';
import Header from '../components/Header';
import FilterPanel from '../components/FilterPanel';
import ListingCard from '../components/ListingCard';
import ListingTable from '../components/ListingTable';
import type { EbayListing, ViewMode, ListingFilters } from '../types';

const DEFAULT_FILTERS: ListingFilters = {
  category: 'all',
  maxBids: '',
  maxPrice: '',
  minPrice: '',
  minFlipProfit: '',
  query: '',
  sort: 'profit_desc',
};

export default function Listings() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filters, setFilters] = useState<ListingFilters>(DEFAULT_FILTERS);

  const { data, isLoading, isError } = useQuery<{ listings: EbayListing[]; total: number }>({
    queryKey: ['listings', filters],
    queryFn: () =>
      listingsApi.get({
        category: filters.category !== 'all' ? filters.category : undefined,
        maxBids: filters.maxBids || undefined,
        maxPrice: filters.maxPrice || undefined,
        minPrice: filters.minPrice || undefined,
        minFlipProfit: filters.minFlipProfit || undefined,
        query: filters.query || undefined,
        sort: filters.sort,
      }),
    refetchInterval: 30_000,
  });

  const listings = data?.listings ?? [];
  const total = data?.total ?? 0;

  const updateFilters = (partial: Partial<ListingFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Listings"
        subtitle="All misspelled auction listings found automatically"
      />

      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar filters */}
        <aside className="w-[240px] flex-shrink-0 overflow-y-auto p-4 border-r border-surface-200 bg-white">
          <FilterPanel filters={filters} onChange={updateFilters} total={total} />
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-ink-100">
              <span className="font-semibold text-ink-300">{total}</span> listing
              {total !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-brand-500'
                    : 'text-ink-100 hover:text-ink-200'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white shadow-sm text-brand-500'
                    : 'text-ink-100 hover:text-ink-200'
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-ink-100">Loading listings...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="card p-12 text-center">
              <p className="text-deal-red font-medium">Failed to load listings</p>
              <p className="text-ink-100 text-sm mt-1">Check that the server is running.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.itemId} listing={listing} />
              ))}
              {listings.length === 0 && (
                <div className="col-span-full card p-12 text-center">
                  <p className="text-ink-100">No listings found. Try adjusting your filters or run a scan.</p>
                </div>
              )}
            </div>
          ) : (
            <ListingTable listings={listings} />
          )}
        </div>
      </div>
    </div>
  );
}
