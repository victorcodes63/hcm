'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { FolderOpen, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useEntity } from '@/components/EntitySwitcher';

interface Department {
  id: string;
  name: string;
  employeeCount: number;
}

function DepartmentsPageInner() {
  const { activeEntity } = useEntity();
  const [clientId, setClientId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDepartments = async (resolvedClientId?: string) => {
    try {
      setError(null);
      setLoading(true);
      const clientsRes = await fetch('/api/outsourcing/clients');
      const clientsData = await clientsRes.json().catch(() => []);
      const singletonId =
        resolvedClientId ||
        (Array.isArray(clientsData) && clientsData[0]?.id ? String(clientsData[0].id) : '');
      if (!singletonId) {
        setDepartments([]);
        return;
      }
      setClientId(singletonId);

      const res = await fetch(`/api/outsourcing/clients/${singletonId}/departments`);
      const data = await res.json().catch(() => []);
      setDepartments(Array.isArray(data) ? data : []);
    } catch {
      setDepartments([]);
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDepartments();
  }, [activeEntity.id]);

  const filteredDepartments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter((d) => d.name.toLowerCase().includes(q));
  }, [departments, searchQuery]);

  const totals = useMemo(() => {
    const deptCount = departments.length;
    const staffCount = departments.reduce((sum, d) => sum + (d.employeeCount ?? 0), 0);
    return { deptCount, staffCount };
  }, [departments]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !newName.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(`/api/outsourcing/clients/${clientId}/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to add department');
      setDepartments((prev) => [...prev, data]);
      setNewName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add department');
    } finally {
      setAdding(false);
    }
  };

  const handleSaveEdit = async (deptId: string) => {
    if (!clientId || !editName.trim()) return;
    try {
      const res = await fetch(`/api/outsourcing/clients/${clientId}/departments/${deptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update department');
      setDepartments((prev) => prev.map((d) => (d.id === deptId ? { ...d, name: data.name } : d)));
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update department');
    }
  };

  const handleDelete = async (deptId: string, name: string) => {
    if (!clientId) return;
    if (!window.confirm(`Delete department "${name}"? Employees assigned there will be unassigned.`)) return;
    setDeletingId(deptId);
    try {
      const res = await fetch(`/api/outsourcing/clients/${clientId}/departments/${deptId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete department');
      }
      setDepartments((prev) => prev.filter((d) => d.id !== deptId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete department');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="h-40 w-full animate-pulse rounded-2xl bg-neutral-100" />;
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900 sm:text-2xl">
          <FolderOpen className="h-7 w-7 text-primary-600" />
          Departments
        </h1>
        <p className="mt-2 text-sm text-neutral-600 sm:text-base">
          Organise departments for stations, LPG, logistics, and head office—keep assignments accurate for payroll and reporting.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-5">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-medium text-neutral-500 mb-1">Departments</p>
          <p className="text-2xl font-semibold text-neutral-900 tabular-nums">{totals.deptCount}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-medium text-neutral-500 mb-1">Staff assigned</p>
          <p className="text-2xl font-semibold text-neutral-900 tabular-nums">{totals.staffCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}

        <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Department name (e.g. LPG Operations, Retail Stations, HSE)"
            className="flex-1 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {adding ? 'Adding...' : 'Add department'}
          </button>
        </form>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search departments..."
            className="w-full max-w-md rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500"
          />
          {searchQuery.trim() ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Clear
            </button>
          ) : null}
        </div>

        {departments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 py-8 text-center text-sm text-neutral-500">
            No departments yet. Add your first department above.
          </p>
        ) : filteredDepartments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 py-8 text-center text-sm text-neutral-500">
            No departments match &quot;{searchQuery.trim()}&quot;.
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredDepartments.map((dept, index) => (
              <li
                key={dept.id}
                className={`flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-4 py-3 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                }`}
              >
                {editingId === dept.id ? (
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="min-w-[12rem] flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(dept.id)}
                      className="rounded-lg bg-primary-900 px-3 py-2 text-sm font-medium text-white"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0 flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 shrink-0 text-neutral-400" />
                      <div>
                        <p className="font-semibold text-neutral-900">{dept.name}</p>
                        <p className="flex items-center gap-1 text-xs text-neutral-500">
                          <Users className="h-3.5 w-3.5" />
                          {dept.employeeCount} employee{dept.employeeCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(dept.id);
                          setEditName(dept.name);
                        }}
                        className="rounded-lg p-2 text-neutral-600 hover:border-neutral-200 hover:bg-white"
                        aria-label="Edit department"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(dept.id, dept.name)}
                        disabled={deletingId === dept.id}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        aria-label="Delete department"
                      >
                        <Trash2 className="h-4 w-4" />
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
  );
}

export default function DepartmentsPage() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-neutral-100" />}>
      <DepartmentsPageInner />
    </Suspense>
  );
}

