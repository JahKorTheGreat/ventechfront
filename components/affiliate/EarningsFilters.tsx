// Earnings Filters Component
// Filter controls for earnings table

'use client';

interface EarningsFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export default function EarningsFilters({ statusFilter, onStatusChange }: EarningsFiltersProps) {
  const statuses = [
    { value: 'all', label: 'All Earnings' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'paid', label: 'Paid' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="status-filter" className="text-vt-text-secondary text-sm font-medium">
        Filter by Status:
      </label>
      <select
        id="status-filter"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-4 py-2 border border-vt-border rounded-lg bg-vt-bg-primary text-vt-text-primary focus:ring-2 focus:ring-vt-primary focus:border-transparent outline-none"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
}
