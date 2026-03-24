import { Loader2, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { ScanStatus } from '../types';

interface ScanProgressProps {
  status: ScanStatus;
}

export default function ScanProgress({ status }: ScanProgressProps) {
  const progress =
    status.totalKeywords > 0
      ? Math.round((status.keywordsScanned / status.totalKeywords) * 100)
      : 0;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink-300 flex items-center gap-2">
          {status.isScanning ? (
            <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
          ) : status.lastScanAt ? (
            <CheckCircle2 className="w-4 h-4 text-deal-green" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-deal-orange" />
          )}
          Scanner Status
        </h3>
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${
              status.isScanning ? 'bg-brand-500 animate-pulse' : 'bg-deal-green'
            }`}
          />
          <span className="text-xs text-ink-100">{status.isScanning ? 'Active' : 'Idle'}</span>
        </div>
      </div>

      {/* Progress bar */}
      {status.isScanning && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-ink-100 mb-1.5">
            <span>
              {status.keywordsScanned} / {status.totalKeywords} keywords
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-ink-100 mt-1.5">
            {status.apiCallsUsed} API calls used this scan
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-50 rounded-lg p-3">
          <p className="text-xs text-ink-100 mb-0.5">Last Scan</p>
          <p className="text-sm font-medium text-ink-300">
            {status.lastScanAt
              ? formatDistanceToNow(new Date(status.lastScanAt), { addSuffix: true })
              : '—'}
          </p>
        </div>
        <div className="bg-surface-50 rounded-lg p-3">
          <p className="text-xs text-ink-100 mb-0.5">Next Scan</p>
          <p className="text-sm font-medium text-ink-300">
            {status.nextScanAt
              ? formatDistanceToNow(new Date(status.nextScanAt), { addSuffix: true })
              : '—'}
          </p>
        </div>
        <div className="bg-surface-50 rounded-lg p-3">
          <p className="text-xs text-ink-100 mb-0.5">Scan Interval</p>
          <p className="text-sm font-medium text-ink-300 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Every {status.scanIntervalMinutes}m
          </p>
        </div>
        <div className="bg-surface-50 rounded-lg p-3">
          <p className="text-xs text-ink-100 mb-0.5">Total Found</p>
          <p className="text-sm font-medium text-ink-300">{status.totalListingsFound}</p>
        </div>
      </div>
    </div>
  );
}
