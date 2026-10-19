import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: 'coral' | 'teal' | 'amber' | 'slate';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'slate',
  onClick,
}) => {
  const accentClasses = {
    coral: 'border-[#ff5733]/30 hover:border-[#ff5733]/60 group-hover:text-[#ff5733]',
    teal: 'border-teal-500/30 hover:border-teal-500/60 group-hover:text-teal-400',
    amber: 'border-amber-500/30 hover:border-amber-500/60 group-hover:text-amber-400',
    slate: 'border-slate-800/80 hover:border-slate-700 group-hover:text-slate-300',
  };

  const iconBgClasses = {
    coral: 'bg-[#ff5733]/10 text-[#ff5733]',
    teal: 'bg-teal-500/10 text-teal-400',
    amber: 'bg-amber-500/10 text-amber-400',
    slate: 'bg-slate-800/60 text-slate-400',
  };

  return (
    <motion.div
      whileHover={onClick ? { y: -2, transition: { duration: 0.15 } } : undefined}
      onClick={onClick}
      className={`group relative rounded-xl bg-[#0c1220]/80 backdrop-blur-sm border p-4 sm:p-5 transition-all shadow-sm ${accentClasses[accentColor]} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {label}
          </span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-semibold text-slate-400">{unit}</span>
            )}
          </div>
        </div>

        <div className={`p-2.5 rounded-lg ${iconBgClasses[accentColor]} transition-colors`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={`font-medium ${
                trend.isPositive ? 'text-teal-400' : 'text-amber-400'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
