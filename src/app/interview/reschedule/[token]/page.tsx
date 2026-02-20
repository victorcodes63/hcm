'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type InterviewInfo = {
  valid: boolean;
  jobTitle: string;
  companyName: string;
  dateStr: string;
  timeStr: string;
  status: string;
};

export default function InterviewReschedulePage() {
  const params = useParams();
  const token = params.token as string;
  const [info, setInfo] = useState<InterviewInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/interview/respond?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid !== false && !data.error) {
          setInfo(data);
        } else {
          setError(data.error || 'Invalid or expired link.');
        }
      })
      .catch(() => setError('Failed to load.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/interview/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'reschedule', notes: notes.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setDone({ success: true, message: data.message });
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#043d4a] mx-auto mb-4" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !info) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-neutral-200 p-8 text-center">
          <h1 className="text-xl font-bold text-[#043d4a] mb-2">Invalid link</h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 bg-[#043d4a] text-white rounded-lg font-semibold hover:bg-[#032a32]"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-neutral-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#043d4a] mb-2">Request received</h1>
          <p className="text-neutral-600 mb-6">{done.message}</p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 bg-[#043d4a] text-white rounded-lg font-semibold hover:bg-[#032a32]"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const alreadyResponded = info?.status && info.status !== 'pending';

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
        <div className="bg-neutral-100 px-6 py-4 flex items-center gap-3 border-b border-neutral-200">
          <Link href="/" className="block shrink-0">
            <Image src="/images/logo/logo_dark_ubxaCll.png" alt="Eagle HR" width={120} height={40} className="h-8 w-auto" />
          </Link>
        </div>
        <div className="p-6 sm:p-8">
          <h1 className="text-xl font-bold text-[#043d4a] mb-1">Cannot attend / Request reschedule</h1>
          <p className="text-neutral-600 mb-6">
            {info?.jobTitle} at {info?.companyName}
          </p>
          <div className="bg-neutral-50 rounded-lg p-4 mb-6 text-sm text-neutral-700">
            <p>
              <strong>Date:</strong> {info?.dateStr}
            </p>
            <p>
              <strong>Time:</strong> {info?.timeStr}
            </p>
          </div>

          {alreadyResponded ? (
            <p className="text-amber-700 bg-amber-50 px-4 py-3 rounded-lg">
              You have already responded to this invite.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <p className="text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4">{error}</p>
              )}
              <label htmlFor="notes" className="block text-sm font-medium text-[#043d4a] mb-2">
                Reason or preferred times <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="e.g. I have a conflict. Would Tuesday afternoon work?"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#043d4a] focus:border-transparent text-base mb-4"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-[#6b7280] text-white rounded-lg font-semibold hover:bg-[#4b5563] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit request'}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-neutral-500 text-center">
            Can attend after all?{' '}
            <Link href={`/interview/confirm/${token}`} className="text-[#043d4a] font-medium hover:underline">
              Confirm attendance
            </Link>
            {' · '}
            <Link href={`/interview/withdraw/${token}`} className="text-red-600 font-medium hover:underline">
              Withdraw from role
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
