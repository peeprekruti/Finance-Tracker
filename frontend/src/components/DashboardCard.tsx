import React from "react";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
}: DashboardCardProps) {
  return (
    <div className="bg-[var(--color-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)] flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[var(--color-muted)] text-sm font-medium">{title}</h3>
        <div className="p-2 rounded-full bg-white/5 opacity-80">
          <Icon className="w-5 h-5 text-[var(--color-accent-blue)]" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                trend === "up"
                  ? "bg-red-500/10 text-red-400"
                  : trend === "down"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-gray-500/10 text-gray-400"
              }`}
            >
              {trendValue}
            </span>
          )}
          {subtitle && <p className="text-xs text-[var(--color-muted)]">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
