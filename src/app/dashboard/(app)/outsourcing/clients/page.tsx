'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Building2, Plus, Pencil, Trash2, Search, Users, FolderOpen } from 'lucide-react';

interface OutsourcingClientRecord {
  id: string;
  name: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  employeeCount?: number;
  departmentCount?: number;
}

export default function OutsourcingClientsPage() {
  const [clients, setClients] = useState<OutsourcingClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/outsourcing/clients');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Failed to load clients');
      }
      setClients(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((client) => {
      const name = client.name.toLowerCase();
      const contact = [client.contactName, client.contactEmail, client.contactPhone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return name.includes(q) || contact.includes(q);
    });
  }, [clients, searchQuery]);

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Delete outsourcing client "${name}"? Employees, departments, payroll, and related data will be removed.`
      )
    )
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/outsourcing/clients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchClients();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete client');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
            Outsourcing Clients
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base">
            Manage client companies you provide HR outsourcing services to. Add departments and
            employees within each client.
          </p>
        </div>
        <Link
          href="/dashboard/outsourcing/clients/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] sm:min-h-0 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
          Add client
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3" />
            <div className="h-4 bg-neutral-100 rounded w-full" />
            <div className="h-4 bg-neutral-100 rounded w-5/6" />
          </div>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
          <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 mb-4">
            No outsourcing clients yet. Add a client to manage employees, payroll, leave, and
            attendance.
          </p>
          <Link
            href="/dashboard/outsourcing/clients/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-900 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add client
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5">
            <div className="relative max-w-xs sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search by name or contact…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              />
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
              <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No clients match your search.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden min-w-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/80">
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Client name
                      </th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Contact
                      </th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Departments
                      </th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Employees
                      </th>
                      <th className="text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4 sm:px-5 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-4 sm:px-5 py-3">
                          <Link
                            href={`/dashboard/outsourcing/clients/${client.id}`}
                            className="font-medium text-primary-900 text-sm hover:text-primary-700 hover:underline"
                          >
                            {client.name}
                          </Link>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-neutral-600 text-sm">
                          {client.contactName || client.contactEmail || client.contactPhone ? (
                            <span
                              className="truncate max-w-[200px] block"
                              title={[client.contactName, client.contactEmail, client.contactPhone]
                                .filter(Boolean)
                                .join(' · ')}
                            >
                              {[client.contactName, client.contactEmail, client.contactPhone]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          ) : (
                            <span className="text-neutral-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-neutral-600 text-sm tabular-nums">
                          <Link
                            href={`/dashboard/outsourcing/clients/${client.id}`}
                            className="inline-flex items-center gap-1 hover:text-primary-600"
                            title="Manage departments"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-neutral-400" />
                            {client.departmentCount ?? 0}
                          </Link>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-neutral-600 text-sm tabular-nums">
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-neutral-400" />
                            {client.employeeCount ?? 0}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/outsourcing/clients/${client.id}/edit`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(client.id, client.name)}
                              disabled={deletingId === client.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
