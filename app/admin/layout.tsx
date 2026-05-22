'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/store';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  FolderTree,
  Tag,
  Image,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
  DollarSign,
  ShoppingCart,
  Heart,
  CreditCard,
  ChevronLeft,
  Percent,
  Star,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/services/auth.service';
import { notificationService, Notification } from '@/services/notification.service';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface MenuItem {
  icon: any;
  label: string;
  href?: string;
  badge?: number;
  children?: MenuItem[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['products', 'analytics']);
  const [mounted, setMounted] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number | undefined>(undefined);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number | undefined>(undefined);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [dropdownError, setDropdownError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const bellButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        bellButtonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !bellButtonRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const fetchNotifications = async () => {
    try {
      setDropdownLoading(true);
      setDropdownError(null);
      const data = await notificationService.getAllNotifications(6);
      setNotifications(data);
    } catch (error) {
      setDropdownError('Unable to load notifications');
      console.error('Error loading notifications:', error);
    } finally {
      setDropdownLoading(false);
    }
  };

  const toggleNotifications = async () => {
    setDropdownOpen((prev) => !prev);
    if (!dropdownOpen) {
      await fetchNotifications();
    }
  };

  const markAllDropdownAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
    setUnreadNotificationsCount(0);
  };

  // Fetch badge counts
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') return;

    const fetchBadgeCounts = async () => {
      try {
        // Fetch pending orders count
        const { count: pendingCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (!ordersError) {
          setPendingOrdersCount(pendingCount || 0);
        }

        // Fetch unread notifications count
        const unread = await notificationService.getUnreadCount();
        setUnreadNotificationsCount(unread);
      } catch (error) {
        console.error('Error fetching badge counts:', error);
      }
    };

    fetchBadgeCounts();
    
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchBadgeCounts, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Wait for component to mount and auth state to finish loading before checking
    if (!mounted || isLoading) {
      return; // Still mounting or loading auth state, don't redirect yet
    }

    // Longer delay to ensure auth state is fully settled after INITIAL_SESSION
    // INITIAL_SESSION can cause temporary state where isLoading is false but user isn't loaded yet
    const timeoutId = setTimeout(() => {
      // Double-check: Wait a bit more if user is still null but we're not loading
      if (!user && !isLoading) {
        // Check session directly from Supabase as a fallback
        supabase.auth.getSession().then(({ data: { session } }: any) => {
          if (!session) {
            // No session - redirect to login
            if (pathname !== '/login' && pathname !== '/register') {
              router.replace('/login');
            }
          }
        });
        return;
      }
      
      // After loading is complete, check authentication status
      // Only redirect if we're absolutely certain the user is not authenticated or not admin
      if (!isAuthenticated || !user) {
        // User is not authenticated after loading completed
        // Only redirect if we're not already on login page to avoid loops
        if (pathname !== '/login' && pathname !== '/register') {
          router.replace('/login');
        }
        return;
      }
      
      if (user.role !== 'admin') {
        // User is authenticated but not admin
        if (pathname !== '/') {
          router.replace('/');
          toast.error('Access denied. Admin only.');
        }
        return;
      }
      
      // User is authenticated and is admin - allow access
    }, 500); // Increased delay to handle INITIAL_SESSION

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user, isLoading, mounted, router, pathname]);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/admin',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      children: [
        { icon: DollarSign, label: 'Revenue', href: '/admin/analytics/revenue' },
        { icon: ShoppingCart, label: 'Sales', href: '/admin/analytics/sales' },
        { icon: Users, label: 'Customers', href: '/admin/analytics/customers' },
      ],
    },
    {
      icon: ShoppingBag,
      label: 'Orders',
      href: '/admin/orders',
      badge: pendingOrdersCount !== undefined ? (pendingOrdersCount > 0 ? pendingOrdersCount : undefined) : undefined,
    },
    {
      icon: Package,
      label: 'Products',
      children: [
        { icon: Package, label: 'All Products', href: '/admin/products' },
        { icon: FolderTree, label: 'Categories', href: '/admin/categories' },
        { icon: Tag, label: 'Brands', href: '/admin/brands' },
      ],
    },
    {
      icon: Clock,
      label: 'Pre-Orders',
      href: '/admin/pre-orders',
    },
    {
      icon: Users,
      label: 'Customers',
      href: '/admin/users',
    },
    {
      icon: CreditCard,
      label: 'Transactions',
      href: '/admin/transactions',
    },
    {
      icon: Heart,
      label: 'Wishlist Insights',
      href: '/admin/wishlist-insights',
    },
    {
      icon: ShoppingCart,
      label: 'Cart Analytics',
      href: '/admin/cart-analytics',
    },
    {
      icon: Star,
      label: 'Reviews',
      href: '/admin/reviews',
    },
    {
      icon: Image,
      label: 'Media Library',
      href: '/admin/media',
    },
    {
      icon: Image,
      label: 'Marketing',
      children: [
        { icon: Image, label: 'Banners', href: '/admin/banners' },
        { icon: Image, label: 'Sidebar Ads', href: '/admin/sidebar-ads' },
        { icon: Tag, label: 'Coupons', href: '/admin/coupons' },
      ],
    },
    {
      icon: Bell,
      label: 'Notifications',
      href: '/admin/notifications',
      badge: unreadNotificationsCount !== undefined ? (unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined) : undefined,
    },
    {
      icon: Settings,
      label: 'Settings',
      children: [
        { icon: Settings, label: 'Delivery Options', href: '/admin/settings' },
        { icon: DollarSign, label: 'Taxes', href: '/admin/taxes' },
        { icon: Percent, label: 'Discounts', href: '/admin/discounts' },
      ],
    },
  ];

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    // Render a minimal loading state that matches server-side rendering
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" suppressHydrationWarning>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A19] mx-auto mb-4"></div>
          <p className="text-[#3A3A3A]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while auth is being checked
  // This prevents unnecessary redirects during page refresh
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A19] mx-auto mb-4"></div>
          <p className="text-[#3A3A3A]">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // After loading is complete, check if user is authenticated and is admin
  // Only render if authenticated as admin, otherwise useEffect will handle redirect
  if (!isAuthenticated || !user || user.role !== 'admin') {
    // Don't render anything while redirect is happening
    // This prevents flash of content
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#1A1A1A] text-white transition-all duration-300 flex flex-col fixed h-full z-50`}
      >
        {/* Logo & Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img
                src="/logo/ventech_logo-white.png"
                alt="VENTECH"
                className="h-8 w-auto object-contain"
              />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Admin Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF7A19] rounded-full flex items-center justify-center font-bold">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                // Expandable menu item
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors ${
                      !sidebarOpen && 'justify-center'
                    }`}
                  >
                    <item.icon size={20} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        {expandedMenus.includes(item.label) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </>
                    )}
                  </button>
                  {expandedMenus.includes(item.label) && sidebarOpen && (
                    <div className="bg-gray-800">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href || '#'}
                          className={`flex items-center gap-3 px-4 py-2 pl-12 hover:bg-gray-700 transition-colors text-sm ${
                            isActive(child.href) ? 'bg-gray-700 text-[#FF7A19]' : ''
                          }`}
                        >
                          <child.icon size={16} />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular menu item
                <Link
                  href={item.href || '#'}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors relative ${
                    !sidebarOpen && 'justify-center'
                  } ${isActive(item.href) ? 'bg-gray-700 text-[#FF7A19]' : ''}`}
                >
                  <item.icon size={20} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-sm">{item.label}</span>
                      {item.badge && (
                        <span className="bg-[#FF7A19] text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {!sidebarOpen && item.badge && (
                    <span className="absolute -top-1 -right-1 bg-[#FF7A19] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600 rounded-lg transition-colors ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}
      >
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">
                {pathname === '/admin'
                  ? 'Dashboard'
                  : pathname.split('/').pop()?.replace('-', ' ').toUpperCase()}
              </h1>
              <p className="text-sm text-[#3A3A3A] mt-1">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}
              </p>
            </div>
            <div className="flex items-center gap-4 relative">
              <div className="relative">
                <button
                  ref={bellButtonRef}
                  onClick={toggleNotifications}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Open notifications"
                >
                  <Bell size={20} />
                  {unreadNotificationsCount && unreadNotificationsCount > 0 ? (
                    <span className="absolute -top-1 -right-1 min-w-[1rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  ) : null}
                </button>

                {dropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-[24rem] max-w-[95vw] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Notifications</p>
                        <p className="text-xs text-gray-500">
                          {(unreadNotificationsCount ?? 0) > 0
                            ? `${unreadNotificationsCount} unread notification${unreadNotificationsCount && unreadNotificationsCount > 1 ? 's' : ''}`
                            : 'No unread notifications'}
                        </p>
                      </div>
                      <button
                        onClick={markAllDropdownAsRead}
                        className="text-xs text-blue-600 hover:underline"
                        type="button"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                      {dropdownLoading ? (
                        <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
                      ) : dropdownError ? (
                        <div className="p-4 text-center text-sm text-red-600">
                          {dropdownError}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">No notifications at the moment.</div>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {notifications.map((notification) => (
                            <li key={notification.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start gap-3">
                                <span className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${notification.is_read ? 'bg-transparent' : 'bg-orange-500'}`}></span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{notification.title}</p>
                                  <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <Link href="/admin/notifications" className="text-sm font-medium text-[#FF7A19] hover:underline">
                        View all
                      </Link>
                      <button
                        onClick={() => setDropdownOpen(false)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                        type="button"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                View Store →
              </Link>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

