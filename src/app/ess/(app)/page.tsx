'use client';

import { useEffect, useState } from 'react';

type LeaveItem = { id: string; status: string; startDate: string; endDate: string };
type Payslip = { id: string; month: number; year: number; netPay: number; status: string };

export default function EssOverviewPage() {
  const [leaveItems, setLeaveItems] = useState<LeaveItem[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);

  useEffect(() => {
    fetch('/api/ess/leave/applications')
      .then((r) => r.json())
      .then((data) => setLeaveItems(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => setLeaveItems([]));

    fetch('/api/ess/payslips')
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        setPayslips(items.slice(0, 3));
      })
      .catch(() => setPayslips([]));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">Overview</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-white border border-neutral-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3">Recent leave requests</h2>
          <div className="space-y-2">
            {leaveItems.length ? leaveItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                <p className="font-medium text-neutral-800">{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</p>
                <p className="text-neutral-600 capitalize">{item.status}</p>
              </div>
            )) : <p className="text-sm text-neutral-500">No leave requests yet.</p>}
          </div>
        </section>

        <section className="bg-white border border-neutral-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3">Recent payslips</h2>
          <div className="space-y-2">
            {payslips.length ? payslips.map((item) => (
              <div key={item.id} className="rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                <p className="font-medium text-neutral-800">{item.month}/{item.year}</p>
                <p className="text-neutral-600">Net pay: KES {item.netPay.toLocaleString()}</p>
              </div>
            )) : <p className="text-sm text-neutral-500">No payslips available yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
