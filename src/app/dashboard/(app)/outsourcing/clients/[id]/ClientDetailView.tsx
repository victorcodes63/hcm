'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Pencil,
  Plus,
  Trash2,
  Users,
  FolderOpen,
  ChevronLeft,
  Mail,
  Phone,
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  employeeCount: number;
}

interface ClientDetail {
  id: string;
  name: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  kraPin?: string | null;
  bankName?: string | null;
  currency?: string | null;
}

interface ClientDetailViewProps {
  clientId: string;
}

export default function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingDeptId, setDeletingDeptId] = useState<string | null>(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [addingDept, setAddingDept] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editDeptName, setEditDeptName] = useState('');

  const fetchClient = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/outsourcing/clients/${id}`);
      if (!res.ok) throw new Error('Failed to load client');
      const data = await res.json();
      setClient(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load client');
      setClient(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (id: string) => {
    try {
      const res = await fetch(`/api/outsourcing/clients/${id}/departments`);
      if (!res.ok) return;
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch {
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchClient(clientId);
    fetchDepartments(clientId);
  }, [clientId]);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !newDeptName.trim()) return;
    setAddingDept(true);
    try {
      const res = await fetch(`/api/outsourcing/clients/${clientId}/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeptName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add department');
      setDepartments((prev) => [...prev, data]);
      setNewDeptName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add department');
    } finally {
      setAddingDept(false);
    }
  };

  const handleUpdateDepartment = async (deptId: string) => {
    if (!clientId || !editDeptName.trim()) return;
    try {
      const res = await fetch(
        `/api/outsourcing/clients/${clientId}/departments/${deptId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editDeptName.trim() }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setDepartments((prev) =>
        prev.map((d) => (d.id === deptId ? { ...d, name: data.name } : d))
      );
      setEditingDeptId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const handleDeleteDepartment = async (deptId: string, name: string) => {
    if (!clientId) return;
    if (
      !window.confirm(
        `Delete department "${name}"? Employees in this department will be unassigned.`
      )
    )
      return;
    setDeletingDeptId(deptId);
    try {
      const res = await fetch(
        `/api/outsourcing/clients/${clientId}/departments/${deptId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete');
      }
      setDepartments((prev) => prev.filter((d) => d.id !== deptId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeletingDeptId(null);
    }
  };

  if (loading || !client) {
    return (
      <div className="w-full min-w-0">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3" />
          <div className="h-10 bg-neutral-100 rounded w-full" />
          <div className="h-10 bg-neutral-100 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <nav className="mb-4 sm:mb-5" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-neutral-500">
          <li>
            <Link
              href="/dashboard/outsourcing/clients"
              className="hover:text-primary-700 transition-colors"
            >
              Outsourcing Clients
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-primary-900 font-medium" aria-current="page">
            {client.name}
          </li>
        </ol>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/outsourcing/clients"
              className="text-neutral-500 hover:text-primary-700 transition-colors"
              aria-label="Back to clients"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900">
              {client.name}
            </h1>
          </div>
          <p className="text-neutral-600 text-sm sm:text-base">
            Manage departments and employees for this client.
          </p>
        </div>
        <Link
          href={`/dashboard/outsourcing/clients/${clientId}/edit`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-900 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors shrink-0"
        >
          <Pencil className="w-5 h-5" />
          Edit client
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-base font-semibold text-primary-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600" />
            Client details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(client.contactName || client.contactEmail || client.contactPhone) && (
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
                  Contact
                </p>
                <div className="space-y-1 text-sm text-neutral-700">
                  {client.contactName && <p>{client.contactName}</p>}
                  {client.contactEmail && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      <a
                        href={`mailto:${client.contactEmail}`}
                        className="text-primary-600 hover:underline"
                      >
                        {client.contactEmail}
                      </a>
                    </p>
                  )}
                  {client.contactPhone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      <a
                        href={`tel:${client.contactPhone}`}
                        className="text-primary-600 hover:underline"
                      >
                        {client.contactPhone}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}
            {client.kraPin && (
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
                  KRA PIN
                </p>
                <p className="text-sm text-neutral-700">{client.kraPin}</p>
              </div>
            )}
            {client.bankName && (
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
                  Bank
                </p>
                <p className="text-sm text-neutral-700">
                  {client.bankName}
                  {client.currency && ` (${client.currency})`}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-base font-semibold text-primary-900 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary-600" />
            Departments
          </h2>
          <p className="text-sm text-neutral-600 mb-4">
            Add departments to organize employees (e.g. Finance, HR, Operations).
          </p>

          <form onSubmit={handleAddDepartment} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="e.g. Finance, HR, Operations"
              className="flex-1 min-w-0 px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={addingDept || !newDeptName.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              {addingDept ? 'Adding…' : 'Add'}
            </button>
          </form>

          {departments.length === 0 ? (
            <p className="text-neutral-500 text-sm py-4">No departments yet. Add one above.</p>
          ) : (
            <ul className="space-y-2">
              {departments.map((dept) => (
                <li
                  key={dept.id}
                  className="flex items-center justify-between gap-4 py-3 px-4 rounded-lg bg-neutral-50 border border-neutral-100"
                >
                  {editingDeptId === dept.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editDeptName}
                        onChange={(e) => setEditDeptName(e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateDepartment(dept.id)}
                        className="px-3 py-2 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDeptId(null);
                          setEditDeptName('');
                        }}
                        className="px-3 py-2 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <FolderOpen className="w-5 h-5 text-neutral-400 shrink-0" />
                        <div>
                          <p className="font-medium text-primary-900">{dept.name}</p>
                          <p className="text-xs text-neutral-500 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {dept.employeeCount} employee{dept.employeeCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDeptId(dept.id);
                            setEditDeptName(dept.name);
                          }}
                          className="p-2 text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                          aria-label="Edit department"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                          disabled={deletingDeptId === dept.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                          aria-label="Delete department"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
