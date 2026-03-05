// Earnings Chart Component
// Line chart showing earnings and clicks over time

'use client';

import { ChartDataPoint } from '@/services/affiliateStats.service';

interface EarningsChartProps {
  data: ChartDataPoint[] | null;
  loading: boolean;
  timeframe: 'week' | 'month' | 'year';
  onTimeframeChange: (timeframe: 'week' | 'month' | 'year') => void;
}

export default function EarningsChart({ data, loading, timeframe, onTimeframeChange }: EarningsChartProps) {
  const getMaxValue = () => {
    if (!data || data.length === 0) return 100;
    return Math.max(...data.map((d) => Math.max(d.earnings, d.clicks)));
  };

  const maxValue = getMaxValue();
  const timeframes = [
    { label: 'Week', value: 'week' as const },
    { label: 'Month', value: 'month' as const },
    { label: 'Year', value: 'year' as const },
  ];

  return (
    <div className="bg-vt-bg-primary rounded-lg border border-vt-border p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-vt-text-primary">Earnings & Clicks</h3>
          <p className="text-vt-text-secondary text-sm">Detailed performance metrics</p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex space-x-2">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === tf.value
                  ? 'bg-vt-primary text-white'
                  : 'bg-vt-bg-secondary text-vt-text-secondary hover:text-vt-text-primary'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex space-x-6 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-vt-text-secondary text-sm">Earnings</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-vt-text-secondary text-sm">Clicks</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-vt-text-secondary">Loading chart...</div>
        ) : !data || data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-vt-text-secondary">No data available</div>
        ) : (
          <div className="h-64">
            {/* Simplified bar chart representation */}
            <div className="flex items-end justify-between h-full space-x-2">
              {data.slice(-12).map((point, idx) => {
                const earningsHeight = (point.earnings / maxValue) * 100;
                const clicksHeight = (point.clicks / maxValue) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center space-y-1">
                    <div className="flex items-end justify-center space-x-1 h-full w-full">
                      {/* Earnings bar */}
                      <div
                        className="flex-1 bg-green-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                        style={{ height: `${earningsHeight}%`, minHeight: '2px' }}
                        title={`Earnings: $${point.earnings}`}
                      />
                      {/* Clicks bar */}
                      <div
                        className="flex-1 bg-blue-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                        style={{ height: `${clicksHeight}%`, minHeight: '2px' }}
                        title={`Clicks: ${point.clicks}`}
                      />
                    </div>
                    <span className="text-xs text-vt-text-secondary text-center truncate">{point.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
