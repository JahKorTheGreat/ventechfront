'use client';

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface DonutChartProps {
  earnings: number;
  clicks: number;
  conversions: number;
  loading?: boolean;
}

export default function DonutChart({ earnings, clicks, conversions, loading = false }: DonutChartProps) {
  // Prepare data for the donut chart
  const data = [
    { name: 'Earnings', value: earnings || 0, fill: '#10b981' },
    { name: 'Clicks', value: clicks || 0, fill: '#3b82f6' },
    { name: 'Conversions', value: conversions || 0, fill: '#a855f7' },
  ].filter(d => d.value > 0);

  const totalValue = earnings + clicks + conversions;

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chart-earnings"></div>
          <p className="text-gray-600 text-sm">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0 || totalValue === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-700 font-semibold mb-2">No performance data yet</p>
          <p className="text-gray-600 text-sm">Start promoting to see your earnings breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 rounded-lg shadow-md p-6 min-w-0">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Performance Overview</h3>
        <p className="text-gray-600 text-sm">Total value: {totalValue.toLocaleString()}</p>
      </div>

      <div className="h-80 min-h-[200px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => value?.toLocaleString?.() ?? value}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => `${value}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Earnings</p>
          <p className="text-2xl font-bold text-chart-earnings">{earnings.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Clicks</p>
          <p className="text-2xl font-bold text-chart-clicks">{clicks.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Conversions</p>
          <p className="text-2xl font-bold text-chart-conversions">{conversions.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
