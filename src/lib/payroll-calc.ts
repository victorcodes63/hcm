/**
 * Kenyan payroll statutory calculations.
 * PAYE, NSSF, NHIF - auto-calculated but overridable by user.
 */

// PAYE brackets (monthly, KES) - 2023 onwards
const PAYE_BRACKETS = [
  { max: 24_000, rate: 0.1 },
  { max: 32_333, rate: 0.25 },
  { max: 500_000, rate: 0.3 },
  { max: 800_000, rate: 0.325 },
  { max: Infinity, rate: 0.35 },
];
const PERSONAL_RELIEF = 2_400;

// NSSF Tier I: 400 employee contribution (up to 8k pensionable). Tier II: 6% of (pensionable - 8000), capped. Max total 4320.
function calcNSSF(grossPay: number): number {
  const pensionable = Math.min(grossPay, 72_000); // cap pensionable earnings
  if (pensionable <= 8_000) return 400;
  const tierI = 400;
  const tierII = Math.min((pensionable - 8_000) * 0.06, 3_920);
  return Math.min(Math.round(tierI + tierII), 4_320);
}

// NHIF brackets (monthly gross, KES) - traditional rates
const NHIF_BRACKETS: { min: number; amount: number }[] = [
  { min: 0, amount: 150 },
  { min: 6_000, amount: 300 },
  { min: 8_000, amount: 400 },
  { min: 12_000, amount: 500 },
  { min: 15_000, amount: 600 },
  { min: 20_000, amount: 750 },
  { min: 25_000, amount: 850 },
  { min: 30_000, amount: 900 },
  { min: 35_000, amount: 950 },
  { min: 40_000, amount: 1_000 },
  { min: 45_000, amount: 1_100 },
  { min: 50_000, amount: 1_200 },
  { min: 60_000, amount: 1_400 },
  { min: 70_000, amount: 1_500 },
  { min: 80_000, amount: 1_600 },
  { min: 90_000, amount: 1_700 },
  { min: 100_000, amount: 1_800 },
];

function calcNHIF(grossPay: number): number {
  let amount = 150;
  for (let i = NHIF_BRACKETS.length - 1; i >= 0; i--) {
    if (grossPay >= NHIF_BRACKETS[i].min) {
      amount = NHIF_BRACKETS[i].amount;
      break;
    }
  }
  return amount;
}

function calcPAYE(grossPay: number, nssf: number, nhif: number): number {
  const taxableIncome = Math.max(0, grossPay - nssf - nhif);
  let paye = 0;
  let remaining = taxableIncome;
  let prevMax = 0;

  for (const bracket of PAYE_BRACKETS) {
    if (remaining <= 0) break;
    const band = Math.min(remaining, bracket.max - prevMax);
    if (band > 0) paye += band * bracket.rate;
    remaining -= band;
    prevMax = bracket.max;
  }

  return Math.max(0, Math.round(paye - PERSONAL_RELIEF));
}

export interface StatutoryResult {
  grossPay: number;
  paye: number;
  nssf: number;
  nhif: number;
  netPay: number;
}

export function calculateStatutory(
  grossPay: number,
  otherDeductionsTotal: number = 0
): StatutoryResult {
  const nssf = calcNSSF(grossPay);
  const nhif = calcNHIF(grossPay);
  const paye = calcPAYE(grossPay, nssf, nhif);
  const netPay = grossPay - paye - nssf - nhif - otherDeductionsTotal;
  return { grossPay, paye, nssf, nhif, netPay };
}
