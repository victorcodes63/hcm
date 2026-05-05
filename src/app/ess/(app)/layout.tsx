'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, CalendarDays, Clock3, Home, Receipt, Shield, User, X } from 'lucide-react';

type EssMe = {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'hr';
  mustResetPassword: boolean;
};

export default function EssAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<EssMe | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    body: string;
    href?: string | null;
    unread: boolean;
    createdAt: string;
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/ess/notifications?limit=30');
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications?: Array<{ id: string; title: string; body: string; href?: string | null; unread: boolean; createdAt: string }>;
        unreadCount?: number;
      };
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/api/ess/auth/me')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Unauthorized');
        return data as EssMe;
      })
      .then((data) => {
        if (cancelled) return;
        setMe(data);
      })
      .catch(() => {
        if (!cancelled) router.replace('/ess/login');
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!me?.mustResetPassword) return;
    if (pathname !== '/ess/account-security') {
      router.replace('/ess/account-security');
    }
  }, [me?.mustResetPassword, pathname, router]);

  useEffect(() => {
    void fetchNotifications();
    const interval = setInterval(() => {
      void fetchNotifications();
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  async function onLogout() {
    await fetch('/api/ess/auth/logout', { method: 'POST' });
    router.replace('/ess/login');
    router.refresh();
  }

  const navItems = [
    { href: '/ess', label: 'Overview', icon: Home },
    { href: '/ess/leave', label: 'Leave', icon: CalendarDays },
    { href: '/ess/disciplinary', label: 'Discipline', icon: Shield },
    { href: '/ess/grievances', label: 'Grievances', icon: Bell },
    { href: '/ess/payslips', label: 'Payslips', icon: Receipt },
    { href: '/ess/attendance', label: 'Attendance', icon: Clock3 },
    { href: '/ess/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-base text-neutral-500">Employee self service</p>
            <p className="text-base font-semibold text-primary-900">{me?.name || 'Loading...'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((v) => !v);
                if (!notificationsOpen) void fetchNotifications();
              }}
              className="relative min-h-12 rounded-md border border-neutral-300 px-3 text-base text-neutral-700"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="min-h-12 rounded-md border border-neutral-300 px-4 text-base text-neutral-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      {notificationsOpen && (
        <div className="fixed inset-x-0 top-16 z-40 mx-auto w-full max-w-6xl px-4">
          <div className="w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-md md:ml-auto md:max-w-md">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-ink">Notifications</h3>
              <button type="button" onClick={() => setNotificationsOpen(false)} className="rounded p-1 text-neutral-500 hover:bg-neutral-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-neutral-500">No notifications yet.</p>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={async () => {
                          if (n.unread) {
                            await fetch('/api/ess/notifications', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ids: [n.id] }),
                            });
                            setUnreadCount((c) => Math.max(0, c - 1));
                          }
                          setNotificationsOpen(false);
                          if (n.href) router.push(n.href);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-neutral-50 ${n.unread ? 'bg-primary-50' : ''}`}
                      >
                        <p className="text-sm font-medium text-ink">{n.title}</p>
                        <p className="text-xs text-neutral-600">{n.body}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-2">
                <button
                  type="button"
                  onClick={async () => {
                    await fetch('/api/ess/notifications', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ markAllRead: true }),
                    });
                    setNotifications((prev) => prev.map((x) => ({ ...x, unread: false })));
                    setUnreadCount(0);
                  }}
                  className="text-xs font-medium text-primary-600"
                >
                  Mark all read
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 py-6 text-base">
        {children}
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl justify-between gap-0 overflow-x-auto px-1">
          {navItems.map((item) => {
            const active =
              item.href === '/ess'
                ? pathname === '/ess' || pathname === '/ess/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-12 min-w-[4.25rem] shrink-0 flex-col items-center justify-center gap-0.5 px-1 text-[10px] leading-tight sm:text-xs ${active ? 'text-primary-600' : 'text-neutral-500'}`}
              >
                <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <span className="text-center">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
