'use client';

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface ConversionChartProps {
  data: Array<{ name: string; value: number }>;
  loading?: boolean;
}

export default function ConversionChart({ data, loading = false }: ConversionChartProps) {
  // Chart colors palette
  const COLORS = [
    '#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444',
    '#06b6d4', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'
  ];

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chart-conversions"></div>
          <p className="text-gray-600 text-sm">Loading conversion data...</p>
        </div>
      </div>
    );
  }

  const validData = data && data.length > 0 ? data : [];

  if (validData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="text-center">
          <div className="text-4xl mb-3">📈</div>
          <p className="text-gray-700 font-semibold mb-2">No conversion data yet</p>
          <p className="text-gray-600 text-sm">Track your conversions from different sources</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 rounded-lg shadow-md p-6 min-w-0">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Conversion Breakdown</h3>
        <p className="text-gray-600 text-sm">Distribution across sources</p>
      </div>

      <div className="h-80 min-h-[200px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={validData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              paddingAngle={1}
              dataKey="value"
              label={({ name, value, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {validData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `${value} conversions`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Source Stats */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Top Sources</h4>
        {validData.slice(0, 5).map((item, idx) => {
          const total = validData.reduce((sum, d) => sum + d.value, 0);
          const percent = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
