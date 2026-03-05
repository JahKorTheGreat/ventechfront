// Dashboard Header Component
// Top navigation with user info

'use client';

import { Bell, User } from 'lucide-react';

interface User {
  id?: string;
  email?: string;
  full_name?: string;
  avatar?: string;
}

interface DashboardHeaderProps {
  user: User | null;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-vt-bg-primary border-b border-vt-border flex items-center justify-between px-6">
      {/* Left side - Title placeholder */}
      <div className="flex-1" />

      {/* Right side - Notifications and User */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <button className="relative text-vt-text-secondary hover:text-vt-text-primary transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-6 border-l border-vt-border">
          <div className="text-right">
            <p className="text-sm font-medium text-vt-text-primary">{user?.full_name || 'User'}</p>
            <p className="text-xs text-vt-text-secondary">{user?.email}</p>
          </div>
          <div className="w-10 h-10 bg-vt-primary rounded-full flex items-center justify-center text-white font-bold">
            {user?.full_name ? user.full_name[0].toUpperCase() : <User className="w-5 h-5" />}
          </div>
        </div>
      </div>
    </header>
  );
}
