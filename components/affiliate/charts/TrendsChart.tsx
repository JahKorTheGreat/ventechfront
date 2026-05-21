'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart } from 'recharts';

interface TrendChartProps {
  data: Array<{ date: string; earnings: number; clicks: number; conversions?: number }>;
  loading?: boolean;
}

export default function TrendsChart({ data, loading = false }: TrendChartProps) {
  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chart-clicks"></div>
          <p className="text-gray-600 text-sm">Loading trend data...</p>
        </div>
      </div>
    );
  }

  const validData = data && data.length > 0 ? data : [];

  if (validData.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <div className="text-4xl mb-3">📉</div>
          <p className="text-gray-700 font-semibold mb-2">No historical data yet</p>
          <p className="text-gray-600 text-sm">Your trend data will appear here over time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 rounded-lg shadow-md p-6 min-w-0">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Historical Trends</h3>
          <p className="text-gray-600 text-sm">Performance over time</p>
        </div>
      </div>

      <div className="h-96 min-h-[240px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={validData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              formatter={(value: any) => value?.toLocaleString?.() ?? value}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            
            {/* Area for earnings */}
            <Area
              type="monotone"
              dataKey="earnings"
              fill="url(#earningsGradient)"
              stroke="#10b981"
              strokeWidth={2}
              name="Earnings"
              isAnimationActive={true}
            />
            
            {/* Line for clicks */}
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Clicks"
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />

            {/* Line for conversions if available */}
            {validData.some(d => d.conversions && d.conversions > 0) && (
              <Line
                type="monotone"
                dataKey="conversions"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Conversions"
                dot={{ fill: '#a855f7', r: 3 }}
                isAnimationActive={true}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-xs sm:text-sm mb-1">Avg. Earnings</p>
          <p className="text-lg sm:text-xl font-bold text-chart-earnings">
            {(validData.reduce((sum, d) => sum + d.earnings, 0) / validData.length).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Clicks</p>
          <p className="text-lg sm:text-xl font-bold text-chart-clicks">
            {validData.reduce((sum, d) => sum + d.clicks, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-xs sm:text-sm mb-1">Conversion Rate</p>
          <p className="text-lg sm:text-xl font-bold text-chart-conversions">
            {validData.length > 0 
              ? ((validData.reduce((sum, d) => sum + (d.conversions || 0), 0) / validData.reduce((sum, d) => sum + d.clicks, 0)) * 100).toFixed(1)
              : '0'}%
          </p>
        </div>
      </div>
    </div>
  );
}
