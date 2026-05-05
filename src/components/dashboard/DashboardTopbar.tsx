'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  X,
  ChevronDown,
  Plus,
  CalendarCheck,
  FileSignature,
  UserCog,
  LogOut,
  User,
  HelpCircle,
} from 'lucide-react';
import CommandPalette from './CommandPalette';
import { EntitySwitcher } from '@/components/EntitySwitcher';
import type { UserSummary } from '@/types/dashboard';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  unread: boolean;
  createdAt: string;
};

function formatNotifTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const QUICK_ACTIONS_BASE = [
  { label: 'Add employee', href: '/dashboard/employees/new', icon: UserCog },
  { label: 'Schedule rota shift', href: '/dashboard/rota', icon: CalendarCheck },
  { label: 'Create contract', href: '/dashboard/people/contracts', icon: FileSignature },
];

const QUICK_ACTIONS_ADMIN = [
  { label: 'Add staff member', href: '/dashboard/users/staff', icon: UserCog },
] as const;

interface DashboardTopbarProps {
  currentUser: UserSummary | null;
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) return 'SU';
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || 'SU';
}

export default function DashboardTopbar({ currentUser }: DashboardTopbarProps) {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      const r = await fetch('/api/dashboard/notifications?limit=30');
      if (!r.ok) return;
      const data = (await r.json()) as { notifications?: NotificationItem[]; unreadCount?: number };
      if (Array.isArray(data.notifications)) setNotifications(data.notifications);
      if (typeof data.unreadCount === 'number') setUnreadCount(data.unreadCount);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    const interval = setInterval(() => {
      void loadNotifications();
    }, 30_000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(target)) {
        setQuickActionsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/dashboard/login');
  };

  const displayName = currentUser?.name || 'Staff User';
  const displayEmail = currentUser?.email || 'staff@example.com';
  const initials = getInitials(displayName);
  const quickActions =
    currentUser?.role === 'admin'
      ? [...QUICK_ACTIONS_BASE, ...QUICK_ACTIONS_ADMIN]
      : QUICK_ACTIONS_BASE;

  return (
    <header className="print:hidden sticky top-0 z-30 flex-shrink-0 h-16 bg-white border-b border-neutral-200 flex items-center justify-between gap-4 px-6 md:px-8 xl:px-12">
      {/* Search — opens command palette on focus or use Cmd+K / Ctrl+K */}
      <div className="flex-1 max-w-xl min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search employees, departments, payroll... (⌘K)"
            onFocus={() => setPaletteOpen(true)}
            readOnly
            className="w-full h-9 pl-10 pr-4 bg-white border border-neutral-200 rounded-md text-sm text-ink placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2 focus:border-primary-500 transition-colors cursor-pointer"
            aria-label="Search"
          />
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        initialQuery=""
      />

      {/* Right: Entity, Quick actions, Help, Notifications, User */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <EntitySwitcher />
        {/* Quick actions */}
        <div className="relative" ref={quickActionsRef}>
          <button
            type="button"
            onClick={() => setQuickActionsOpen((prev) => !prev)}
            className="flex h-9 items-center gap-1.5 px-3 rounded-md text-neutral-700 hover:bg-neutral-50 hover:text-primary-700 transition-colors text-sm font-medium"
            aria-label="Quick actions"
            aria-expanded={quickActionsOpen}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Quick actions</span>
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </button>
          {quickActionsOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg border border-neutral-200 shadow-medium overflow-hidden py-1">
              {quickActions.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href + label}
                  href={href}
                  onClick={() => setQuickActionsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-700 transition-colors"
                >
                  <Icon className="w-4 h-4 text-neutral-500 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Help (optional: link to contact or docs) */}
        <Link
          href="/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-50 hover:text-primary-700 transition-colors"
          aria-label="Help / Contact"
          title="Help & contact"
        >
          <HelpCircle className="w-5 h-5" />
        </Link>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((prev) => {
                const next = !prev;
                if (next) loadNotifications();
                return next;
              });
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-50 hover:text-primary-700 transition-colors"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-warning text-[10px] font-semibold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-neutral-200 shadow-medium overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                <h3 className="text-sm font-semibold text-ink">Notifications</h3>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-sm text-neutral-500 text-center">
                    No notifications yet. Contract reminders and other alerts will appear here.
                  </p>
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {notifications.map((n) => {
                      const markReadAndGo = async () => {
                        if (n.unread) {
                          await fetch('/api/dashboard/notifications', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ids: [n.id] }),
                          });
                          setNotifications((prev) =>
                            prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)),
                          );
                          setUnreadCount((c) => Math.max(0, c - 1));
                        }
                        setNotificationsOpen(false);
                        if (n.href) router.push(n.href);
                      };
                      const inner = (
                        <span className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{n.title}</p>
                          <p className="text-xs text-neutral-600 line-clamp-2">{n.body}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">{formatNotifTime(n.createdAt)}</p>
                        </span>
                      );
                      return (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => void markReadAndGo()}
                            className={`w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors flex gap-3 ${n.unread ? 'bg-primary-50' : ''}`}
                          >
                            {inner}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-neutral-200 bg-neutral-50">
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch('/api/dashboard/notifications', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ markAllRead: true }),
                      });
                      setNotifications((prev) => prev.map((x) => ({ ...x, unread: false })));
                      setUnreadCount(0);
                    }}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    Mark all read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative pl-2 border-l border-neutral-200" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-md text-neutral-700 hover:bg-neutral-50 hover:text-primary-700 transition-colors"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary-700">{initials}</span>
            </div>
            <div className="hidden md:block text-left min-w-0">
              <p className="text-sm font-medium text-ink truncate">{displayName}</p>
              <p className="text-xs text-neutral-500 truncate">{displayEmail}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-60 bg-white rounded-lg border border-neutral-200 shadow-medium overflow-hidden py-1">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-medium text-ink">{displayName}</p>
                <p className="text-xs text-neutral-500 truncate">{displayEmail}</p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-700 transition-colors"
              >
                <User className="w-4 h-4 text-neutral-500" />
                Dashboard home
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-neutral-700 hover:bg-danger/10 hover:text-danger transition-colors"
              >
                <LogOut className="w-4 h-4 text-neutral-500" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
