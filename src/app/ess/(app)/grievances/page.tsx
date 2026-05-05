'use client';

import { useEffect, useState } from 'react';

type Grievance = {
  id: string;
  grievanceNumber: string;
  subject: string;
  category: string;
  status: string;
  submittedAt: string;
};

export default function EssGrievancesPage() {
  const [items, setItems] = useState<Grievance[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/ess/grievances');
    const data = await res.json().catch(() => []);
    if (res.ok) setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit() {
    setError(null);
    const res = await fetch('/api/ess/grievances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, description, category }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error || 'Failed to submit grievance');
      return;
    }
    setSubject('');
    setDescription('');
    setCategory('OTHER');
    await load();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-primary-900">My grievances</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Use this form for workplace concerns (safety, harassment, workload, management, and similar). Your case is logged and reviewed under the employer’s grievance procedure and applicable labour law. This is not the same as a{' '}
          <a className="font-medium text-primary-700 underline" href="/ess/disciplinary">
            disciplinary case
          </a>{' '}
          against you.
        </p>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-sm font-semibold">Submit grievance</p>
        <div className="mt-2 space-y-2">
          <select className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
            {['WORKPLACE_SAFETY','HARASSMENT','DISCRIMINATION','WORKLOAD','MANAGEMENT','COMPENSATION','POLICY','OTHER'].map((c) => <option key={c} value={c}>{c.replaceAll('_', ' ')}</option>)}
          </select>
          <input className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          <textarea className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the grievance" />
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <button onClick={submit} className="rounded bg-primary-900 px-4 py-2 text-sm text-white">Submit</button>
        </div>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-neutral-500"><th>Number</th><th>Subject</th><th>Category</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-neutral-100">
                <td className="py-2">{item.grievanceNumber}</td>
                <td>{item.subject}</td>
                <td>{item.category.replaceAll('_', ' ')}</td>
                <td>{item.status.replaceAll('_', ' ')}</td>
                <td>{new Date(item.submittedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
