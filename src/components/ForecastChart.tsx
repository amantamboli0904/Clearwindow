import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { HourlyPoint } from '../types/airQuality';
import { getAQICategory } from '../utils/aqi';

interface ForecastChartProps {
  hourly: HourlyPoint[];
  cleanestHour: HourlyPoint | null;
  theme: 'light' | 'dark';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: HourlyPoint }>;
}

function ForecastTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0].payload;
  const cat = getAQICategory(point.aqi);

  return (
    <div className="rounded-xl border-[1.5px] border-neutral-950 bg-white px-3.5 py-2.5 text-xs shadow-md dark:border-neutral-600 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-4 font-semibold text-neutral-950 dark:text-neutral-100">
        <span>{point.fullTimeLabel}</span>
        {point.isCleanest && (
          <span className="text-[#0284c7] dark:text-[#1CE0FF]">Cleanest hour</span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: cat.hex }}
          aria-hidden="true"
        />
        <span className="font-mono-tabular font-semibold text-neutral-950 dark:text-neutral-100">
          AQI {point.aqi}
        </span>
        <span className="text-neutral-500 dark:text-neutral-400">· {cat.label}</span>
      </div>
      {point.pm2_5 !== null && (
        <div className="mt-0.5 font-mono-tabular text-neutral-500 dark:text-neutral-400">
          PM2.5 {point.pm2_5} μg/m³
        </div>
      )}
    </div>
  );
}

export function ForecastChart({ hourly, cleanestHour, theme }: ForecastChartProps) {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#262626' : '#f1f5f9';
  const axisColor = isDark ? '#a3a3a3' : '#525252';

  const maxAqi = hourly.reduce((max, pt) => Math.max(max, pt.aqi), 50);
  const yMax = Math.max(60, Math.ceil((maxAqi + 15) / 25) * 25);

  return (
    <section
      aria-label="24-hour AQI forecast chart"
      data-testid="forecast-chart-section"
      className="rounded-3xl border-[1.5px] border-neutral-950 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div className="mb-5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-neutral-950 dark:text-white">
            Next 24 hours
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Hourly US AQI forecast with the cleanest hour marked
          </p>
        </div>

        {cleanestHour && (
          <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm border border-neutral-950 bg-[#1CE0FF]"
              aria-hidden="true"
            />
            <span className="tabular-nums">
              Cleanest hour:{' '}
              <strong className="font-bold text-neutral-950 dark:text-white">
                {cleanestHour.fullTimeLabel}
              </strong>{' '}
              (AQI {cleanestHour.aqi})
            </span>
          </div>
        )}
      </div>

      {hourly.length === 0 ? (
        <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-neutral-300 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          Hourly forecast data is unavailable for this location.
        </div>
      ) : (
        <div className="h-56 w-full min-w-0 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              key={hourly[0]?.time ?? 'chart'}
              data={hourly}
              margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
              barCategoryGap="18%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="hourLabel"
                tick={{ fill: axisColor, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis
                domain={[0, yMax]}
                tick={{ fill: axisColor, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                content={<ForecastTooltip />}
                cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(17, 17, 17, 0.04)' }}
              />
              {cleanestHour && (
                <ReferenceLine
                  x={cleanestHour.hourLabel}
                  stroke="#0284c7"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                />
              )}
              <Bar
                dataKey="aqi"
                radius={[5, 5, 0, 0]}
                maxBarSize={22}
                isAnimationActive={false}
              >
                {hourly.map((entry) => {
                  const cat = getAQICategory(entry.aqi);
                  return (
                    <Cell
                      key={entry.time}
                      fill={entry.isCleanest ? '#1CE0FF' : cat.hex}
                      fillOpacity={entry.isCleanest ? 1 : 0.86}
                      stroke={entry.isCleanest ? (isDark ? '#e0f2fe' : '#111111') : 'none'}
                      strokeWidth={entry.isCleanest ? 1.5 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
