import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Key,
  Clock,
  Tags,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { settingsApi, keywordsApi } from '../services/api';
import Header from '../components/Header';
import type { AppSettings, KeywordEntry } from '../types';

const SCAN_INTERVALS = [
  { value: 30, label: 'Every 30 minutes' },
  { value: 60, label: 'Every hour' },
  { value: 120, label: 'Every 2 hours' },
  { value: 240, label: 'Every 4 hours' },
  { value: 480, label: 'Every 8 hours' },
];

const KEYWORD_CATEGORIES = [
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

export default function Settings() {
  const queryClient = useQueryClient();

  // Settings
  const { data: settings } = useQuery<AppSettings>({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  // Keywords
  const { data: keywords = [] } = useQuery<KeywordEntry[]>({
    queryKey: ['keywords'],
    queryFn: keywordsApi.get,
  });

  // API key validation
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');

  const testApiKey = async () => {
    if (!apiKeyInput.trim()) return;
    setApiKeyStatus('testing');
    const result = await settingsApi.validateApiKey(apiKeyInput.trim());
    setApiKeyStatus(result.valid ? 'valid' : 'invalid');
  };

  // Settings mutation
  const { mutate: saveSettings } = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  // Keyword mutations
  const [newKeyword, setNewKeyword] = useState('');
  const [newKeywordCategory, setNewKeywordCategory] = useState('Custom');

  const { mutate: addKeyword, isPending: isAdding } = useMutation({
    mutationFn: ({ keyword, category }: { keyword: string; category: string }) =>
      keywordsApi.add(keyword, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      setNewKeyword('');
    },
  });

  const { mutate: removeKeyword } = useMutation({
    mutationFn: keywordsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['keywords'] }),
  });

  const { mutate: toggleKeyword } = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      keywordsApi.toggle(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['keywords'] }),
  });

  const customKeywords = keywords.filter((k) => k.isCustom);
  const defaultKeywords = keywords.filter((k) => !k.isCustom);

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Configure your eBay Hunter" />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl space-y-6">

          {/* API Key */}
          <section className="card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-brand-500" />
              <h2 className="text-base font-semibold text-ink-300">eBay API Key</h2>
            </div>
            <p className="text-sm text-ink-100 mb-4">
              Required to search eBay listings. Get a free App ID at{' '}
              <a
                href="https://developer.ebay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-500 hover:underline"
              >
                developer.ebay.com
              </a>
            </p>

            {settings?.hasApiKey && (
              <div className="flex items-center gap-2 mb-3 p-3 bg-deal-greenBg rounded-lg border border-deal-green/20">
                <CheckCircle className="w-4 h-4 text-deal-green flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-deal-green">API key is configured</p>
                  <p className="text-xs text-ink-100">{settings.appIdMasked}</p>
                </div>
              </div>
            )}

            <p className="text-xs text-ink-100 mb-3 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-deal-orange" />
              To change your API key, update <code className="bg-surface-100 px-1 rounded">EBAY_APP_ID</code> in
              your <code className="bg-surface-100 px-1 rounded">.env</code> file and restart the server.
              Use the field below to validate a key before adding it.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste App ID to test..."
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setApiKeyStatus('idle');
                }}
                className="input flex-1 font-mono text-xs"
              />
              <button
                onClick={testApiKey}
                disabled={!apiKeyInput.trim() || apiKeyStatus === 'testing'}
                className="btn-secondary whitespace-nowrap"
              >
                {apiKeyStatus === 'testing' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Test Key'
                )}
              </button>
            </div>

            {apiKeyStatus === 'valid' && (
              <p className="text-sm text-deal-green flex items-center gap-1.5 mt-2">
                <CheckCircle className="w-4 h-4" />
                Valid! Add this to your .env file as EBAY_APP_ID
              </p>
            )}
            {apiKeyStatus === 'invalid' && (
              <p className="text-sm text-deal-red flex items-center gap-1.5 mt-2">
                <XCircle className="w-4 h-4" />
                Invalid App ID. Check that you're using a Production key.
              </p>
            )}
          </section>

          {/* Scan Settings */}
          <section className="card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-brand-500" />
              <h2 className="text-base font-semibold text-ink-300">Scan Settings</h2>
            </div>
            <p className="text-sm text-ink-100 mb-4">
              Control how often eBay is scanned for misspelled listings.
            </p>

            <div className="space-y-4">
              {/* Auto scan toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-300">Auto-scan enabled</p>
                  <p className="text-xs text-ink-100">Automatically scan on a schedule</p>
                </div>
                <button
                  onClick={() =>
                    settings && saveSettings({ autoScanEnabled: !settings.autoScanEnabled })
                  }
                  className="text-brand-500 hover:text-brand-600 transition-colors"
                >
                  {settings?.autoScanEnabled ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-surface-400" />
                  )}
                </button>
              </div>

              {/* Scan interval */}
              <div>
                <label className="block text-sm font-medium text-ink-300 mb-1.5">
                  Scan frequency
                </label>
                <div className="relative">
                  <select
                    value={settings?.scanIntervalMinutes ?? 120}
                    onChange={(e) => saveSettings({ scanIntervalMinutes: Number(e.target.value) })}
                    className="select"
                    disabled={!settings?.autoScanEnabled}
                  >
                    {SCAN_INTERVALS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-ink-100 mt-1.5">
                  eBay allows 5,000 API calls/day. One full scan uses ~{keywords.filter(k=>k.enabled).length * 10} calls.
                </p>
              </div>
            </div>
          </section>

          {/* Custom Keywords */}
          <section className="card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Tags className="w-4 h-4 text-brand-500" />
              <h2 className="text-base font-semibold text-ink-300">Custom Keywords</h2>
            </div>
            <p className="text-sm text-ink-100 mb-4">
              Add your own keywords to scan for misspellings.
            </p>

            {/* Add new keyword */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="e.g. vintage rolex"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newKeyword.trim()) {
                    addKeyword({ keyword: newKeyword.trim(), category: newKeywordCategory });
                  }
                }}
                className="input flex-1"
              />
              <select
                value={newKeywordCategory}
                onChange={(e) => setNewKeywordCategory(e.target.value)}
                className="select w-36"
              >
                {KEYWORD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (newKeyword.trim()) {
                    addKeyword({ keyword: newKeyword.trim(), category: newKeywordCategory });
                  }
                }}
                disabled={!newKeyword.trim() || isAdding}
                className="btn-primary px-3"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Custom keywords list */}
            {customKeywords.length > 0 && (
              <div className="space-y-1 mb-4">
                <p className="text-xs font-medium text-ink-100 uppercase tracking-wider mb-2">
                  Custom ({customKeywords.length})
                </p>
                {customKeywords.map((k) => (
                  <KeywordRow
                    key={k.id}
                    entry={k}
                    onToggle={(enabled) => toggleKeyword({ id: k.id, enabled })}
                    onRemove={() => removeKeyword(k.id)}
                  />
                ))}
              </div>
            )}

            {/* Default keywords */}
            <details className="group">
              <summary className="cursor-pointer text-xs font-medium text-ink-100 uppercase tracking-wider hover:text-ink-200 py-1 select-none">
                Default Keywords ({defaultKeywords.length}) ▸
              </summary>
              <div className="mt-2 space-y-1 max-h-72 overflow-y-auto">
                {defaultKeywords.map((k) => (
                  <KeywordRow
                    key={k.id}
                    entry={k}
                    onToggle={(enabled) => toggleKeyword({ id: k.id, enabled })}
                  />
                ))}
              </div>
            </details>
          </section>
        </div>
      </div>
    </div>
  );
}

function KeywordRow({
  entry,
  onToggle,
  onRemove,
}: {
  entry: KeywordEntry;
  onToggle: (enabled: boolean) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface-50 group/row">
      <button
        onClick={() => onToggle(!entry.enabled)}
        className={`transition-colors ${entry.enabled ? 'text-brand-500' : 'text-surface-400'}`}
      >
        {entry.enabled ? (
          <ToggleRight className="w-5 h-5" />
        ) : (
          <ToggleLeft className="w-5 h-5" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <span
          className={`text-sm font-medium ${entry.enabled ? 'text-ink-300' : 'text-ink-100 line-through'}`}
        >
          {entry.keyword}
        </span>
      </div>
      <span className="badge-gray text-[11px]">{entry.category}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover/row:opacity-100 btn-ghost p-1 text-deal-red hover:bg-deal-redBg transition-opacity"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
