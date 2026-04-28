'use client';

import { type CSSProperties, useMemo, useState } from 'react';
import { BadgeCheck, BarChart3, ClipboardList, Clock3, Download, Eye, FileSpreadsheet, Landmark, ShieldCheck } from 'lucide-react';

type GenericPayload = Record<string, unknown>;

const cardStyle: CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 16,
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function monthYm() {
  return new Date().toISOString().slice(0, 7);
}

function ActionButton({
  label,
  onClick,
  kind = 'primary',
}: {
  label: string;
  onClick: () => void;
  kind?: 'primary' | 'secondary';
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: kind === 'primary' ? '1px solid #0EA5E9' : '1px solid #CBD5E1',
        background: kind === 'primary' ? '#F0F9FF' : '#FFFFFF',
        color: kind === 'primary' ? '#0C4A6E' : '#334155',
        borderRadius: 999,
        padding: '8px 12px',
        fontSize: 12,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
      }}
    >
      {kind === 'primary' ? <Eye size={14} /> : <Download size={14} />}
      {label}
    </button>
  );
}

export default function ReportsPage() {
  const [headcountAsOf, setHeadcountAsOf] = useState(todayYmd());
  const [attendanceFrom, setAttendanceFrom] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10));
  const [attendanceTo, setAttendanceTo] = useState(todayYmd());
  const [payrollPeriod, setPayrollPeriod] = useState(monthYm());
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);

  const statutoryLinks = useMemo(
    () => [
      { label: 'P9 CSV', type: 'p9' },
      { label: 'P10 CSV', type: 'p10' },
      { label: 'NSSF CSV', type: 'nssf' },
      { label: 'SHIF CSV', type: 'shif' },
    ],
    []
  );

  async function preview(endpoint: string, title: string) {
    setLoading(true);
    setPreviewTitle(title);
    try {
      const res = await fetch(endpoint, { cache: 'no-store' });
      const data = (await res.json()) as GenericPayload;
      const rowCandidates = ['byDepartment', 'byEmployee', 'details', 'rows'] as const;
      const firstRowKey = rowCandidates.find((k) => Array.isArray(data[k]));
      const tableRows = firstRowKey ? (data[firstRowKey] as Array<Record<string, unknown>>) : [];
      setPreviewRows(tableRows);
    } catch {
      setPreviewRows([]);
    } finally {
      setLoading(false);
    }
  }

  function download(url: string) {
    window.open(url, '_blank');
  }

  const reportCards = [
    {
      title: 'Headcount',
      description: 'Employee breakdown by department, type, and workforce mix.',
      icon: <BarChart3 size={20} color="#0C4A6E" />,
      controls: (
        <input type="date" value={headcountAsOf} onChange={(e) => setHeadcountAsOf(e.target.value)} style={{ border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 10px' }} />
      ),
      onView: () => preview(`/api/reports/headcount?asOf=${headcountAsOf}`, 'Headcount Report'),
      onCsv: () => download(`/api/reports/headcount?asOf=${headcountAsOf}&format=csv`),
    },
    {
      title: 'Attendance',
      description: 'Hours, overtime, lateness, and absentee trends.',
      icon: <Clock3 size={20} color="#0C4A6E" />,
      controls: (
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" value={attendanceFrom} onChange={(e) => setAttendanceFrom(e.target.value)} style={{ border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 10px' }} />
          <input type="date" value={attendanceTo} onChange={(e) => setAttendanceTo(e.target.value)} style={{ border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 10px' }} />
        </div>
      ),
      onView: () => preview(`/api/reports/attendance?from=${attendanceFrom}&to=${attendanceTo}`, 'Attendance Report'),
      onCsv: () => download(`/api/reports/attendance?from=${attendanceFrom}&to=${attendanceTo}&format=csv`),
    },
    {
      title: 'Payroll Cost',
      description: 'Gross, net, statutory deductions, and department totals.',
      icon: <Landmark size={20} color="#0C4A6E" />,
      controls: (
        <input type="month" value={payrollPeriod} onChange={(e) => setPayrollPeriod(e.target.value)} style={{ border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 10px' }} />
      ),
      onView: () => preview(`/api/reports/payroll-cost?period=${payrollPeriod}`, 'Payroll Cost Report'),
      onCsv: () => download(`/api/reports/payroll-cost?period=${payrollPeriod}&format=csv`),
    },
    {
      title: 'Credentials',
      description: 'License validity, expiries, and renewal watchlist.',
      icon: <ShieldCheck size={20} color="#0C4A6E" />,
      controls: (
        <span style={{ borderRadius: 999, border: '1px solid #E2E8F0', padding: '5px 10px', fontSize: 12, color: '#475569', width: 'fit-content' }}>
          Status badges ready
        </span>
      ),
      onView: () => preview('/api/reports/credentials', 'Credential Status Report'),
      onCsv: () => download('/api/reports/credentials?format=csv'),
    },
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, color: '#0B1F2A' }}>Reports</h1>
        <p style={{ margin: '8px 0 0', color: '#64748B', fontSize: 14 }}>
          Unified HR, payroll, attendance, and statutory returns export center.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {reportCards.map((card) => (
          <section key={card.title} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {card.icon}
              <h2 style={{ margin: 0, fontSize: 16, color: '#0F172A' }}>{card.title}</h2>
            </div>
            <p style={{ margin: 0, color: '#64748B', fontSize: 13 }}>{card.description}</p>
            {card.controls}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <ActionButton label="View" onClick={card.onView} />
              <ActionButton label="CSV" kind="secondary" onClick={card.onCsv} />
            </div>
          </section>
        ))}

        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={20} color="#0C4A6E" />
            <h2 style={{ margin: 0, fontSize: 16, color: '#0F172A' }}>Statutory Returns</h2>
          </div>
          <p style={{ margin: 0, color: '#64748B', fontSize: 13 }}>
            P9, P10, NSSF, and SHIF formats ready for submission portals.
          </p>
          <input type="month" value={payrollPeriod} onChange={(e) => setPayrollPeriod(e.target.value)} style={{ border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 10px' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {statutoryLinks.map((item) => (
              <button
                key={item.type}
                onClick={() => download(`/api/reports/statutory?period=${payrollPeriod}&type=${item.type}&format=csv`)}
                style={{
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#334155',
                  borderRadius: 999,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <FileSpreadsheet size={14} />
                {item.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <section style={{ ...cardStyle, paddingTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 15, color: '#0F172A' }}>{previewTitle ?? 'Preview'}</h3>
          {loading ? <span style={{ color: '#64748B', fontSize: 12 }}>Loading...</span> : <BadgeCheck size={16} color="#0EA5E9" />}
        </div>
        {!loading && previewRows.length === 0 ? (
          <p style={{ margin: 0, color: '#64748B', fontSize: 13 }}>Select a report and click View to preview tabular data.</p>
        ) : null}
        {!loading && previewRows.length > 0 ? (
          <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead style={{ background: '#F8FAFC' }}>
                <tr>
                  {Object.keys(previewRows[0]).map((key) => (
                    <th key={key} style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #E2E8F0', color: '#334155' }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.slice(0, 100).map((row, i) => (
                  <tr key={`${previewTitle}-${i}`}>
                    {Object.values(row).map((value, idx) => (
                      <td key={idx} style={{ padding: 10, borderBottom: '1px solid #F1F5F9', color: '#0F172A' }}>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
