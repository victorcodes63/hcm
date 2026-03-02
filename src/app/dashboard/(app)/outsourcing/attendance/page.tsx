'use client';

import { Clock } from 'lucide-react';

export default function OutsourcingAttendancePage() {
  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1">
            Attendance
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base">
            Check-in and check-out records.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 text-center">
        <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-neutral-800 mb-2">Coming soon</h2>
        <p className="text-neutral-600 text-sm max-w-md mx-auto">
          Daily attendance tracking with check-in and check-out times will be available here.
        </p>
      </div>
    </div>
  );
}
