'use client';

import { useEffect, useState } from 'react';
import { Fingerprint, RefreshCw } from 'lucide-react';

type Device = {
  id: string;
  name: string;
  adapterKind: string;
  isActive: boolean;
  clientName: string;
  punchCount: number;
  lastObservedAt: string | null;
};

export default function BiometricDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/biometric/devices', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load biometric devices');
      setDevices(json.devices ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load biometric devices');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="w-full min-w-0">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 flex items-center gap-2">
            <Fingerprint className="w-7 h-7 text-primary-700" />
            Biometric devices
          </h1>
          <p className="text-sm text-neutral-600">Monitor device health and punch sync activity.</p>
        </div>
        <button type="button" onClick={() => void load()} className="h-9 rounded border border-neutral-300 px-3 text-sm bg-white inline-flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error ? <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="text-left px-3 py-2">Device</th>
              <th className="text-left px-3 py-2">Client</th>
              <th className="text-left px-3 py-2">Adapter</th>
              <th className="text-left px-3 py-2">Punches</th>
              <th className="text-left px-3 py-2">Last Seen</th>
              <th className="text-left px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id} className="border-t border-neutral-100">
                <td className="px-3 py-2 font-medium">{device.name}</td>
                <td className="px-3 py-2">{device.clientName}</td>
                <td className="px-3 py-2">{device.adapterKind}</td>
                <td className="px-3 py-2">{device.punchCount}</td>
                <td className="px-3 py-2">{device.lastObservedAt ? new Date(device.lastObservedAt).toLocaleString() : 'Never'}</td>
                <td className="px-3 py-2">{device.isActive ? 'Active' : 'Disabled'}</td>
              </tr>
            ))}
            {!loading && devices.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-neutral-500">No biometric devices registered yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
