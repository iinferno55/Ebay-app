import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { statusApi } from '../services/api';
import type { ScanStatus } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const queryClient = useQueryClient();

  const { data: status } = useQuery<ScanStatus>({
    queryKey: ['status'],
    queryFn: statusApi.get,
    refetchInterval: 5000, // poll every 5 seconds
  });

  const { mutate: triggerScan, isPending: isTriggering } = useMutation({
    mutationFn: statusApi.triggerScan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] });
    },
  });

  const isScanning = status?.isScanning || isTriggering;

  return (
    <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-surface-200">
      <div>
        <h1 className="text-xl font-semibold text-ink-300">{title}</h1>
        {subtitle && <p className="text-sm text-ink-100 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Scan status indicator */}
        {status && (
          <div className="flex items-center gap-2">
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                <span className="text-sm text-ink-100">
                  Scanning {status.keywordsScanned}/{status.totalKeywords} keywords...
                </span>
              </>
            ) : status.lastScanAt ? (
              <>
                <CheckCircle className="w-4 h-4 text-deal-green" />
                <span className="text-sm text-ink-100">
                  Last scan{' '}
                  {formatDistanceToNow(new Date(status.lastScanAt), { addSuffix: true })}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-deal-orange" />
                <span className="text-sm text-ink-100">No scans yet</span>
              </>
            )}
          </div>
        )}

        {/* Scan button */}
        <button
          onClick={() => triggerScan()}
          disabled={isScanning}
          className="btn-primary"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Scan Now'}
        </button>
      </div>
    </header>
  );
}
