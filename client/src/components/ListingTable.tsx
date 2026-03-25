import { ExternalLink, Clock, Gavel } from 'lucide-react';
import { formatDistanceToNow, isPast, differenceInHours } from 'date-fns';
import type { EbayListing } from '../types';

interface ListingTableProps {
  listings: EbayListing[];
}

function TimeCell({ endTime }: { endTime: string }) {
  const end = new Date(endTime);
  if (isPast(end)) return <span className="badge-gray">Ended</span>;
  const hours = differenceInHours(end, new Date());
  const label = formatDistanceToNow(end, { addSuffix: true });
  if (hours < 2) return <span className="badge-red">{label}</span>;
  if (hours < 6) return <span className="badge-orange">{label}</span>;
  return <span className="text-ink-100 text-xs">{label}</span>;
}

export default function ListingTable({ listings }: ListingTableProps) {
  if (listings.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-ink-100">No listings match your filters.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-100 uppercase tracking-wider w-12" />
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-100 uppercase tracking-wider">
                Title
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-100 uppercase tracking-wider whitespace-nowrap">
                Searched As
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-ink-100 uppercase tracking-wider">
                Price
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-ink-100 uppercase tracking-wider">
                Bids
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-100 uppercase tracking-wider">
                Ends
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-ink-100 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {listings.map((listing) => (
              <tr
                key={listing.itemId}
                className="hover:bg-surface-50 transition-colors duration-100 group"
              >
                {/* Thumbnail */}
                <td className="px-4 py-3">
                  {listing.galleryUrl ? (
                    <img
                      src={listing.galleryUrl}
                      alt=""
                      className="w-10 h-10 object-contain rounded bg-surface-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-surface-100" />
                  )}
                </td>

                {/* Title */}
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-ink-300 font-medium line-clamp-2 leading-snug">
                    {listing.title}
                  </p>
                  {listing.isNew && (
                    <span className="badge-blue text-[10px] mt-1 inline-block">New</span>
                  )}
                </td>

                {/* Searched keyword */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-brand-600 font-medium text-xs">{listing.searchedKeyword}</p>
                  <p className="text-ink-100 text-xs">← {listing.originalKeyword}</p>
                </td>

                {/* Price */}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <span className="font-semibold text-ink-300">
                    ${listing.currentPrice.toFixed(2)}
                  </span>
                </td>

                {/* Bids */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Gavel className="w-3 h-3 text-ink-100" />
                    <span
                      className={
                        listing.bidCount === 0
                          ? 'text-deal-green font-medium'
                          : 'text-ink-200'
                      }
                    >
                      {listing.bidCount}
                    </span>
                  </div>
                </td>

                {/* End time */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <TimeCell endTime={listing.endTime} />
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  <span className="badge-gray">{listing.category}</span>
                </td>

                {/* Link */}
                <td className="px-4 py-3">
                  <a
                    href={listing.viewItemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
