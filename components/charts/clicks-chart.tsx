"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface ClicksChartProps {
  data: { date: string; clicks: number }[];
}

export function ClicksChart({ data }: ClicksChartProps) {
  const hasData = data && data.some((d) => d.clicks > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl bg-card">
        <p className="text-sm font-medium text-muted-foreground">No clicks recorded yet.</p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Share your link to start tracking traffic and click activity over time.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                    <p className="font-semibold text-popover-foreground">{label}</p>
                    <p className="text-primary font-mono">{payload[0].value} clicks</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "hsl(var(--primary))" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
