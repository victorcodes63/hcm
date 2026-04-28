import { PrismaClient, Prisma, CredentialCategory, CredentialStatus, AttendanceSummaryStatus, AttendanceExceptionType, AttendanceExceptionStatus, PayrollStatus, LeaveStatus, AttendancePolicyMode, LeaveAccrualMode, UserRole, StaffUserType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateStatutoryForPayroll } from '../src/lib/payroll-calc';

const prisma = new PrismaClient();
const prismaAny = prisma as any;
const PASSWORD_ROUNDS = 10;

type CompatibilityItem = {
  key: string;
  available: boolean;
  reasonIfSkipped: string;
};

const HOSPITAL = {
  name: '3rd Park Hospital',
  contactName: 'Hospital Administration',
  contactEmail: 'info@3rdparkhospital.com',
  contactPhone: '+254 730 819 900',
  postalAddress: '3rd Parklands Avenue, PMC, 9th Floor, Nairobi',
  county: 'Nairobi',
  employeeNumberPrefix: '3PH',
  payrollFrequency: 'monthly',
  leavePayMode: 'none',
} as const;

type EmployeeSeed = {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  clinical: boolean;
  email: string;
  phone: string;
  idNumber: string;
  kraPin: string;
  nssfNumber: string;
  nhifNumber: string;
  dateOfJoining: Date;
  baseSalary: number;
  allowances: Array<{ name: string; amount: number }>;
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
};

const departments = [
  'Theatres',
  'ICU',
  'HDU',
  'IVF & Endometriosis Centre',
  'Wards',
  'Pharmacy',
  'Laboratory',
  'MIS Training Centre',
  'CSSD',
  'Administration',
  'Radiology',
  'Reception & Front Office',
] as const;

function d(y: number, m: number, day: number): Date {
  return new Date(Date.UTC(y, m - 1, day, 0, 0, 0));
}

function daysFromToday(offset: number): Date {
  const now = new Date();
  const dt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  dt.setUTCDate(dt.getUTCDate() + offset);
  return dt;
}

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function atUtc(dateYmd: string, hhmm: string): Date {
  return new Date(`${dateYmd}T${hhmm}:00.000Z`);
}

const employeesSeed: EmployeeSeed[] = [
  { employeeNumber: '3PH-001', firstName: 'James', lastName: 'Mwangi', role: 'Consultant Surgeon', department: 'Theatres', clinical: true, email: 'james.mwangi@3rdparkhospital.com', phone: '+254 711 201 001', idNumber: '90000001', kraPin: 'A001PHM001K', nssfNumber: '10000000001', nhifNumber: '20000000001', dateOfJoining: d(2022, 2, 14), baseSalary: 350000, allowances: [{ name: 'Housing', amount: 50000 }, { name: 'Transport', amount: 15000 }], bankName: 'KCB Bank', bankBranch: 'Parklands', bankAccountNumber: '1100010001' },
  { employeeNumber: '3PH-002', firstName: 'Sarah', lastName: 'Wanjiku', role: 'Consultant OBGYN', department: 'IVF & Endometriosis Centre', clinical: true, email: 'sarah.wanjiku@3rdparkhospital.com', phone: '+254 711 201 002', idNumber: '90000002', kraPin: 'A001PHM002K', nssfNumber: '10000000002', nhifNumber: '20000000002', dateOfJoining: d(2022, 5, 3), baseSalary: 320000, allowances: [{ name: 'Housing', amount: 50000 }, { name: 'Transport', amount: 15000 }], bankName: 'Equity Bank', bankBranch: 'Westlands', bankAccountNumber: '1100010002' },
  { employeeNumber: '3PH-003', firstName: 'Peter', lastName: 'Ochieng', role: 'Anaesthesiologist', department: 'Theatres', clinical: true, email: 'peter.ochieng@3rdparkhospital.com', phone: '+254 711 201 003', idNumber: '90000003', kraPin: 'A001PHM003K', nssfNumber: '10000000003', nhifNumber: '20000000003', dateOfJoining: d(2023, 1, 9), baseSalary: 300000, allowances: [{ name: 'Housing', amount: 45000 }, { name: 'Transport', amount: 15000 }], bankName: 'Co-operative Bank', bankBranch: 'Upper Hill', bankAccountNumber: '1100010003' },
  { employeeNumber: '3PH-004', firstName: 'Grace', lastName: 'Njeri', role: 'Senior Nurse', department: 'ICU', clinical: true, email: 'grace.njeri@3rdparkhospital.com', phone: '+254 711 201 004', idNumber: '90000004', kraPin: 'A001PHM004K', nssfNumber: '10000000004', nhifNumber: '20000000004', dateOfJoining: d(2021, 7, 12), baseSalary: 85000, allowances: [{ name: 'Housing', amount: 15000 }, { name: 'Transport', amount: 8000 }], bankName: 'Absa Bank Kenya', bankBranch: 'Sarit Centre', bankAccountNumber: '1100010004' },
  { employeeNumber: '3PH-005', firstName: 'Mary', lastName: 'Akinyi', role: 'Nurse', department: 'Wards', clinical: true, email: 'mary.akinyi@3rdparkhospital.com', phone: '+254 711 201 005', idNumber: '90000005', kraPin: 'A001PHM005K', nssfNumber: '10000000005', nhifNumber: '20000000005', dateOfJoining: d(2023, 8, 21), baseSalary: 65000, allowances: [{ name: 'Housing', amount: 12000 }, { name: 'Transport', amount: 6000 }], bankName: 'KCB Bank', bankBranch: 'Yaya Centre', bankAccountNumber: '1100010005' },
  { employeeNumber: '3PH-006', firstName: 'David', lastName: 'Kamau', role: 'Nurse', department: 'HDU', clinical: true, email: 'david.kamau@3rdparkhospital.com', phone: '+254 711 201 006', idNumber: '90000006', kraPin: 'A001PHM006K', nssfNumber: '10000000006', nhifNumber: '20000000006', dateOfJoining: d(2025, 11, 1), baseSalary: 65000, allowances: [{ name: 'Housing', amount: 12000 }, { name: 'Transport', amount: 6000 }], bankName: 'Equity Bank', bankBranch: 'Ngong Road', bankAccountNumber: '1100010006' },
  { employeeNumber: '3PH-007', firstName: 'Faith', lastName: 'Wambui', role: 'Lab Technician', department: 'Laboratory', clinical: true, email: 'faith.wambui@3rdparkhospital.com', phone: '+254 711 201 007', idNumber: '90000007', kraPin: 'A001PHM007K', nssfNumber: '10000000007', nhifNumber: '20000000007', dateOfJoining: d(2024, 3, 4), baseSalary: 80000, allowances: [{ name: 'Housing', amount: 15000 }, { name: 'Transport', amount: 8000 }], bankName: 'NCBA Bank', bankBranch: 'Westlands', bankAccountNumber: '1100010007' },
  { employeeNumber: '3PH-008', firstName: 'Joseph', lastName: 'Otieno', role: 'Pharmacist', department: 'Pharmacy', clinical: true, email: 'joseph.otieno@3rdparkhospital.com', phone: '+254 711 201 008', idNumber: '90000008', kraPin: 'A001PHM008K', nssfNumber: '10000000008', nhifNumber: '20000000008', dateOfJoining: d(2022, 9, 19), baseSalary: 120000, allowances: [{ name: 'Housing', amount: 20000 }, { name: 'Transport', amount: 10000 }], bankName: 'Standard Chartered', bankBranch: 'Chiromo', bankAccountNumber: '1100010008' },
  { employeeNumber: '3PH-009', firstName: 'Agnes', lastName: 'Mutua', role: 'Nurse', department: 'Theatres', clinical: true, email: 'agnes.mutua@3rdparkhospital.com', phone: '+254 711 201 009', idNumber: '90000009', kraPin: 'A001PHM009K', nssfNumber: '10000000009', nhifNumber: '20000000009', dateOfJoining: d(2021, 11, 10), baseSalary: 65000, allowances: [{ name: 'Housing', amount: 12000 }, { name: 'Transport', amount: 6000 }], bankName: 'Co-operative Bank', bankBranch: 'Westlands', bankAccountNumber: '1100010009' },
  { employeeNumber: '3PH-010', firstName: 'Brian', lastName: 'Kipchoge', role: 'Nurse', department: 'Wards', clinical: true, email: 'brian.kipchoge@3rdparkhospital.com', phone: '+254 711 201 010', idNumber: '90000010', kraPin: 'A001PHM010K', nssfNumber: '10000000010', nhifNumber: '20000000010', dateOfJoining: d(2024, 1, 15), baseSalary: 65000, allowances: [{ name: 'Housing', amount: 12000 }, { name: 'Transport', amount: 6000 }], bankName: 'Family Bank', bankBranch: 'Kilimani', bankAccountNumber: '1100010010' },
  { employeeNumber: '3PH-011', firstName: 'Nancy', lastName: 'Chebet', role: 'MIS Technician', department: 'MIS Training Centre', clinical: true, email: 'nancy.chebet@3rdparkhospital.com', phone: '+254 711 201 011', idNumber: '90000011', kraPin: 'A001PHM011K', nssfNumber: '10000000011', nhifNumber: '20000000011', dateOfJoining: d(2025, 1, 6), baseSalary: 75000, allowances: [{ name: 'Housing', amount: 12000 }, { name: 'Transport', amount: 6000 }], bankName: 'I&M Bank', bankBranch: 'Parklands', bankAccountNumber: '1100010011' },
  { employeeNumber: '3PH-012', firstName: 'Daniel', lastName: 'Njoroge', role: 'Radiologist', department: 'Radiology', clinical: true, email: 'daniel.njoroge@3rdparkhospital.com', phone: '+254 711 201 012', idNumber: '90000012', kraPin: 'A001PHM012K', nssfNumber: '10000000012', nhifNumber: '20000000012', dateOfJoining: d(2023, 4, 5), baseSalary: 280000, allowances: [{ name: 'Housing', amount: 45000 }, { name: 'Transport', amount: 15000 }], bankName: 'KCB Bank', bankBranch: 'Upper Hill', bankAccountNumber: '1100010012' },
  { employeeNumber: '3PH-013', firstName: 'Alice', lastName: 'Muthoni', role: 'HR Manager', department: 'Administration', clinical: false, email: 'alice.muthoni@3rdparkhospital.com', phone: '+254 711 201 013', idNumber: '90000013', kraPin: 'A001PHM013K', nssfNumber: '10000000013', nhifNumber: '20000000013', dateOfJoining: d(2021, 3, 1), baseSalary: 150000, allowances: [{ name: 'Housing', amount: 25000 }, { name: 'Transport', amount: 12000 }], bankName: 'Equity Bank', bankBranch: 'Upper Hill', bankAccountNumber: '1100010013' },
  { employeeNumber: '3PH-014', firstName: 'Samuel', lastName: 'Odera', role: 'Accountant', department: 'Administration', clinical: false, email: 'samuel.odera@3rdparkhospital.com', phone: '+254 711 201 014', idNumber: '90000014', kraPin: 'A001PHM014K', nssfNumber: '10000000014', nhifNumber: '20000000014', dateOfJoining: d(2022, 6, 13), baseSalary: 120000, allowances: [{ name: 'Housing', amount: 20000 }, { name: 'Transport', amount: 10000 }], bankName: 'Co-operative Bank', bankBranch: 'City Centre', bankAccountNumber: '1100010014' },
  { employeeNumber: '3PH-015', firstName: 'Rose', lastName: 'Wangari', role: 'Receptionist', department: 'Reception & Front Office', clinical: false, email: 'rose.wangari@3rdparkhospital.com', phone: '+254 711 201 015', idNumber: '90000015', kraPin: 'A001PHM015K', nssfNumber: '10000000015', nhifNumber: '20000000015', dateOfJoining: d(2024, 2, 12), baseSalary: 45000, allowances: [{ name: 'Housing', amount: 8000 }, { name: 'Transport', amount: 5000 }], bankName: 'DTB', bankBranch: 'Westlands', bankAccountNumber: '1100010015' },
  { employeeNumber: '3PH-016', firstName: 'John', lastName: 'Kiptoo', role: 'Security Officer', department: 'Administration', clinical: false, email: 'john.kiptoo@3rdparkhospital.com', phone: '+254 711 201 016', idNumber: '90000016', kraPin: 'A001PHM016K', nssfNumber: '10000000016', nhifNumber: '20000000016', dateOfJoining: d(2025, 1, 2), baseSalary: 35000, allowances: [{ name: 'Housing', amount: 6000 }, { name: 'Transport', amount: 4000 }], bankName: 'KCB Bank', bankBranch: 'Parklands', bankAccountNumber: '1100010016' },
  { employeeNumber: '3PH-017', firstName: 'Esther', lastName: 'Nyambura', role: 'Cleaner', department: 'Administration', clinical: false, email: 'esther.nyambura@3rdparkhospital.com', phone: '+254 711 201 017', idNumber: '90000017', kraPin: 'A001PHM017K', nssfNumber: '10000000017', nhifNumber: '20000000017', dateOfJoining: d(2025, 2, 3), baseSalary: 28000, allowances: [{ name: 'Housing', amount: 5000 }, { name: 'Transport', amount: 3500 }], bankName: 'Postbank', bankBranch: 'Ngara', bankAccountNumber: '1100010017' },
  { employeeNumber: '3PH-018', firstName: 'Michael', lastName: 'Waithaka', role: 'Maintenance Tech', department: 'Administration', clinical: false, email: 'michael.waithaka@3rdparkhospital.com', phone: '+254 711 201 018', idNumber: '90000018', kraPin: 'A001PHM018K', nssfNumber: '10000000018', nhifNumber: '20000000018', dateOfJoining: d(2023, 10, 2), baseSalary: 55000, allowances: [{ name: 'Housing', amount: 10000 }, { name: 'Transport', amount: 6000 }], bankName: 'Equity Bank', bankBranch: 'Westlands', bankAccountNumber: '1100010018' },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.');
  }

  const now = new Date();
  const todayYmd = isoDate(now);
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;
  const compatibility: CompatibilityItem[] = [];
  const hasModel = (name: string) => Boolean(prismaAny[name]);

  const marchYear = currentMonth >= 4 ? currentYear : currentYear - 1;
  const aprilYear = marchYear;

  const existingHospital = await prisma.outsourcingClient.findFirst({
    where: { name: HOSPITAL.name },
    select: { id: true },
  });
  const hospital = existingHospital
    ? await prisma.outsourcingClient.update({
        where: { id: existingHospital.id },
        data: {
          contactName: HOSPITAL.contactName,
          contactEmail: HOSPITAL.contactEmail,
          contactPhone: HOSPITAL.contactPhone,
          postalAddress: HOSPITAL.postalAddress,
          county: HOSPITAL.county,
          employeeNumberPrefix: HOSPITAL.employeeNumberPrefix,
          payrollFrequency: HOSPITAL.payrollFrequency,
          leavePayMode: HOSPITAL.leavePayMode,
        },
      })
    : await prisma.outsourcingClient.create({
        data: {
          ...HOSPITAL,
        },
      });

  const deptByName = new Map<string, string>();
  for (const name of departments) {
    const existing = await prisma.department.findFirst({
      where: { outsourcingClientId: hospital.id, name },
      select: { id: true },
    });
    if (existing) {
      deptByName.set(name, existing.id);
    } else {
      const created = await prisma.department.create({
        data: { outsourcingClientId: hospital.id, name },
        select: { id: true },
      });
      deptByName.set(name, created.id);
    }
  }

  const employeeByEmail = new Map<string, Awaited<ReturnType<typeof prisma.employee.upsert>>>();
  for (const emp of employeesSeed) {
    const employee = await prisma.employee.upsert({
      where: { idNumber: emp.idNumber },
      update: {
        outsourcingClientId: hospital.id,
        departmentId: deptByName.get(emp.department) ?? null,
        employeeNumber: emp.employeeNumber,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: emp.phone,
        kraPin: emp.kraPin,
        nssfNumber: emp.nssfNumber,
        nhifNumber: emp.nhifNumber,
        dateOfJoining: emp.dateOfJoining,
        jobTitle: emp.role,
        baseSalary: new Prisma.Decimal(emp.baseSalary),
        bankName: emp.bankName,
        bankBranch: emp.bankBranch,
        bankAccountNumber: emp.bankAccountNumber,
      },
      create: {
        outsourcingClientId: hospital.id,
        departmentId: deptByName.get(emp.department) ?? null,
        employeeNumber: emp.employeeNumber,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: emp.phone,
        idNumber: emp.idNumber,
        kraPin: emp.kraPin,
        nssfNumber: emp.nssfNumber,
        nhifNumber: emp.nhifNumber,
        dateOfJoining: emp.dateOfJoining,
        jobTitle: emp.role,
        baseSalary: new Prisma.Decimal(emp.baseSalary),
        bankName: emp.bankName,
        bankBranch: emp.bankBranch,
        bankAccountNumber: emp.bankAccountNumber,
      },
    });
    employeeByEmail.set(emp.email, employee);
  }

  const credentialsSeed = [
    { email: 'james.mwangi@3rdparkhospital.com', category: 'medical_license' as CredentialCategory, name: 'KMPDC License', number: 'KMPDC-001-3PH', authority: 'Kenya Medical Practitioners & Dentists Council', issue: d(2023, 3, 15), expiry: d(2026, 3, 15), status: 'active' as CredentialStatus },
    { email: 'sarah.wanjiku@3rdparkhospital.com', category: 'medical_license' as CredentialCategory, name: 'KMPDC License', number: 'KMPDC-002-3PH', authority: 'KMPDC', issue: d(2024, 1, 10), expiry: d(2027, 1, 10), status: 'active' as CredentialStatus },
    { email: 'peter.ochieng@3rdparkhospital.com', category: 'medical_license' as CredentialCategory, name: 'KMPDC License', number: 'KMPDC-003-3PH', authority: 'KMPDC', issue: d(2023, 6, 20), expiry: d(2026, 6, 20), status: 'active' as CredentialStatus },
    { email: 'grace.njeri@3rdparkhospital.com', category: 'regulatory_compliance' as CredentialCategory, name: 'Nursing License', number: 'NCK-004-3PH', authority: 'Nursing Council of Kenya', issue: d(2023, 9, 1), expiry: d(2026, 9, 1), status: 'active' as CredentialStatus },
    { email: 'grace.njeri@3rdparkhospital.com', category: 'life_support' as CredentialCategory, name: 'BLS Certification', number: 'BLS-005-3PH', authority: 'Kenya Red Cross', issue: d(2024, 6, 15), expiry: d(2026, 6, 15), status: 'active' as CredentialStatus },
    { email: 'david.kamau@3rdparkhospital.com', category: 'regulatory_compliance' as CredentialCategory, name: 'Nursing License', number: 'NCK-006-3PH', authority: 'Nursing Council of Kenya', issue: d(2023, 5, 10), expiry: daysFromToday(14), status: 'expiring_soon' as CredentialStatus },
    { email: 'agnes.mutua@3rdparkhospital.com', category: 'regulatory_compliance' as CredentialCategory, name: 'Nursing License', number: 'NCK-007-3PH', authority: 'Nursing Council of Kenya', issue: d(2022, 3, 20), expiry: daysFromToday(-37), status: 'expired' as CredentialStatus },
    { email: 'faith.wambui@3rdparkhospital.com', category: 'regulatory_compliance' as CredentialCategory, name: 'KMLTTB Registration', number: 'KMLTTB-008-3PH', authority: 'Kenya Medical Lab Technicians & Technologists Board', issue: d(2024, 2, 1), expiry: d(2027, 2, 1), status: 'active' as CredentialStatus },
    { email: 'joseph.otieno@3rdparkhospital.com', category: 'medical_license' as CredentialCategory, name: 'Pharmacy License', number: 'PPB-009-3PH', authority: 'Pharmacy & Poisons Board', issue: d(2023, 11, 15), expiry: d(2026, 11, 15), status: 'active' as CredentialStatus },
    { email: 'daniel.njoroge@3rdparkhospital.com', category: 'medical_license' as CredentialCategory, name: 'KMPDC License', number: 'KMPDC-010-3PH', authority: 'KMPDC', issue: d(2024, 4, 1), expiry: d(2027, 4, 1), status: 'active' as CredentialStatus },
  ];

  for (const c of credentialsSeed) {
    const employee = employeeByEmail.get(c.email);
    if (!employee) continue;
    const existing = await prisma.employeeCredential.findFirst({
      where: {
        employeeId: employee.id,
        credentialName: c.name,
        credentialNumber: c.number,
      },
      select: { id: true },
    });
    if (existing) {
      await prisma.employeeCredential.update({
        where: { id: existing.id },
        data: {
          category: c.category,
          issuingAuthority: c.authority,
          issueDate: c.issue,
          expiryDate: c.expiry,
          status: c.status,
          reminderDays: 30,
        },
      });
    } else {
      await prisma.employeeCredential.create({
        data: {
          employeeId: employee.id,
          category: c.category,
          credentialName: c.name,
          credentialNumber: c.number,
          issuingAuthority: c.authority,
          issueDate: c.issue,
          expiryDate: c.expiry,
          status: c.status,
          reminderDays: 30,
        },
      });
    }
  }

  const shiftTemplateDefs = [
    { name: 'Day shift', startMinutes: 8 * 60, endMinutes: 20 * 60, breakMinutes: 60, color: '#2563eb' },
    { name: 'Night shift', startMinutes: 20 * 60, endMinutes: 8 * 60, breakMinutes: 60, color: '#1e293b' },
    { name: 'Theatre day', startMinutes: 7 * 60, endMinutes: 19 * 60, breakMinutes: 60, color: '#7c3aed' },
    { name: 'Theatre long', startMinutes: 7 * 60, endMinutes: 23 * 60, breakMinutes: 60, color: '#a16207' },
    { name: 'Admin day', startMinutes: 8 * 60, endMinutes: 17 * 60, breakMinutes: 60, color: '#059669' },
    { name: 'On-call 24hr', startMinutes: 8 * 60, endMinutes: 8 * 60, breakMinutes: 120, color: '#dc2626' },
  ];

  const templateByName = new Map<string, string>();
  for (const t of shiftTemplateDefs) {
    const existing = await prisma.shiftTemplate.findFirst({
      where: { outsourcingClientId: hospital.id, name: t.name },
      select: { id: true },
    });
    if (existing) {
      await prisma.shiftTemplate.update({
        where: { id: existing.id },
        data: {
          startMinutes: t.startMinutes,
          endMinutes: t.endMinutes,
          breakMinutes: t.breakMinutes,
          color: t.color,
          isActive: true,
        },
      });
      templateByName.set(t.name, existing.id);
    } else {
      const created = await prisma.shiftTemplate.create({
        data: { outsourcingClientId: hospital.id, ...t, isActive: true },
      });
      templateByName.set(t.name, created.id);
    }
  }

  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  let rota = await prisma.rotaPeriod.findFirst({
    where: {
      outsourcingClientId: hospital.id,
      startDate: monthStart,
      endDate: monthEnd,
    },
  });
  if (!rota) {
    rota = await prisma.rotaPeriod.create({
      data: {
        outsourcingClientId: hospital.id,
        name: `${now.toLocaleString('en-GB', { month: 'long' })} ${now.getUTCFullYear()} Rota`,
        startDate: monthStart,
        endDate: monthEnd,
        status: 'published',
      },
    });
  } else if (rota.status !== 'published') {
    rota = await prisma.rotaPeriod.update({ where: { id: rota.id }, data: { status: 'published' } });
  }

  const roleEmails = {
    brian: 'brian.kipchoge@3rdparkhospital.com',
    grace: 'grace.njeri@3rdparkhospital.com',
    mary: 'mary.akinyi@3rdparkhospital.com',
    david: 'david.kamau@3rdparkhospital.com',
    james: 'james.mwangi@3rdparkhospital.com',
    peter: 'peter.ochieng@3rdparkhospital.com',
    agnes: 'agnes.mutua@3rdparkhospital.com',
    alice: 'alice.muthoni@3rdparkhospital.com',
    samuel: 'samuel.odera@3rdparkhospital.com',
    rose: 'rose.wangari@3rdparkhospital.com',
    esther: 'esther.nyambura@3rdparkhospital.com',
    michael: 'michael.waithaka@3rdparkhospital.com',
    nancy: 'nancy.chebet@3rdparkhospital.com',
    joseph: 'joseph.otieno@3rdparkhospital.com',
    faith: 'faith.wambui@3rdparkhospital.com',
  } as const;

  const rotationStart = daysFromToday(-14);
  const monday = new Date(rotationStart);
  const mondayDow = monday.getUTCDay();
  const shift = mondayDow === 0 ? -6 : 1 - mondayDow;
  monday.setUTCDate(monday.getUTCDate() + shift);

  const assignmentsSeed: Array<{ email: string; date: Date; template: string }> = [];
  for (let i = 0; i < 14; i += 1) {
    const day = new Date(monday);
    day.setUTCDate(monday.getUTCDate() + i);
    const dow = day.getUTCDay();
    const isWeekday = dow >= 1 && dow <= 5;
    const ymd = isoDate(day);
    if (day >= monthStart && day <= monthEnd) {
      assignmentsSeed.push({ email: roleEmails.brian, date: day, template: i % 5 === 0 ? 'Day shift' : 'Night shift' });
      assignmentsSeed.push({ email: roleEmails.grace, date: day, template: i % 2 === 0 ? 'Day shift' : 'Night shift' });
      assignmentsSeed.push({ email: roleEmails.david, date: day, template: i % 2 === 0 ? 'Night shift' : 'Day shift' });
      assignmentsSeed.push({ email: roleEmails.mary, date: day, template: i % 2 === 0 ? 'Day shift' : 'Night shift' });
      assignmentsSeed.push({ email: roleEmails.agnes, date: day, template: i % 3 === 0 ? 'Theatre long' : 'Theatre day' });
      assignmentsSeed.push({ email: roleEmails.peter, date: day, template: i % 4 === 0 ? 'Theatre long' : 'Theatre day' });
      assignmentsSeed.push({ email: roleEmails.james, date: day, template: i % 4 === 0 ? 'Theatre long' : 'Theatre day' });
      assignmentsSeed.push({ email: roleEmails.joseph, date: day, template: 'Day shift' });
      assignmentsSeed.push({ email: roleEmails.faith, date: day, template: 'Day shift' });
      assignmentsSeed.push({ email: roleEmails.nancy, date: day, template: isWeekday ? 'Admin day' : 'Day shift' });
      assignmentsSeed.push({ email: roleEmails.alice, date: day, template: isWeekday ? 'Admin day' : 'Day shift' });
      assignmentsSeed.push({ email: roleEmails.samuel, date: day, template: isWeekday ? 'Admin day' : 'Day shift' });
      assignmentsSeed.push({ email: roleEmails.rose, date: day, template: isWeekday ? 'Admin day' : 'Day shift' });
      assignmentsSeed.push({ email: roleEmails.esther, date: day, template: isWeekday ? 'Admin day' : 'Day shift' });
      assignmentsSeed.push({ email: roleEmails.michael, date: day, template: isWeekday ? 'Admin day' : 'Day shift' });
    }
    if (ymd === `${marchYear}-03-24`) {
      // no-op marker for static demo date references
    }
  }

  for (const item of assignmentsSeed) {
    const employee = employeeByEmail.get(item.email);
    if (!employee) continue;
    const templateId = templateByName.get(item.template);
    if (!templateId) continue;
    const template = shiftTemplateDefs.find((s) => s.name === item.template)!;
    const workYmd = isoDate(item.date);
    const startsAt = atUtc(workYmd, `${String(Math.floor(template.startMinutes / 60)).padStart(2, '0')}:${String(template.startMinutes % 60).padStart(2, '0')}`);
    const crossesMidnight = template.endMinutes <= template.startMinutes;
    const endDate = new Date(item.date);
    if (crossesMidnight) endDate.setUTCDate(endDate.getUTCDate() + 1);
    const endYmd = isoDate(endDate);
    const endsAt = atUtc(endYmd, `${String(Math.floor(template.endMinutes / 60)).padStart(2, '0')}:${String(template.endMinutes % 60).padStart(2, '0')}`);

    const existing = await prisma.shiftAssignment.findFirst({
      where: { rotaPeriodId: rota.id, employeeId: employee.id, workDate: new Date(`${workYmd}T00:00:00.000Z`) },
      select: { id: true },
    });
    if (existing) {
      await prisma.shiftAssignment.update({
        where: { id: existing.id },
        data: { shiftTemplateId: templateId, startsAt, endsAt, breakMinutes: template.breakMinutes },
      });
    } else {
      await prisma.shiftAssignment.create({
        data: {
          rotaPeriodId: rota.id,
          employeeId: employee.id,
          shiftTemplateId: templateId,
          workDate: new Date(`${workYmd}T00:00:00.000Z`),
          startsAt,
          endsAt,
          breakMinutes: template.breakMinutes,
        },
      });
    }
  }

  const attendanceRows = [
    { email: roleEmails.brian, date: isoDate(daysFromToday(-2)), checkIn: '19:55', checkOut: '08:10', overtimeMinutes: 15, lateMinutes: 0, notes: 'Cross-midnight demo shift' },
    { email: roleEmails.james, date: isoDate(daysFromToday(-3)), checkIn: '06:50', checkOut: '23:15', overtimeMinutes: 84, lateMinutes: 0, notes: '16-hour theatre shift demo' },
    { email: roleEmails.grace, date: todayYmd, checkIn: '08:02', checkOut: null, overtimeMinutes: 0, lateMinutes: 2, notes: 'Missing clock-out for supervisor review' },
    { email: roleEmails.mary, date: isoDate(daysFromToday(-1)), checkIn: '08:47', checkOut: '20:05', overtimeMinutes: 5, lateMinutes: 47, notes: 'Late arrival demo case' },
    { email: roleEmails.david, date: isoDate(daysFromToday(-4)), checkIn: '07:58', checkOut: '21:30', overtimeMinutes: 90, lateMinutes: 0, notes: 'Corrected clock-out: worked late covering HDU' },
    { email: roleEmails.faith, date: isoDate(daysFromToday(-5)), checkIn: '07:55', checkOut: '20:04', overtimeMinutes: 4, lateMinutes: 0, notes: null },
    { email: roleEmails.joseph, date: isoDate(daysFromToday(-6)), checkIn: '08:03', checkOut: '20:07', overtimeMinutes: 7, lateMinutes: 3, notes: null },
    { email: roleEmails.nancy, date: isoDate(daysFromToday(-7)), checkIn: '08:01', checkOut: '17:12', overtimeMinutes: 12, lateMinutes: 1, notes: null },
    { email: roleEmails.peter, date: isoDate(daysFromToday(-8)), checkIn: '07:02', checkOut: '19:10', overtimeMinutes: 10, lateMinutes: 2, notes: null },
    { email: roleEmails.agnes, date: isoDate(daysFromToday(-9)), checkIn: '06:58', checkOut: '23:02', overtimeMinutes: 62, lateMinutes: 0, notes: null },
    { email: roleEmails.brian, date: isoDate(daysFromToday(-10)), checkIn: '20:04', checkOut: '08:08', overtimeMinutes: 8, lateMinutes: 4, notes: null },
    { email: roleEmails.david, date: isoDate(daysFromToday(-11)), checkIn: '20:07', checkOut: '08:00', overtimeMinutes: 0, lateMinutes: 7, notes: null },
    { email: roleEmails.grace, date: isoDate(daysFromToday(-12)), checkIn: '08:11', checkOut: '20:00', overtimeMinutes: 0, lateMinutes: 11, notes: null },
    { email: roleEmails.mary, date: isoDate(daysFromToday(-13)), checkIn: '08:06', checkOut: '19:52', overtimeMinutes: 0, lateMinutes: 6, notes: null },
  ];

  for (const row of attendanceRows) {
    const employee = employeeByEmail.get(row.email);
    if (!employee) continue;
    const workDate = new Date(`${row.date}T00:00:00.000Z`);
    const checkIn = atUtc(row.date, row.checkIn);
    const checkOut = row.checkOut
      ? (() => {
          const out = atUtc(row.date, row.checkOut);
          if (row.checkOut < row.checkIn) out.setUTCDate(out.getUTCDate() + 1);
          return out;
        })()
      : null;

    await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: employee.id, date: workDate } },
      update: { checkIn, checkOut, notes: row.notes },
      create: { employeeId: employee.id, date: workDate, checkIn, checkOut, notes: row.notes },
    });

    const workedMinutes = checkOut ? Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / 60000)) : 0;
    if (hasModel('attendanceDaySummary')) {
      await prismaAny.attendanceDaySummary.upsert({
        where: { employeeId_workDate: { employeeId: employee.id, workDate } },
        update: {
          outsourcingClientId: hospital.id,
          firstInAt: checkIn,
          lastOutAt: checkOut,
          minutesWorked: workedMinutes,
          lateMinutes: row.lateMinutes,
          overtimeMinutes: row.overtimeMinutes,
          status: checkOut ? AttendanceSummaryStatus.reconciled : AttendanceSummaryStatus.draft,
        },
        create: {
          employeeId: employee.id,
          outsourcingClientId: hospital.id,
          workDate,
          firstInAt: checkIn,
          lastOutAt: checkOut,
          minutesWorked: workedMinutes,
          lateMinutes: row.lateMinutes,
          overtimeMinutes: row.overtimeMinutes,
          status: checkOut ? AttendanceSummaryStatus.reconciled : AttendanceSummaryStatus.draft,
        },
      });
    }
  }

  const grace = employeeByEmail.get(roleEmails.grace);
  const mary = employeeByEmail.get(roleEmails.mary);
  if (grace && hasModel('attendanceException')) {
    await upsertAttendanceException({
      employeeId: grace.id,
      workDate: new Date(`${todayYmd}T00:00:00.000Z`),
      type: AttendanceExceptionType.missing_check_out,
      status: AttendanceExceptionStatus.open,
      description: 'No check-out event found for this shift/day window.',
    });
  }
  if (mary && hasModel('attendanceException')) {
    await upsertAttendanceException({
      employeeId: mary.id,
      workDate: new Date(`${isoDate(daysFromToday(-1))}T00:00:00.000Z`),
      type: AttendanceExceptionType.late_arrival,
      status: AttendanceExceptionStatus.open,
      description: 'Clock-in occurred 47 minutes after scheduled shift start.',
    });
  }

  if (hasModel('attendancePolicy') && hasModel('attendancePolicyAssignment')) {
    const policy = await prismaAny.attendancePolicy.upsert({
    where: { id: `default-attendance-${hospital.id}` },
    update: {
      outsourcingClientId: hospital.id,
      name: 'Hospital attendance policy',
      mode: AttendancePolicyMode.hybrid_override,
      graceInMinutes: 10,
      graceOutMinutes: 10,
      minHalfDayMinutes: 240,
      fullDayMinutes: 480,
      requireManualApproval: true,
      isDefault: true,
      isActive: true,
    },
    create: {
      id: `default-attendance-${hospital.id}`,
      outsourcingClientId: hospital.id,
      name: 'Hospital attendance policy',
      mode: AttendancePolicyMode.hybrid_override,
      graceInMinutes: 10,
      graceOutMinutes: 10,
      minHalfDayMinutes: 240,
      fullDayMinutes: 480,
      requireManualApproval: true,
      isDefault: true,
      isActive: true,
    },
  });

    for (const employee of employeeByEmail.values()) {
      await prismaAny.attendancePolicyAssignment.upsert({
        where: { id: `${employee.id}-${policy.id}` },
        update: { effectiveFrom: d(2026, 1, 1), effectiveTo: null, isPrimary: true },
        create: { id: `${employee.id}-${policy.id}`, employeeId: employee.id, attendancePolicyId: policy.id, effectiveFrom: d(2026, 1, 1), effectiveTo: null, isPrimary: true },
      });
    }
  }

  const leaveTypeDefs = [
    { name: 'Annual Leave', daysPerYear: 21 },
    { name: 'Sick Leave', daysPerYear: 14 },
    { name: 'Compassionate Leave', daysPerYear: 5 },
    { name: 'Maternity Leave', daysPerYear: 90 },
    { name: 'Paternity Leave', daysPerYear: 14 },
    { name: 'Study Leave', daysPerYear: 0 },
    { name: 'Unpaid Leave', daysPerYear: 0 },
  ];
  const leaveTypeByName = new Map<string, string>();
  for (const lt of leaveTypeDefs) {
    const existing = await prisma.leaveType.findFirst({ where: { name: lt.name } });
    if (existing) {
      await prisma.leaveType.update({ where: { id: existing.id }, data: { daysPerYear: lt.daysPerYear } });
      leaveTypeByName.set(lt.name, existing.id);
    } else {
      const created = await prisma.leaveType.create({ data: lt });
      leaveTypeByName.set(lt.name, created.id);
    }
  }

  let leavePolicyId: string | null = null;
  if (prismaAny.leavePolicy) {
    const leavePolicy = await prismaAny.leavePolicy.upsert({
      where: { id: `default-leave-${hospital.id}` },
      update: {
        outsourcingClientId: hospital.id,
        name: '3rd Park Leave Policy',
        description: 'Default leave policy for hospital demo data.',
        isDefault: true,
        isActive: true,
      },
      create: {
        id: `default-leave-${hospital.id}`,
        outsourcingClientId: hospital.id,
        name: '3rd Park Leave Policy',
        description: 'Default leave policy for hospital demo data.',
        isDefault: true,
        isActive: true,
      },
    });
    leavePolicyId = leavePolicy.id;
  }

  if (leavePolicyId && prismaAny.leavePolicyRule) {
    for (const lt of leaveTypeDefs) {
      const leaveTypeId = leaveTypeByName.get(lt.name)!;
      await prismaAny.leavePolicyRule.upsert({
        where: { leavePolicyId_leaveTypeId: { leavePolicyId, leaveTypeId } },
        update: {
          accrualMode: lt.daysPerYear > 0 ? LeaveAccrualMode.monthly_accrual : LeaveAccrualMode.annual_grant,
          annualEntitlement: lt.daysPerYear,
          monthlyAccrualDays: new Prisma.Decimal(lt.daysPerYear > 0 ? (lt.daysPerYear / 12).toFixed(2) : '0'),
          maxCarryForwardDays: lt.name === 'Annual Leave' ? 10 : 0,
          requiresApproval: !lt.name.includes('Unpaid'),
          active: true,
        },
        create: {
          leavePolicyId,
          leaveTypeId,
          accrualMode: lt.daysPerYear > 0 ? LeaveAccrualMode.monthly_accrual : LeaveAccrualMode.annual_grant,
          annualEntitlement: lt.daysPerYear,
          monthlyAccrualDays: new Prisma.Decimal(lt.daysPerYear > 0 ? (lt.daysPerYear / 12).toFixed(2) : '0'),
          maxCarryForwardDays: lt.name === 'Annual Leave' ? 10 : 0,
          requiresApproval: !lt.name.includes('Unpaid'),
          active: true,
        },
      });
    }
  }

  const annualTypeId = leaveTypeByName.get('Annual Leave')!;
  const sickTypeId = leaveTypeByName.get('Sick Leave')!;
  for (const [email, employee] of employeeByEmail.entries()) {
    const seed = employeesSeed.find((s) => s.email === email)!;
    const join = seed.dateOfJoining;
    const monthsWorked = Math.max(1, (currentYear - join.getUTCFullYear()) * 12 + (now.getUTCMonth() - join.getUTCMonth()) + 1);
    const accruedAnnual = Math.min(21, Math.floor((monthsWorked * 21) / 12));
    const accruedSick = Math.min(14, Math.floor((monthsWorked * 14) / 12));

    await prisma.leaveBalance.upsert({
      where: { employeeId_leaveTypeId_year: { employeeId: employee.id, leaveTypeId: annualTypeId, year: currentYear } },
      update: { balance: accruedAnnual, used: 0 },
      create: { employeeId: employee.id, leaveTypeId: annualTypeId, year: currentYear, balance: accruedAnnual, used: 0 },
    });
    await prisma.leaveBalance.upsert({
      where: { employeeId_leaveTypeId_year: { employeeId: employee.id, leaveTypeId: sickTypeId, year: currentYear } },
      update: { balance: accruedSick, used: 0 },
      create: { employeeId: employee.id, leaveTypeId: sickTypeId, year: currentYear, balance: accruedSick, used: 0 },
    });
    if (leavePolicyId && prismaAny.leavePolicyAssignment) {
      await prismaAny.leavePolicyAssignment.upsert({
        where: { id: `${employee.id}-${leavePolicyId}` },
        update: { effectiveFrom: d(2026, 1, 1), effectiveTo: null },
        create: { id: `${employee.id}-${leavePolicyId}`, employeeId: employee.id, leavePolicyId, effectiveFrom: d(2026, 1, 1), effectiveTo: null },
      });
    }
  }

  const rose = employeeByEmail.get(roleEmails.rose)!;
  const joseph = employeeByEmail.get(roleEmails.joseph)!;
  const maryEmp = employeeByEmail.get(roleEmails.mary)!;
  const annualLeaveType = annualTypeId;
  const sickLeaveType = sickTypeId;

  await upsertLeaveApplication(rose.id, annualLeaveType, daysFromToday(0), daysFromToday(4), LeaveStatus.approved, 'Annual leave approved');
  await upsertLeaveApplication(joseph.id, sickLeaveType, daysFromToday(-1), daysFromToday(2), LeaveStatus.approved, 'Medical recovery leave');
  await upsertLeaveApplication(maryEmp.id, annualLeaveType, daysFromToday(7), daysFromToday(11), LeaveStatus.pending, 'Pending annual leave request');

  for (const monthData of [
    { month: 3, year: marchYear, status: PayrollStatus.approved },
    { month: 4, year: aprilYear, status: PayrollStatus.draft },
  ]) {
    for (const seed of employeesSeed) {
      const employee = employeeByEmail.get(seed.email);
      if (!employee) continue;
      const overtimeMinutes = hasModel('attendanceDaySummary')
        ? ((await prismaAny.attendanceDaySummary.aggregate({
            where: {
              employeeId: employee.id,
              workDate: {
                gte: new Date(Date.UTC(monthData.year, monthData.month - 1, 1)),
                lt: new Date(Date.UTC(monthData.year, monthData.month, 1)),
              },
            },
            _sum: { overtimeMinutes: true },
          }))?._sum?.overtimeMinutes ?? 0)
        : 0;
      const overtimeAmount = Math.round((seed.baseSalary / 22560) * overtimeMinutes);
      const allowances = [...seed.allowances, { name: 'Overtime', amount: overtimeAmount }];
      const deductions: { name: string; amount: number }[] = [];
      const employmentGross = seed.baseSalary + allowances.reduce((sum, a) => sum + a.amount, 0);
      const statutory = calculateStatutoryForPayroll('none', employmentGross, 0, 0);

      await prisma.payroll.upsert({
        where: { employeeId_month_year: { employeeId: employee.id, month: monthData.month, year: monthData.year } },
        update: {
          basicPay: new Prisma.Decimal(seed.baseSalary),
          allowances: allowances as unknown as Prisma.JsonArray,
          deductions: deductions as unknown as Prisma.JsonArray,
          grossPay: new Prisma.Decimal(statutory.grossPay),
          paye: new Prisma.Decimal(statutory.paye),
          nssf: new Prisma.Decimal(statutory.nssf),
          nhif: new Prisma.Decimal(statutory.nhif),
          ahl: new Prisma.Decimal(statutory.ahl),
          nita: new Prisma.Decimal(statutory.nita),
          netPay: new Prisma.Decimal(statutory.netPay),
          status: monthData.status,
        },
        create: {
          employeeId: employee.id,
          month: monthData.month,
          year: monthData.year,
          basicPay: new Prisma.Decimal(seed.baseSalary),
          allowances: allowances as unknown as Prisma.JsonArray,
          deductions: deductions as unknown as Prisma.JsonArray,
          grossPay: new Prisma.Decimal(statutory.grossPay),
          leavePay: new Prisma.Decimal(0),
          paye: new Prisma.Decimal(statutory.paye),
          nssf: new Prisma.Decimal(statutory.nssf),
          nhif: new Prisma.Decimal(statutory.nhif),
          ahl: new Prisma.Decimal(statutory.ahl),
          nita: new Prisma.Decimal(statutory.nita),
          netPay: new Prisma.Decimal(statutory.netPay),
          status: monthData.status,
        },
      });
    }
  }

  const hashed = await bcrypt.hash('Demo@2026!', PASSWORD_ROUNDS);
  const demoAdmin = 'demo@3rdparkhospital.com';
  await prisma.user.upsert({
    where: { email: demoAdmin },
    update: { name: '3rd Park Super Admin', passwordHash: hashed, role: UserRole.admin, staffUserType: StaffUserType.director, isActive: true },
    create: { email: demoAdmin, name: '3rd Park Super Admin', passwordHash: hashed, role: UserRole.admin, staffUserType: StaffUserType.director, isActive: true },
  });
  await prisma.user.upsert({
    where: { email: roleEmails.alice },
    update: { name: 'Alice Muthoni', passwordHash: hashed, role: UserRole.staff, staffUserType: StaffUserType.business_manager, isActive: true },
    create: { email: roleEmails.alice, name: 'Alice Muthoni', passwordHash: hashed, role: UserRole.staff, staffUserType: StaffUserType.business_manager, isActive: true },
  });
  await prisma.user.upsert({
    where: { email: roleEmails.samuel },
    update: { name: 'Samuel Odera', passwordHash: hashed, role: UserRole.staff, staffUserType: StaffUserType.finance, isActive: true },
    create: { email: roleEmails.samuel, name: 'Samuel Odera', passwordHash: hashed, role: UserRole.staff, staffUserType: StaffUserType.finance, isActive: true },
  });
  const seededUsers = await prisma.user.findMany({
    where: { email: { in: [demoAdmin, roleEmails.alice, roleEmails.samuel] } },
    select: { id: true, email: true, name: true },
  });
  const userByEmail = new Map(seededUsers.map((u) => [u.email.toLowerCase(), u]));
  const james = employeeByEmail.get(roleEmails.james);
  const david = employeeByEmail.get(roleEmails.david);
  const esther = employeeByEmail.get(roleEmails.esther);
  const roseEmp = employeeByEmail.get(roleEmails.rose);
  await prisma.auditEvent.createMany({
    data: [
      {
        actorUserId: userByEmail.get(roleEmails.alice)?.id ?? null,
        actorEmail: roleEmails.alice,
        action: 'employee.salary.view',
        entityType: 'Employee',
        entityId: james?.id ?? null,
        route: 'GET /api/outsourcing/employees/[id]',
        metadata: { message: 'Alice Muthoni viewed employee salary: Dr. James Mwangi' },
        createdAt: new Date(Date.UTC(currentYear, 3, 26, 7, 30, 0)),
      },
      {
        actorUserId: userByEmail.get(roleEmails.samuel)?.id ?? null,
        actorEmail: roleEmails.samuel,
        action: 'payroll.run.approve',
        entityType: 'PayrollBatch',
        entityId: `${marchYear}-03`,
        route: 'POST /api/outsourcing/payroll/generate',
        metadata: { message: `Samuel Odera approved payroll run March ${marchYear}` },
        createdAt: new Date(Date.UTC(currentYear, 3, 1, 11, 15, 0)),
      },
      {
        actorUserId: userByEmail.get(roleEmails.alice)?.id ?? null,
        actorEmail: roleEmails.alice,
        action: 'attendance.correction',
        entityType: 'Attendance',
        entityId: david?.id ?? null,
        route: 'POST /api/outsourcing/attendance',
        metadata: { message: 'Alice Muthoni corrected attendance: David Kamau clockOut 20:00 -> 21:30' },
        createdAt: new Date(Date.UTC(currentYear, 3, 23, 18, 0, 0)),
      },
      {
        actorUserId: userByEmail.get(demoAdmin)?.id ?? null,
        actorEmail: demoAdmin,
        action: 'employee.create',
        entityType: 'Employee',
        entityId: esther?.id ?? null,
        route: 'POST /api/outsourcing/employees',
        metadata: { message: 'demo@3rdparkhospital.com created employee: Esther Nyambura' },
        createdAt: new Date(Date.UTC(currentYear, 3, 15, 8, 0, 0)),
      },
      {
        actorUserId: userByEmail.get(roleEmails.alice)?.id ?? null,
        actorEmail: roleEmails.alice,
        action: 'leave.approval',
        entityType: 'LeaveApplication',
        entityId: roseEmp?.id ?? null,
        route: 'PATCH /api/staff/leave/applications/[id]',
        metadata: { message: 'Alice Muthoni approved leave: Rose Wangari annual leave' },
        createdAt: new Date(Date.UTC(currentYear, 3, 25, 12, 30, 0)),
      },
    ],
  });

  const clinicalCount = employeesSeed.filter((e) => e.clinical).length;
  const nonClinicalCount = employeesSeed.length - clinicalCount;

  compatibility.push(
    {
      key: 'attendanceDaySummary',
      available: hasModel('attendanceDaySummary'),
      reasonIfSkipped: 'Attendance summary records and overtime-from-summary aggregation skipped.',
    },
    {
      key: 'attendanceException',
      available: hasModel('attendanceException'),
      reasonIfSkipped: 'Missing clock-out / late-arrival exception rows skipped.',
    },
    {
      key: 'attendancePolicy',
      available: hasModel('attendancePolicy'),
      reasonIfSkipped: 'Default attendance policy creation skipped.',
    },
    {
      key: 'attendancePolicyAssignment',
      available: hasModel('attendancePolicyAssignment'),
      reasonIfSkipped: 'Per-employee attendance policy assignment skipped.',
    },
    {
      key: 'leavePolicy',
      available: hasModel('leavePolicy'),
      reasonIfSkipped: 'Leave policy scaffold skipped (balances/applications still seeded).',
    },
    {
      key: 'leavePolicyRule',
      available: hasModel('leavePolicyRule'),
      reasonIfSkipped: 'Leave policy rules skipped.',
    },
    {
      key: 'leavePolicyAssignment',
      available: hasModel('leavePolicyAssignment'),
      reasonIfSkipped: 'Per-employee leave policy assignment skipped.',
    },
  );

  console.log(`Seed complete for ${HOSPITAL.name}`);
  console.log(`Employees: ${employeesSeed.length} (${clinicalCount} clinical / ${nonClinicalCount} non-clinical)`);
  console.log(`Credentials: ${credentialsSeed.length} (1 expiring in 14 days, 1 expired 37 days ago)`);
  console.log(`Rota: published for ${monthStart.toISOString().slice(0, 10)} to ${monthEnd.toISOString().slice(0, 10)}`);
  console.log(`Attendance: ${attendanceRows.length} summary rows seeded for last 14 days`);
  console.log(`Payroll: March ${marchYear} approved, April ${aprilYear} draft`);
  console.log(`Users: demo admin + HR + payroll seeded with password Demo@2026!`);
  console.log('Compatibility report:');
  for (const item of compatibility) {
    if (item.available) {
      console.log(` - ${item.key}: available`);
    } else {
      console.log(` - ${item.key}: skipped (${item.reasonIfSkipped})`);
    }
  }
}

async function upsertAttendanceException(input: {
  employeeId: string;
  workDate: Date;
  type: AttendanceExceptionType;
  status: AttendanceExceptionStatus;
  description: string;
}) {
  const existing = await prisma.attendanceException.findFirst({
    where: {
      employeeId: input.employeeId,
      workDate: input.workDate,
      type: input.type,
    },
  });
  if (existing) {
    await prisma.attendanceException.update({
      where: { id: existing.id },
      data: { status: input.status, description: input.description },
    });
    return;
  }
  await prisma.attendanceException.create({ data: input });
}

async function upsertLeaveApplication(
  employeeId: string,
  leaveTypeId: string,
  startDate: Date,
  endDate: Date,
  status: LeaveStatus,
  reason: string,
) {
  const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  const existing = await prisma.leaveApplication.findFirst({
    where: { employeeId, leaveTypeId, startDate: start, endDate: end },
  });
  if (existing) {
    await prisma.leaveApplication.update({
      where: { id: existing.id },
      data: { days, status, reason },
    });
  } else {
    await prisma.leaveApplication.create({
      data: { employeeId, leaveTypeId, startDate: start, endDate: end, days, status, reason },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
