import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { ListingFilters } from '../types';

const SORT_OPTIONS = [
  { value: 'endTime', label: 'Ending Soonest' },
  { value: 'foundAt', label: 'Recently Found' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'bids_asc', label: 'Fewest Bids First' },
];

const CATEGORIES = [
  'all',
  'Electronics',
  'Gaming',
  'Cameras',
  'Watches',
  'Collectibles',
  'Sneakers',
  'Fashion',
  'Instruments',
  'Jewelry',
  'Custom',
];

interface FilterPanelProps {
  filters: ListingFilters;
  onChange: (filters: Partial<ListingFilters>) => void;
  total: number;
}

export default function FilterPanel({ filters, onChange, total }: FilterPanelProps) {
  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.maxBids !== '' ||
    filters.maxPrice !== '' ||
    filters.minPrice !== '' ||
    filters.query !== '';

  const clearFilters = () => {
    onChange({
      category: 'all',
      maxBids: '',
      maxPrice: '',
      minPrice: '',
      query: '',
      sort: 'endTime',
    });
  };

  return (
    <div className="card p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-ink-100" />
          <span className="text-sm font-medium text-ink-200">Filters</span>
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn-ghost py-1 text-xs gap-1">
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
        <input
          type="text"
          placeholder="Search titles..."
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
          className="input pl-8"
        />
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-medium text-ink-200 mb-1.5">Sort by</label>
        <div className="relative">
          <select
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value })}
            className="select"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-ink-200 mb-1.5">Category</label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ category: cat })}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors duration-100 ${
                filters.category === cat
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-ink-200 border-surface-300 hover:border-brand-400 hover:text-brand-600'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-medium text-ink-200 mb-1.5">Price Range ($)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={filters.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            className="input w-full"
          />
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            className="input w-full"
          />
        </div>
      </div>

      {/* Max bids */}
      <div>
        <label className="block text-xs font-medium text-ink-200 mb-1.5">Max Bid Count</label>
        <input
          type="number"
          placeholder="e.g. 0 for zero bids"
          min={0}
          value={filters.maxBids}
          onChange={(e) => onChange({ maxBids: e.target.value })}
          className="input"
        />
      </div>

      {/* Results count */}
      <div className="pt-1 border-t border-surface-200">
        <p className="text-xs text-ink-100">
          <span className="font-semibold text-ink-300">{total}</span> listing
          {total !== 1 ? 's' : ''} found
        </p>
      </div>
    </div>
  );
}
