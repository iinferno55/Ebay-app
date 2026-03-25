import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: string; positive?: boolean };
  suffix?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-brand-500',
  iconBg = 'bg-brand-50',
  trend,
  suffix,
}: StatCardProps) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.positive
                ? 'bg-deal-greenBg text-deal-green'
                : 'bg-deal-orangeBg text-deal-orange'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold text-ink-300">
          {value}
          {suffix && <span className="text-base font-normal text-ink-100 ml-1">{suffix}</span>}
        </p>
        <p className="text-sm text-ink-100 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
