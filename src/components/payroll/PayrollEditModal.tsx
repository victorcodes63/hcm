'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Calculator } from 'lucide-react';
import { calculateStatutory } from '@/lib/payroll-calc';

const STANDARD_ALLOWANCES = [
  { key: 'House Allowance', label: 'House Allowance' },
  { key: 'Comm Allowance', label: 'Comm Allowance' },
  { key: 'Transport Allowance', label: 'Transport Allowance' },
  { key: 'Meal Allowance', label: 'Meal Allowance' },
  { key: 'Medical Allowance', label: 'Medical Allowance' },
];

interface AllowanceRow { name: string; amount: number }
interface DeductionRow { name: string; amount: number }

interface PayrollEditModalProps {
  payrollId: string;
  employeeName: string;
  month: number;
  year: number;
  onClose: () => void;
  onSaved: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getAllowance(allowances: AllowanceRow[], key: string): number {
  const a = allowances.find((x) => x.name === key);
  return a?.amount ?? 0;
}

function setAllowance(allowances: AllowanceRow[], key: string, amount: number): AllowanceRow[] {
  const filtered = allowances.filter((x) => x.name !== key);
  if (amount !== 0) filtered.push({ name: key, amount });
  return filtered.sort((a, b) => a.name.localeCompare(b.name));
}

export default function PayrollEditModal({
  payrollId,
  employeeName,
  month,
  year,
  onClose,
  onSaved,
}: PayrollEditModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [basicPay, setBasicPay] = useState('');
  const [allowances, setAllowances] = useState<AllowanceRow[]>([]);
  const [deductions, setDeductions] = useState<DeductionRow[]>([]);
  const [paye, setPaye] = useState('');
  const [nssf, setNssf] = useState('');
  const [nhif, setNhif] = useState('');
  const [grossPay, setGrossPay] = useState(0);
  const [netPay, setNetPay] = useState(0);
  const [recalcStatutory, setRecalcStatutory] = useState(false);
  const [newDeductionName, setNewDeductionName] = useState('');
  const [newDeductionAmount, setNewDeductionAmount] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/outsourcing/payroll/${payrollId}`);
        const data = await res.json();
        if (!res.ok || cancelled) return;
        setBasicPay(String(data.basicPay ?? 0));
        setAllowances(Array.isArray(data.allowances) ? data.allowances : []);
        setDeductions(Array.isArray(data.deductions) ? data.deductions : []);
        setPaye(String(data.paye ?? 0));
        setNssf(String(data.nssf ?? 0));
        setNhif(String(data.nhif ?? 0));
        setGrossPay(Number(data.grossPay ?? 0));
        setNetPay(Number(data.netPay ?? 0));
      } catch {
        if (!cancelled) setLoading(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [payrollId]);

  const updateAllowance = (key: string, value: number) => {
    setAllowances((a) => setAllowance(a, key, value));
  };

  const addDeduction = () => {
    const name = newDeductionName.trim();
    const amount = parseFloat(newDeductionAmount) || 0;
    if (name && amount >= 0) {
      setDeductions((d) => [...d.filter((x) => x.name !== name), { name, amount }]);
      setNewDeductionName('');
      setNewDeductionAmount('');
    }
  };

  const removeDeduction = (name: string) => {
    setDeductions((d) => d.filter((x) => x.name !== name));
  };

  const allowancesTotal = allowances.reduce((s, a) => s + a.amount, 0);
  const basicPayNum = parseFloat(String(basicPay).replace(/,/g, '')) || 0;
  const gross = basicPayNum + allowancesTotal;
  const deductionsTotal = deductions.reduce((s, d) => s + d.amount, 0);
  const payeNum = parseFloat(paye.replace(/,/g, '')) || 0;
  const nssfNum = parseFloat(nssf.replace(/,/g, '')) || 0;
  const nhifNum = parseFloat(nhif.replace(/,/g, '')) || 0;
  const net = gross - payeNum - nssfNum - nhifNum - deductionsTotal;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/outsourcing/payroll/${payrollId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basicPay: basicPayNum,
          allowances,
          deductions,
          paye: payeNum,
          nssf: nssfNum,
          nhif: nhifNum,
          recalculateStatutory: recalcStatutory,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      onSaved();
      onClose();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRecalcStatutory = () => {
    const gross = basicPayNum + allowancesTotal;
    const otherTotal = deductions.reduce((s, d) => s + d.amount, 0);
    const calc = calculateStatutory(gross, otherTotal);
    setPaye(String(calc.paye));
    setNssf(String(calc.nssf));
    setNhif(String(calc.nhif));
    setRecalcStatutory(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary-900">
            Edit payroll — {employeeName} ({MONTHS[month - 1]} {year})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-semibold text-primary-900 mb-3">Earnings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Basic pay (KES)</label>
                    <input
                      type="number"
                      value={basicPay}
                      onChange={(e) => setBasicPay(e.target.value)}
                      min={0}
                      step={0.01}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  {STANDARD_ALLOWANCES.map(({ key }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">{key} (KES)</label>
                      <input
                        type="number"
                        value={getAllowance(allowances, key) || ''}
                        onChange={(e) => updateAllowance(key, parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.01}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-primary-900 mb-2">Statutory deductions (editable)</h3>
                <p className="text-xs text-neutral-500 mb-3">
                  PAYE, NSSF, NHIF are auto-calculated. Override if needed. Click &quot;Recalculate&quot; to apply Kenyan rates.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">PAYE (KES)</label>
                    <input
                      type="number"
                      value={paye}
                      onChange={(e) => setPaye(e.target.value)}
                      min={0}
                      step={0.01}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">NSSF (KES)</label>
                    <input
                      type="number"
                      value={nssf}
                      onChange={(e) => setNssf(e.target.value)}
                      min={0}
                      step={0.01}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">NHIF (KES)</label>
                    <input
                      type="number"
                      value={nhif}
                      onChange={(e) => setNhif(e.target.value)}
                      min={0}
                      step={0.01}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRecalcStatutory}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100"
                >
                  <Calculator className="w-4 h-4" />
                  Recalculate statutory (apply Kenyan rates)
                </button>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-primary-900 mb-2">Other deductions</h3>
                <div className="space-y-2">
                  {deductions.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="flex-1 text-sm">{d.name}</span>
                      <span className="tabular-nums text-sm">{d.amount.toLocaleString('en-KE')}</span>
                      <button
                        type="button"
                        onClick={() => removeDeduction(d.name)}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={newDeductionName}
                    onChange={(e) => setNewDeductionName(e.target.value)}
                    placeholder="e.g. Advance, Loan, SACCO"
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={newDeductionAmount}
                    onChange={(e) => setNewDeductionAmount(e.target.value)}
                    placeholder="Amount"
                    min={0}
                    step={0.01}
                    className="w-28 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={addDeduction}
                    className="px-3 py-2 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Gross pay</span>
                  <span className="font-medium tabular-nums">{gross.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-neutral-600">Net pay</span>
                  <span className="font-semibold tabular-nums text-primary-700">{net.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {!loading && (
          <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
