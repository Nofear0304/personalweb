"use client";

interface VisitData {
  day: string;
  count: number;
}

interface VisitTrendChartProps {
  data: VisitData[];
}

export default function VisitTrendChart({ data }: VisitTrendChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="p-6 rounded-2xl" style={{
      background: "rgba(17,24,39,0.7)",
      border: "1px solid rgba(255,255,255,0.05)",
      backdropFilter: "blur(12px)",
    }}>
      <h3 className="font-serif text-lg font-bold text-white mb-6">近7天访问趋势</h3>

      <div className="flex items-end justify-between gap-2 sm:gap-4 h-48">
        {data.map((item) => {
          const height = (item.count / maxCount) * 100;

          return (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              {/* Tooltip on hover */}
              <div className="relative group/tip">
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-medium text-white bg-[var(--accent)] px-2 py-1 rounded opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap">
                  {item.count} 次访问
                </span>
              </div>

              {/* Bar */}
              <div
                className="w-full rounded-t-lg transition-all duration-500 hover:brightness-110 relative"
                style={{
                  height: `${Math.max(height, 4)}%`,
                  background: "linear-gradient(to top, #60A5FA, #93BBFD)",
                  boxShadow: "0 0 10px rgba(96,165,250,0.3)",
                  minHeight: "4px",
                }}
              />

              {/* Day label */}
              <span className="text-xs text-white/30">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
