'use client';

import { useEffect, useMemo, useState } from 'react';
import { Shield } from 'lucide-react';
import { useEntity } from '@/components/EntitySwitcher';
import { EntityContextBanner } from '@/components/EntityContextBanner';
import { stationBelongsToEntity, type EntityId } from '@/lib/entityConfig';
import { toast } from '@/components/ui/toast';

type IncidentType =
  | 'Fuel Spill'
  | 'Fire/Explosion Risk'
  | 'Personal Injury'
  | 'Near Miss'
  | 'Equipment Failure';

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
type IncidentStatus = 'Open' | 'Under Investigation' | 'Resolved' | 'Closed';

type IncidentRow = {
  ref: string;
  date: string;
  station: string;
  type: IncidentType;
  severity: Severity;
  reportedBy: string;
  status: IncidentStatus;
  description: string;
};

const STATIONS = [
  'Nansana Station',
  'Kampala Central',
  'Nairobi West',
  'Mombasa Road',
  'Jinja Highway',
  'Nakuru Depot',
] as const;

const DEMO_INCIDENTS: IncidentRow[] = [
  {
    ref: 'INC-2025-001',
    date: '2026-05-01T06:40:00',
    station: 'Mombasa Road',
    type: 'Fuel Spill',
    severity: 'High',
    reportedBy: 'Shift Lead — A. Otieno',
    status: 'Open',
    description: 'Approx. 4L unleaded on forecourt near pump 3 after hose coupling fatigue.',
  },
  {
    ref: 'INC-2025-002',
    date: '2026-04-28T14:15:00',
    station: 'Nansana Station',
    type: 'Near Miss',
    severity: 'Medium',
    reportedBy: 'Station Attendant — J. Okello',
    status: 'Under Investigation',
    description: 'Vehicle rolled forward before nozzle removed; guard stopped flow in time.',
  },
  {
    ref: 'INC-2025-003',
    date: '2026-04-22T09:05:00',
    station: 'Kampala Central',
    type: 'Personal Injury',
    severity: 'Critical',
    reportedBy: 'Depot Supervisor — M. Namukasa',
    status: 'Under Investigation',
    description: 'Slip on wet LPG cage pad; ankle sprain; first aid administered.',
  },
  {
    ref: 'INC-2025-004',
    date: '2026-04-18T22:30:00',
    station: 'Nairobi West',
    type: 'Fire/Explosion Risk',
    severity: 'High',
    reportedBy: 'Night Lead — P. Wanjala',
    status: 'Resolved',
    description: 'Vapour ignited at drain point; extinguishers deployed; EV isolated.',
  },
  {
    ref: 'INC-2025-005',
    date: '2026-04-10T11:20:00',
    station: 'Jinja Highway',
    type: 'Equipment Failure',
    severity: 'Low',
    reportedBy: 'Maintenance — R. Ssemwogerere',
    status: 'Closed',
    description: 'ATG alarm drift; probe recalibrated; no product loss.',
  },
  {
    ref: 'INC-2025-006',
    date: '2026-04-02T07:55:00',
    station: 'Nakuru Depot',
    type: 'Fuel Spill',
    severity: 'Medium',
    reportedBy: 'Loader — D. Mutai',
    status: 'Open',
    description: 'Loading arm drip tray overflow during peak offload.',
  },
];

function severityBadge(sev: Severity) {
  switch (sev) {
    case 'Critical':
      return 'bg-red-100 text-red-800';
    case 'High':
      return 'bg-orange-100 text-orange-800';
    case 'Medium':
      return 'bg-amber-100 text-amber-900';
    default:
      return 'bg-neutral-100 text-neutral-600';
  }
}

function statusBadge(st: IncidentStatus) {
  switch (st) {
    case 'Open':
      return 'bg-red-100 text-red-800';
    case 'Under Investigation':
      return 'bg-amber-100 text-amber-900';
    case 'Resolved':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-neutral-100 text-neutral-600';
  }
}

const PHANTOM_STATION = {
  ug: 'Entebbe Marine Depot',
  ke: 'Kisumu Bay Depot',
} as const;

export default function HseIncidentsPage() {
  const { activeEntity } = useEntity();
  const entityId = activeEntity.id as EntityId;

  const [stationFilter, setStationFilter] = useState('');
  const [logOpen, setLogOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<IncidentRow | null>(null);

  const stationsForEntity = useMemo(
    () => STATIONS.filter((s) => stationBelongsToEntity(s, entityId)),
    [entityId],
  );

  const incidentsForEntity = useMemo(
    () => DEMO_INCIDENTS.filter((r) => stationBelongsToEntity(r.station, entityId)),
    [entityId],
  );

  const [logForm, setLogForm] = useState({
    station: STATIONS[0] as string,
    type: 'Fuel Spill' as IncidentType,
    severity: 'Medium' as Severity,
    datetime: '2026-05-05T10:00',
    description: '',
    injuredParty: '',
    immediateAction: '',
  });

  useEffect(() => {
    const first = stationsForEntity[0] ?? STATIONS[0];
    setLogForm((f) => ({
      ...f,
      station: (stationsForEntity as readonly string[]).includes(f.station) ? f.station : first,
    }));
  }, [entityId, stationsForEntity]);

  useEffect(() => {
    if (!stationFilter) return;
    if (stationFilter === PHANTOM_STATION[entityId]) return;
    if (!stationsForEntity.includes(stationFilter as (typeof STATIONS)[number])) setStationFilter('');
  }, [entityId, stationFilter, stationsForEntity]);

  const stationFilterOptions = useMemo(
    () => [...stationsForEntity, PHANTOM_STATION[entityId]] as string[],
    [entityId, stationsForEntity],
  );

  const filtered = useMemo(() => {
    if (!stationFilter) return incidentsForEntity;
    if (stationFilter === PHANTOM_STATION[entityId]) return [];
    return incidentsForEntity.filter((r) => r.station === stationFilter);
  }, [stationFilter, incidentsForEntity, entityId]);

  const openIncidents = incidentsForEntity.filter((r) => r.status === 'Open').length;
  const followUpCount = incidentsForEntity.filter((r) => r.status === 'Open' || r.status === 'Under Investigation').length;
  const resolvedThisMonth = incidentsForEntity.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;
  const nearMisses = incidentsForEntity.filter((r) => r.type === 'Near Miss').length;
  const daysSince = useMemo(() => {
    if (incidentsForEntity.length === 0) return '—';
    const latest = incidentsForEntity.reduce(
      (max, r) => (new Date(r.date).getTime() > new Date(max).getTime() ? r.date : max),
      incidentsForEntity[0].date,
    );
    const days = Math.floor((Date.now() - new Date(latest).getTime()) / (86400 * 1000));
    return Math.max(0, days);
  }, [incidentsForEntity]);

  const submitLog = (e: React.FormEvent) => {
    e.preventDefault();
    setLogOpen(false);
    setLogForm((f) => ({
      ...f,
      description: '',
      injuredParty: '',
      immediateAction: '',
    }));
    toast.success('Incident logged. Ref #INC-2025-007 assigned.');
  };

  const openModal = () => {
    const first = stationsForEntity[0] ?? STATIONS[0];
    setLogForm((f) => ({ ...f, station: first }));
    setLogOpen(true);
  };

  return (
    <div className="page-shell space-y-6">
      <header className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">HSE & Incident Management</h1>
          <p className="page-description max-w-2xl">Log, track and resolve safety incidents across all stations</p>
          <EntityContextBanner />
        </div>
        <button
          type="button"
          className="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-amber-500"
          onClick={openModal}
        >
          Log Incident
        </button>
      </header>

      <div className="rounded-lg border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-neutral-900 shadow-sm">
        <span className="font-medium">
          {followUpCount} incident{followUpCount === 1 ? '' : 's'} require follow-up action
        </span>
        {' · '}
        <a href="#incidents-table" className="font-semibold text-neutral-900 underline decoration-amber-700 underline-offset-2 hover:text-amber-950">
          View Open Incidents
        </a>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">Open Incidents</p>
          <p className="text-2xl font-semibold text-red-700 tabular-nums">{openIncidents}</p>
        </article>
        <article className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">Resolved This Month</p>
          <p className="text-2xl font-semibold text-green-700 tabular-nums">{resolvedThisMonth}</p>
        </article>
        <article className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">Near Misses Logged</p>
          <p className="text-2xl font-semibold text-amber-700 tabular-nums">{nearMisses}</p>
        </article>
        <article className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">Days Since Last Incident</p>
          <p className="text-[34px] font-semibold leading-none text-ink tabular-nums">{daysSince}</p>
        </article>
      </section>

      <div id="incidents-table" className="scroll-mt-6">
        <div className="filter-bar mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50">
          <div>
            <label htmlFor="hse-station-filter" className="mr-2 text-sm text-neutral-600">
              Station
            </label>
            <select
              id="hse-station-filter"
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="">All stations</option>
              {stationFilterOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="data-table-wrap">
          <div className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-base font-medium text-ink">Incident register</h2>
          </div>
          {filtered.length === 0 ? (
            <div className="table-empty-state">
              <Shield className="h-12 w-12 text-neutral-400" aria-hidden />
              <p className="text-base font-semibold text-neutral-900">No incidents found</p>
              <p className="text-sm text-neutral-500">All clear for this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table min-w-[1000px]">
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Date</th>
                    <th>Station</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Reported By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.ref}>
                      <td className="font-medium text-neutral-900">{row.ref}</td>
                      <td data-numeric="true">{new Date(row.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{row.station}</td>
                      <td>{row.type}</td>
                      <td>
                        <span className={`badge-status ${severityBadge(row.severity)}`}>{row.severity}</span>
                      </td>
                      <td>{row.reportedBy}</td>
                      <td>
                        <span className={`badge-status ${statusBadge(row.status)}`}>{row.status}</span>
                      </td>
                      <td>
                        <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setDetailRow(row)}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {logOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hse-log-title"
          onClick={() => setLogOpen(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl md:max-w-xl md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="hse-log-title" className="text-lg font-semibold text-primary-900">
              Log incident
            </h3>
            <form className="mt-6 space-y-4" onSubmit={submitLog}>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Station</label>
                <select
                  required
                  value={logForm.station}
                  onChange={(e) => setLogForm((f) => ({ ...f, station: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                >
                  {stationsForEntity.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Incident type</label>
                <select
                  required
                  value={logForm.type}
                  onChange={(e) => setLogForm((f) => ({ ...f, type: e.target.value as IncidentType }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option>Fuel Spill</option>
                  <option>Fire/Explosion Risk</option>
                  <option>Personal Injury</option>
                  <option>Near Miss</option>
                  <option>Equipment Failure</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Severity</label>
                <select
                  required
                  value={logForm.severity}
                  onChange={(e) => setLogForm((f) => ({ ...f, severity: e.target.value as Severity }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Date &amp; time</label>
                <input
                  type="datetime-local"
                  required
                  value={logForm.datetime}
                  onChange={(e) => setLogForm((f) => ({ ...f, datetime: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Description</label>
                <textarea
                  required
                  rows={4}
                  value={logForm.description}
                  onChange={(e) => setLogForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="What happened, where on site, fuels involved…"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Injured party (optional)</label>
                <input
                  value={logForm.injuredParty}
                  onChange={(e) => setLogForm((f) => ({ ...f, injuredParty: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Name or role if applicable"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Immediate action taken</label>
                <textarea
                  required
                  rows={3}
                  value={logForm.immediateAction}
                  onChange={(e) => setLogForm((f) => ({ ...f, immediateAction: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Isolation, barriers, first aid, supervisor notified…"
                />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setLogOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-amber-500">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hse-detail-title"
          onClick={() => setDetailRow(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="hse-detail-title" className="text-lg font-semibold text-primary-900">
              {detailRow.ref}
            </h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-neutral-100 py-2">
                <dt className="text-neutral-500">Station</dt>
                <dd className="font-medium text-neutral-900">{detailRow.station}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-neutral-100 py-2">
                <dt className="text-neutral-500">Type</dt>
                <dd className="text-neutral-800">{detailRow.type}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-neutral-100 py-2">
                <dt className="text-neutral-500">Severity</dt>
                <dd>
                  <span className={`badge-status ${severityBadge(detailRow.severity)}`}>{detailRow.severity}</span>
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-neutral-100 py-2">
                <dt className="text-neutral-500">Status</dt>
                <dd>
                  <span className={`badge-status ${statusBadge(detailRow.status)}`}>{detailRow.status}</span>
                </dd>
              </div>
              <div className="py-2">
                <dt className="text-neutral-500">Description</dt>
                <dd className="mt-1 text-neutral-800">{detailRow.description}</dd>
              </div>
            </dl>
            <button type="button" className="btn-secondary mt-6" onClick={() => setDetailRow(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
