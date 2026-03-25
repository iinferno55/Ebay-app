import { ExternalLink, Clock, Gavel, MapPin, Tag, TrendingUp } from 'lucide-react';
import { formatDistanceToNow, isPast, differenceInHours } from 'date-fns';
import type { EbayListing } from '../types';

interface ListingCardProps {
  listing: EbayListing;
}

function highlightMisspelling(title: string, searchedKeyword: string): React.ReactNode {
  const keyword = searchedKeyword.toLowerCase();
  const titleLower = title.toLowerCase();
  const idx = titleLower.indexOf(keyword);
  if (idx === -1) return title;

  return (
    <>
      {title.slice(0, idx)}
      <mark className="bg-brand-100 text-brand-700 rounded px-0.5 not-italic">
        {title.slice(idx, idx + keyword.length)}
      </mark>
      {title.slice(idx + keyword.length)}
    </>
  );
}

function getTimeStatus(endTime: string): { label: string; className: string } {
  const end = new Date(endTime);
  if (isPast(end)) return { label: 'Ended', className: 'badge-gray' };
  const hours = differenceInHours(end, new Date());
  if (hours < 2) return { label: `< 2h left`, className: 'badge-red' };
  if (hours < 6) return { label: `< 6h left`, className: 'badge-orange' };
  return {
    label: formatDistanceToNow(end, { addSuffix: true }),
    className: 'badge-gray',
  };
}

function getProfitStyle(profit: number): { className: string; label: string } {
  if (profit >= 200) return { className: 'bg-green-100 text-green-700 border border-green-200', label: 'Est. Profit' };
  if (profit >= 100) return { className: 'bg-emerald-50 text-emerald-600 border border-emerald-200', label: 'Est. Profit' };
  if (profit >= 50) return { className: 'bg-yellow-50 text-yellow-700 border border-yellow-200', label: 'Est. Profit' };
  return { className: 'bg-red-50 text-red-500 border border-red-200', label: 'Est. Profit' };
}

export default function ListingCard({ listing }: ListingCardProps) {
  const timeStatus = getTimeStatus(listing.endTime);
  const hasImage = listing.galleryUrl && listing.galleryUrl.length > 0;
  const profitStyle = getProfitStyle(listing.estimatedProfit);

  return (
    <div className="card overflow-hidden hover:shadow-cardHover transition-shadow duration-200 animate-fade-in flex flex-col">
      {/* Image */}
      <div className="relative bg-surface-100 h-44 overflow-hidden">
        {hasImage ? (
          <img
            src={listing.galleryUrl}
            alt={listing.title}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag className="w-8 h-8 text-surface-400" />
          </div>
        )}
        {listing.isNew && (
          <div className="absolute top-2 left-2">
            <span className="badge badge-blue text-[10px]">New</span>
          </div>
        )}
        <div className={`absolute top-2 right-2 ${timeStatus.className} text-[11px]`}>
          {timeStatus.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-xs text-ink-100 mb-1">
            Searched: <span className="font-medium text-brand-600">{listing.searchedKeyword}</span>
            {' '}→ orig: <span className="text-ink-200">{listing.originalKeyword}</span>
          </p>
          <h3 className="text-[13px] font-medium text-ink-300 leading-snug line-clamp-2">
            {highlightMisspelling(listing.title, listing.searchedKeyword)}
          </h3>
        </div>

        {/* Profit banner */}
        <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${profitStyle.className}`}>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{profitStyle.label}</span>
          </div>
          <span className="text-sm font-bold">
            {listing.estimatedProfit >= 0 ? '+' : ''}${listing.estimatedProfit}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-auto">
          <div>
            <p className="text-lg font-semibold text-ink-300">
              {listing.currency === 'USD' ? '$' : listing.currency}
              {listing.currentPrice.toFixed(2)}
            </p>
            <p className="text-xs text-ink-100 flex items-center gap-1">
              <Gavel className="w-3 h-3" />
              {listing.bidCount === 0 ? 'No bids' : `${listing.bidCount} bid${listing.bidCount !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="ml-auto flex flex-col items-end gap-1 text-right">
            <span className="text-xs text-ink-100">
              Market: <span className="font-medium text-ink-200">${listing.estimatedMarketValue}</span>
            </span>
            <span className="badge-gray text-[11px]">{listing.category}</span>
          </div>
        </div>

        <a
          href={listing.viewItemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary w-full justify-center text-[13px]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View on eBay
        </a>
      </div>
    </div>
  );
}
