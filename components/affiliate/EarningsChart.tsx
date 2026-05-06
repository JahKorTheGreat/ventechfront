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
    <div className="bg-gray-50 rounded-lg shadow-md p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-vt-text-primary">Earnings & Clicks</h3>
          <p className="text-vt-text-secondary text-xs sm:text-sm">Detailed performance metrics</p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex space-x-2 w-full sm:w-auto">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
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
      <div className="flex flex-wrap gap-4 sm:gap-6 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-vt-text-secondary text-xs sm:text-sm">Earnings</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-vt-text-secondary text-xs sm:text-sm">Clicks</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-vt-text-secondary gap-3">
            <div className="flex items-end gap-1 h-32">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex-1 bg-gray-200 rounded animate-pulse" style={{height: `${20 + i * 10}%`, opacity: 0.6}}></div>
              ))}
            </div>
            <p className="text-sm">Loading chart data...</p>
          </div>
        ) : (
          // Always show chart, whether data exists or not
          <div className="h-64 w-full">
            {/* Chart with data or empty state visualization */}
            <div className="flex items-end justify-between h-full space-x-1 sm:space-x-2 px-2">
              {/* Generate 12 bars - either from data or from empty state */}
              {(data && data.length > 0
                ? data.slice(-12)
                : [
                    { date: 'D1', earnings: 0, clicks: 0 },
                    { date: 'D2', earnings: 0, clicks: 0 },
                    { date: 'D3', earnings: 0, clicks: 0 },
                    { date: 'D4', earnings: 0, clicks: 0 },
                    { date: 'D5', earnings: 0, clicks: 0 },
                    { date: 'D6', earnings: 0, clicks: 0 },
                    { date: 'D7', earnings: 0, clicks: 0 },
                    { date: 'D8', earnings: 0, clicks: 0 },
                    { date: 'D9', earnings: 0, clicks: 0 },
                    { date: 'D10', earnings: 0, clicks: 0 },
                    { date: 'D11', earnings: 0, clicks: 0 },
                    { date: 'D12', earnings: 0, clicks: 0 },
                  ]
              ).map((point, idx) => {
                const earningsHeight = data && data.length > 0 ? (point.earnings / maxValue) * 100 : 0;
                const clicksHeight = data && data.length > 0 ? (point.clicks / maxValue) * 100 : 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center space-y-1 min-w-0">
                    <div className="flex items-end justify-center space-x-0.5 sm:space-x-1 h-full w-full">
                      {/* Earnings bar */}
                      <div
                        className="flex-1 bg-green-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                        style={{
                          height: earningsHeight > 0 ? `${earningsHeight}%` : '4px',
                          minHeight: '4px',
                        }}
                        title={`Earnings: $${point.earnings}`}
                      />
                      {/* Clicks bar */}
                      <div
                        className="flex-1 bg-blue-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                        style={{
                          height: clicksHeight > 0 ? `${clicksHeight}%` : '4px',
                          minHeight: '4px',
                        }}
                        title={`Clicks: ${point.clicks}`}
                      />
                    </div>
                    <span className="text-xs text-vt-text-secondary text-center truncate w-full">{point.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Empty State Message */}
      {!loading && (!data || data.length === 0) && (
        <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 text-center">
          <div className="text-3xl mb-3">📊</div>
          <p className="text-vt-text-primary text-base font-semibold">No earnings data yet</p>
          <p className="text-vt-text-secondary text-sm mt-2">Start promoting to see your performance metrics. Create a new referral link to begin earning!</p>
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100">
            <p className="text-xs text-vt-text-secondary">💡 <strong>Tip:</strong> More clicks and conversions = higher earnings</p>
          </div>
        </div>
      )}
    </div>
  );
}
