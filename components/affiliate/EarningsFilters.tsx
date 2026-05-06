// Earnings Filters Component
// Filter controls for earnings table

'use client';

import { useState } from 'react';

interface EarningsFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}

export default function EarningsFilters({ statusFilter, onStatusChange, onDateRangeChange }: EarningsFiltersProps) {
  const [showDateRange, setShowDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const statuses = [
    { value: 'all', label: 'All Earnings' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'paid', label: 'Paid' },
  ];

  const handleApplyDateRange = () => {
    if (startDate && endDate) {
      if (onDateRangeChange) {
        onDateRangeChange(startDate, endDate);
      }
      setShowDateRange(false);
    }
  };

  const handleResetDateRange = () => {
    setStartDate('');
    setEndDate('');
    if (onDateRangeChange) {
      onDateRangeChange('', '');
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow-md p-4 space-y-4">
      {/* Status Filter */}
      <div className="flex items-center space-x-2">
        <label htmlFor="status-filter" className="text-vt-text-secondary text-sm font-medium">
          Filter by Status:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2 border border-vt-border rounded-lg bg-white text-vt-text-primary focus:ring-2 focus:ring-vt-primary focus:border-transparent outline-none"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowDateRange(!showDateRange)}
          className="px-4 py-2 border border-vt-border rounded-lg bg-white text-vt-text-primary hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          📅 {startDate && endDate ? `${startDate} to ${endDate}` : 'Date Range'}
        </button>
        {startDate && endDate && (
          <button
            onClick={handleResetDateRange}
            className="px-3 py-2 text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {/* Date Range Picker */}
      {showDateRange && (
        <div className="bg-white border border-vt-border rounded-lg p-4 space-y-3">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleApplyDateRange}
              disabled={!startDate || !endDate}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Apply
            </button>
            <button
              onClick={() => setShowDateRange(false)}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
