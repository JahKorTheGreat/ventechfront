'use client';

import DashboardHeader from '@/components/affiliate/DashboardHeader';

export default function HeaderDebugPage() {
  const user = { id: 'debug-user', full_name: 'Debug User', email: 'debug@example.com' };
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} />
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Header Debug Page</h1>
        <p className="mt-2 text-sm text-slate-600">This page is for local debugging only. It mounts the affiliate header with a mock user.</p>
      </main>
    </div>
  );
}
