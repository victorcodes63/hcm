'use client';

import Link from 'next/link';
import { Users, Plus } from 'lucide-react';

export default function OutsourcingEmployeesPage() {
  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
            Employees
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base">
            Manage employees by client and department.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 text-center">
        <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-neutral-800 mb-2">Coming soon</h2>
        <p className="text-neutral-600 text-sm max-w-md mx-auto mb-6">
          Employee management with client assignment, departments, KRA PIN, NSSF, and NHIF details
          will be available here.
        </p>
        <Link
          href="/dashboard/outsourcing/clients"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add outsourcing clients first
        </Link>
      </div>
    </div>
  );
}
