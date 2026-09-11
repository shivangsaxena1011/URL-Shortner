"use client";

import { useMemo } from "react";

interface BreakdownItem {
  name: string;
  value: number;
}

interface BreakdownChartProps {
  title: string;
  data: BreakdownItem[];
  emptyMessage?: string;
}

export function BreakdownChart({
  title,
  data,
  emptyMessage = "No analytics data yet.",
}: BreakdownChartProps) {
  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <div className="h-40 flex items-center justify-center text-center">
          <p className="text-xs text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Pre-defined modern palette
  const colors = ["bg-primary", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-slate-400"];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <span className="text-xs text-muted-foreground">{total} total</span>
      </div>

      {/* Progress Multi-bar */}
      <div className="w-full h-3 rounded-full bg-muted overflow-hidden flex">
        {data.map((item, idx) => {
          const percentage = (item.value / total) * 100;
          return (
            <div
              key={item.name}
              className={`${colors[idx % colors.length]} transition-all`}
              style={{ width: `${percentage}%` }}
              title={`${item.name}: ${item.value} (${Math.round(percentage)}%)`}
            />
          );
        })}
      </div>

      {/* Breakdown Items List */}
      <div className="space-y-2.5 pt-1">
        {data.map((item, idx) => {
          const percentage = Math.round((item.value / total) * 100);
          return (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors[idx % colors.length]}`} />
                <span className="font-medium text-foreground truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-muted-foreground font-mono">
                <span>{item.value}</span>
                <span className="w-8 text-right text-[11px]">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
