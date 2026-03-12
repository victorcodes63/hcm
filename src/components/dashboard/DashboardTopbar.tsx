'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  X,
  ChevronDown,
  Plus,
  Briefcase,
  CalendarCheck,
  Handshake,
  UserCog,
  LogOut,
  User,
  HelpCircle,
} from 'lucide-react';
import CommandPalette from './CommandPalette';
import type { UserSummary } from '@/types/dashboard';

const QUICK_ACTIONS_BASE = [
  { label: 'Add job', href: '/dashboard/jobs/new', icon: Briefcase },
  { label: 'Schedule interview', href: '/dashboard/interviews', icon: CalendarCheck },
  { label: 'Add client', href: '/dashboard/clients/new', icon: Handshake },
];

const QUICK_ACTIONS_ADMIN = [
  { label: 'Add staff member', href: '/dashboard/staff', icon: UserCog },
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

  // Notifications: empty state for now (wire to API later)
  const notifications: { id: string; title: string; body: string; time: string; unread: boolean }[] = [];
  const unreadCount = notifications.filter((n) => n.unread).length;

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
  const displayEmail = currentUser?.email || 'staff@eaglehr.co.ke';
  const initials = getInitials(displayName);
  const quickActions =
    currentUser?.role === 'admin'
      ? [...QUICK_ACTIONS_BASE, ...QUICK_ACTIONS_ADMIN]
      : QUICK_ACTIONS_BASE;

  return (
    <header className="print:hidden sticky top-0 z-30 flex-shrink-0 h-16 bg-white border-b border-neutral-200 flex items-center justify-between gap-4 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
      {/* Search — opens command palette on focus or use Cmd+K / Ctrl+K */}
      <div className="flex-1 max-w-xl min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search jobs, candidates, applications... (⌘K)"
            onFocus={() => setPaletteOpen(true)}
            readOnly
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-primary-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors cursor-pointer"
            aria-label="Search"
          />
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        initialQuery=""
      />

      {/* Right: Quick actions, Help, Notifications, User */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Quick actions */}
        <div className="relative" ref={quickActionsRef}>
          <button
            type="button"
            onClick={() => setQuickActionsOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-primary-900 transition-colors text-sm font-medium"
            aria-label="Quick actions"
            aria-expanded={quickActionsOpen}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Quick actions</span>
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </button>
          {quickActionsOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden py-1">
              {quickActions.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href + label}
                  href={href}
                  onClick={() => setQuickActionsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-900 transition-colors"
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
          className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-primary-600 transition-colors"
          aria-label="Help / Contact"
          title="Help & contact"
        >
          <HelpCircle className="w-5 h-5" />
        </Link>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-primary-900 transition-colors"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                <h3 className="text-sm font-semibold text-primary-900">Notifications</h3>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-sm text-neutral-500 text-center">
                    No notifications yet. New applications and interview reminders will appear here.
                  </p>
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {notifications.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={`w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors flex gap-3 ${n.unread ? 'bg-primary-50/50' : ''}`}
                        >
                          <span className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-primary-900 truncate">{n.title}</p>
                            <p className="text-xs text-neutral-600 truncate">{n.body}</p>
                            <p className="text-xs text-neutral-400 mt-0.5">{n.time}</p>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-neutral-200 bg-neutral-50">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary-600 hover:text-primary-800"
                  >
                    View all notifications
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
            className="flex items-center gap-2 p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-primary-900 transition-colors"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary-700">{initials}</span>
            </div>
            <div className="hidden md:block text-left min-w-0">
              <p className="text-sm font-medium text-primary-900 truncate">{displayName}</p>
              <p className="text-xs text-neutral-500 truncate">{displayEmail}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-60 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden py-1">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-medium text-primary-900">{displayName}</p>
                <p className="text-xs text-neutral-500 truncate">{displayEmail}</p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-900 transition-colors"
              >
                <User className="w-4 h-4 text-neutral-500" />
                Dashboard home
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-neutral-700 hover:bg-red-50 hover:text-red-700 transition-colors"
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
