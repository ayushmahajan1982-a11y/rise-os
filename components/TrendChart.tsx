"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendPoint = {
  day: string;
  score: number;
};

type TrendChartProps = {
  data: TrendPoint[];
};

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 12, bottom: 8, left: 12 }}>
          <defs>
            <filter
              id="trend-red-glow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="4"
                floodColor="#FF0000"
                floodOpacity="0.8"
              />
            </filter>
          </defs>

          <XAxis dataKey="day" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip
            cursor={false}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;

              return (
                <div className="border border-white bg-black px-4 py-3 font-dot text-[10px] tracking-[0.16em] text-white">
                  <p className="text-white/50">DATE / {label}</p>
                  <p className="mt-2 text-[#FF0000]">
                    SCORE / {Number(payload[0].value).toFixed(1)}
                  </p>
                </div>
              );
            }}
          />
          <Line
            type="linear"
            dataKey="score"
            stroke="#FF0000"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: "#FF0000",
              stroke: "#FFFFFF",
              strokeWidth: 1,
            }}
            filter="url(#trend-red-glow)"
            isAnimationActive={true}
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
