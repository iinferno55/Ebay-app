import { useQuery } from '@tanstack/react-query';
import {
  Package,
  Gavel,
  Clock,
  DollarSign,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { listingsApi, statusApi } from '../services/api';
import StatCard from '../components/StatCard';
import ListingCard from '../components/ListingCard';
import ScanProgress from '../components/ScanProgress';
import Header from '../components/Header';
import type { StatsData, ScanStatus, EbayListing } from '../types';

export default function Dashboard() {
  const { data: stats } = useQuery<StatsData>({
    queryKey: ['stats'],
    queryFn: listingsApi.getStats,
    refetchInterval: 15_000,
  });

  const { data: status } = useQuery<ScanStatus>({
    queryKey: ['status'],
    queryFn: statusApi.get,
    refetchInterval: 5_000,
  });

  const { data: listingsData } = useQuery<{ listings: EbayListing[]; total: number }>({
    queryKey: ['listings', 'dashboard'],
    queryFn: () => listingsApi.get({ sort: 'endTime', maxBids: '2' }),
    refetchInterval: 30_000,
  });

  const recentListings = listingsData?.listings.slice(0, 8) ?? [];

  // Top categories
  const topCategories = stats
    ? Object.entries(stats.categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  const maxCategoryCount = topCategories[0]?.[1] ?? 1;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        subtitle="Overview of all misspelled eBay auction listings"
      />

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Listings"
            value={stats?.totalListings ?? 0}
            icon={Package}
            iconColor="text-brand-500"
            iconBg="bg-brand-50"
          />
          <StatCard
            label="0–1 Bid Deals"
            value={stats?.zeroOrOneBid ?? 0}
            icon={TrendingDown}
            iconColor="text-deal-green"
            iconBg="bg-deal-greenBg"
            trend={
              stats && stats.totalListings > 0
                ? {
                    value: `${Math.round((stats.zeroOrOneBid / stats.totalListings) * 100)}%`,
                    positive: true,
                  }
                : undefined
            }
          />
          <StatCard
            label="Ending < 6h"
            value={stats?.endingSoon ?? 0}
            icon={Clock}
            iconColor="text-deal-orange"
            iconBg="bg-deal-orangeBg"
          />
          <StatCard
            label="Average Price"
            value={stats ? `$${stats.averagePrice.toFixed(2)}` : '—'}
            icon={DollarSign}
            iconColor="text-ink-200"
            iconBg="bg-surface-100"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Recent listings */}
          <div className="col-span-3 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-ink-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                Best Opportunities
              </h2>
              <a href="/listings" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
                View all →
              </a>
            </div>

            {recentListings.length === 0 ? (
              <div className="card p-12 text-center">
                <Gavel className="w-8 h-8 text-surface-400 mx-auto mb-3" />
                <p className="text-ink-200 font-medium">No listings yet</p>
                <p className="text-ink-100 text-sm mt-1">
                  Click "Scan Now" to start finding misspelled eBay auctions
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recentListings.map((listing) => (
                  <ListingCard key={listing.itemId} listing={listing} />
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="col-span-3 lg:col-span-1 space-y-4">
            {/* Scanner status */}
            {status && <ScanProgress status={status} />}

            {/* Category breakdown */}
            {topCategories.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-ink-300 mb-4">By Category</h3>
                <div className="space-y-3">
                  {topCategories.map(([cat, count]) => (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-ink-200 font-medium">{cat}</span>
                        <span className="text-ink-100">{count}</span>
                      </div>
                      <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-400 rounded-full transition-all duration-500"
                          style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
