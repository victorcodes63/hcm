import {
  PrismaClient,
  Prisma,
  CredentialCategory,
  CredentialStatus,
  AttendanceSummaryStatus,
  AttendanceExceptionType,
  AttendanceExceptionStatus,
  PayrollStatus,
  LeaveStatus,
  AttendancePolicyMode,
  LeaveAccrualMode,
  UserRole,
  StaffUserType,
  EssPortalRole,
  ApplicationStatus,
  InterviewStatus,
  ConfirmationStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateStatutoryForPayroll } from '../src/lib/payroll-calc';
import { ensureUniqueSlug, jobSlugBase } from '../src/lib/slug';

const prisma = new PrismaClient();
const prismaAny = prisma as any;
const PASSWORD_ROUNDS = 10;

type CompatibilityItem = {
  key: string;
  available: boolean;
  reasonIfSkipped: string;
};

const DEMO_WORKSPACE = {
  name: 'Stabex International',
  contactName: 'Diana Namutebi',
  contactEmail: 'hr@stabexintl.com',
  contactPhone: '+256 414 000000',
  postalAddress: 'Retail & depot operations — Uganda and Kenya',
  county: 'East Africa (KE / UG)',
  employeeNumberPrefix: 'STB',
  payrollFrequency: 'monthly',
  leavePayMode: 'none',
} as const;

const kenyanHolidays = [
  { name: "New Year's Day", recurDay: 1, recurMonth: 1, recurring: true },
  { name: 'Labour Day', recurDay: 1, recurMonth: 5, recurring: true },
  { name: 'Madaraka Day', recurDay: 1, recurMonth: 6, recurring: true },
  { name: 'Mashujaa Day', recurDay: 20, recurMonth: 10, recurring: true },
  { name: 'Jamhuri Day', recurDay: 12, recurMonth: 12, recurring: true },
  { name: 'Christmas Day', recurDay: 25, recurMonth: 12, recurring: true },
  { name: 'Boxing Day', recurDay: 26, recurMonth: 12, recurring: true },
  { name: 'Good Friday', date: '2026-04-03', recurring: false },
  { name: 'Easter Monday', date: '2026-04-06', recurring: false },
  { name: 'Eid ul-Fitr', date: '2026-03-20', recurring: false },
  { name: 'Eid ul-Adha', date: '2026-05-27', recurring: false },
  { name: 'Utamaduni Day', recurDay: 10, recurMonth: 10, recurring: true },
];

type EmployeeSeed = {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
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
  'Retail Operations',
  'Depot & Logistics',
  'LPG Division',
  'Fleet & Cards',
  'Finance',
  'HSE',
  'Human Resources',
  'IT & Systems',
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
  {
    employeeNumber: 'STB-UG-001',
    firstName: 'Moses',
    lastName: 'Okello',
    role: 'Station Attendant — Nansana Station, Uganda',
    department: 'Retail Operations',
    email: 'moses.okello@stabexintl.com',
    phone: '+256 700 100001',
    idNumber: 'STB-EMP-001',
    kraPin: 'A012STB001K',
    nssfNumber: 'STB-NSSF-001',
    nhifNumber: 'STB-NHIF-001',
    dateOfJoining: d(2022, 3, 15),
    baseSalary: 48000,
    allowances: [{ name: 'Shift', amount: 8000 }, { name: 'Transport', amount: 5000 }],
    bankName: 'Stanbic Bank Uganda',
    bankBranch: 'Kampala',
    bankAccountNumber: '9030001001',
  },
  {
    employeeNumber: 'STB-UG-002',
    firstName: 'Grace',
    lastName: 'Nakato',
    role: 'Station Supervisor — Nansana Station, Uganda',
    department: 'Retail Operations',
    email: 'grace.nakato@stabexintl.com',
    phone: '+256 700 100002',
    idNumber: 'STB-EMP-002',
    kraPin: 'A012STB002K',
    nssfNumber: 'STB-NSSF-002',
    nhifNumber: 'STB-NHIF-002',
    dateOfJoining: d(2021, 7, 1),
    baseSalary: 78000,
    allowances: [{ name: 'Shift', amount: 12000 }, { name: 'Transport', amount: 6000 }],
    bankName: 'Centenary Bank',
    bankBranch: 'Nansana',
    bankAccountNumber: '9030001002',
  },
  {
    employeeNumber: 'STB-UG-003',
    firstName: 'Robert',
    lastName: 'Ssemwogerere',
    role: 'Station Attendant — Kampala Central, Uganda',
    department: 'Retail Operations',
    email: 'robert.ssem@stabexintl.com',
    phone: '+256 700 100003',
    idNumber: 'STB-EMP-003',
    kraPin: 'A012STB003K',
    nssfNumber: 'STB-NSSF-003',
    nhifNumber: 'STB-NHIF-003',
    dateOfJoining: d(2023, 1, 10),
    baseSalary: 47000,
    allowances: [{ name: 'Shift', amount: 8000 }, { name: 'Transport', amount: 5000 }],
    bankName: 'Equity Bank Uganda',
    bankBranch: 'CBD',
    bankAccountNumber: '9030001003',
  },
  {
    employeeNumber: 'STB-UG-004',
    firstName: 'Harriet',
    lastName: 'Amanya',
    role: 'LPG Field Agent Coordinator — Entebbe Road, Uganda',
    department: 'LPG Division',
    email: 'harriet.amanya@stabexintl.com',
    phone: '+256 700 100004',
    idNumber: 'STB-EMP-004',
    kraPin: 'A012STB004K',
    nssfNumber: 'STB-NSSF-004',
    nhifNumber: 'STB-NHIF-004',
    dateOfJoining: d(2022, 11, 1),
    baseSalary: 98000,
    allowances: [{ name: 'Field', amount: 18000 }, { name: 'Transport', amount: 10000 }],
    bankName: 'Absa Bank Uganda',
    bankBranch: 'Entebbe Road',
    bankAccountNumber: '9030001004',
  },
  {
    employeeNumber: 'STB-UG-005',
    firstName: 'Paul',
    lastName: 'Mugisha',
    role: 'Depot Supervisor — Jinja Road, Uganda',
    department: 'Depot & Logistics',
    email: 'paul.mugisha@stabexintl.com',
    phone: '+256 700 100005',
    idNumber: 'STB-EMP-005',
    kraPin: 'A012STB005K',
    nssfNumber: 'STB-NSSF-005',
    nhifNumber: 'STB-NHIF-005',
    dateOfJoining: d(2020, 5, 20),
    baseSalary: 115000,
    allowances: [{ name: 'Responsibility', amount: 22000 }, { name: 'Transport', amount: 12000 }],
    bankName: 'DFCU Bank',
    bankBranch: 'Jinja Road',
    bankAccountNumber: '9030001005',
  },
  {
    employeeNumber: 'STB-KE-001',
    firstName: 'Brian',
    lastName: 'Otieno',
    role: 'Station Attendant — Nairobi West, Kenya',
    department: 'Retail Operations',
    email: 'brian.otieno@stabexintl.com',
    phone: '+254 711 200001',
    idNumber: 'STB-EMP-006',
    kraPin: 'A012STB006K',
    nssfNumber: '20000000001',
    nhifNumber: '30000000001',
    dateOfJoining: d(2023, 4, 1),
    baseSalary: 52000,
    allowances: [{ name: 'Shift', amount: 9000 }, { name: 'Transport', amount: 6000 }],
    bankName: 'KCB Bank',
    bankBranch: 'Nairobi West',
    bankAccountNumber: '1100020001',
  },
  {
    employeeNumber: 'STB-KE-002',
    firstName: 'Aisha',
    lastName: 'Wanjiru',
    role: 'Station Supervisor — Mombasa Road, Kenya',
    department: 'Retail Operations',
    email: 'aisha.wanjiru@stabexintl.com',
    phone: '+254 711 200002',
    idNumber: 'STB-EMP-007',
    kraPin: 'A012STB007K',
    nssfNumber: '20000000002',
    nhifNumber: '30000000002',
    dateOfJoining: d(2022, 8, 15),
    baseSalary: 82000,
    allowances: [{ name: 'Shift', amount: 14000 }, { name: 'Transport', amount: 8000 }],
    bankName: 'Equity Bank',
    bankBranch: 'Mombasa Road',
    bankAccountNumber: '1100020002',
  },
  {
    employeeNumber: 'STB-KE-003',
    firstName: 'Kevin',
    lastName: 'Kamau',
    role: 'Fleet Card Relationship Manager — Westlands, Kenya',
    department: 'Fleet & Cards',
    email: 'kevin.kamau@stabexintl.com',
    phone: '+254 711 200003',
    idNumber: 'STB-EMP-008',
    kraPin: 'A012STB008K',
    nssfNumber: '20000000003',
    nhifNumber: '30000000003',
    dateOfJoining: d(2023, 2, 1),
    baseSalary: 135000,
    allowances: [{ name: 'Performance', amount: 25000 }, { name: 'Transport', amount: 12000 }],
    bankName: 'NCBA Bank',
    bankBranch: 'Westlands',
    bankAccountNumber: '1100020003',
  },
  {
    employeeNumber: 'STB-UG-006',
    firstName: 'Diana',
    lastName: 'Namutebi',
    role: 'HR Manager — Kampala Central, Uganda',
    department: 'Human Resources',
    email: 'diana.namutebi@stabexintl.com',
    phone: '+256 700 100006',
    idNumber: 'STB-EMP-009',
    kraPin: 'A012STB009K',
    nssfNumber: 'STB-NSSF-009',
    nhifNumber: 'STB-NHIF-009',
    dateOfJoining: d(2021, 1, 15),
    baseSalary: 165000,
    allowances: [{ name: 'Housing', amount: 28000 }, { name: 'Transport', amount: 12000 }],
    bankName: 'Stanbic Bank Uganda',
    bankBranch: 'Kololo',
    bankAccountNumber: '9030001006',
  },
  {
    employeeNumber: 'STB-KE-004',
    firstName: 'James',
    lastName: 'Mwangi',
    role: 'Finance Officer — Nairobi West, Kenya',
    department: 'Finance',
    email: 'james.mwangi@stabexintl.com',
    phone: '+254 711 200004',
    idNumber: 'STB-EMP-010',
    kraPin: 'A012STB010K',
    nssfNumber: '20000000004',
    nhifNumber: '30000000004',
    dateOfJoining: d(2022, 3, 1),
    baseSalary: 128000,
    allowances: [{ name: 'Housing', amount: 22000 }, { name: 'Transport', amount: 10000 }],
    bankName: 'Co-operative Bank',
    bankBranch: 'Upper Hill',
    bankAccountNumber: '1100020004',
  },
];

const STABEX_RECRUITMENT_EMPLOYER = 'Stabex International';

type StabexCareerJobSeed = {
  title: string;
  location: string;
  type: string;
  category: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  salary: { min: number; max: number; currency: string };
  salaryPublic: boolean;
  experience: string;
  education: string;
  minYearsExperience: number;
  educationLevel: string;
  educationQualification: string;
  requiredCertifications: string | null;
  /** Application close date = today (UTC) + this many days (within ~2 months for demos). */
  deadlineDaysFromNow: number;
};

const STABEX_CAREERS_JOBS: StabexCareerJobSeed[] = [
  {
    title: 'Regional Retail Manager — East Africa',
    location: 'Nairobi, Kenya (Uganda travel)',
    type: 'Full Time',
    category: 'Retail Leadership',
    description:
      'Own retail performance, compliance, and customer experience across Stabex forecourt and convenience sites in Kenya and Uganda. You will partner with station supervisors, depot logistics, and HQ on KPIs, audits, and growth initiatives.',
    requirements: [
      '8+ years in fuel retail, convenience, or multi-site operations',
      'Proven P&L and people leadership across distributed teams',
      'Experience with ERC (Kenya) / PPDA (Uganda) retail compliance is a strong plus',
      'Willingness to travel between Nairobi and Kampala monthly',
    ],
    responsibilities: [
      'Drive sales, margin, and HSSE targets for the regional retail portfolio',
      'Lead quarterly operational audits and corrective action plans',
      'Coach station supervisors and align rota coverage with peak demand',
      'Represent Stabex with landlords, regulators, and key fleet accounts',
    ],
    benefits: ['Competitive package', 'Company vehicle allowance', 'Medical cover', 'Performance bonus'],
    skills: ['Retail Operations', 'Forecourt Safety', 'P&L Management', 'Stakeholder Management'],
    salary: { min: 280000, max: 420000, currency: 'KES' },
    salaryPublic: true,
    experience: '8+ years multi-site fuel or retail operations',
    education: "Bachelor's in Business, Engineering, or related field",
    minYearsExperience: 8,
    educationLevel: 'Bachelor',
    educationQualification: 'Business, Commerce, Engineering, or Operations Management',
    requiredCertifications: 'OSH / first-response training for fuel sites preferred',
    deadlineDaysFromNow: 58,
  },
  {
    title: 'Station Supervisor — Kampala',
    location: 'Kampala, Uganda',
    type: 'Full Time',
    category: 'Retail Operations',
    description:
      'Lead a high-volume Stabex station team: shift planning, cash and stock controls, customer service, and day-one compliance with fuel handling and fire-safety standards.',
    requirements: [
      '3+ years as a forecourt or station supervisor',
      'Strong cash, stock, and variance discipline',
      'Valid fuel-handling / site safety credentials (or ability to certify within 90 days)',
    ],
    responsibilities: [
      'Supervise attendants, cashiers, and LPG cylinder exchanges',
      'Complete opening/closing checklists and incident reporting',
      'Coordinate minor maintenance and escalate HSSE risks immediately',
    ],
    benefits: ['Shift allowance', 'Medical cover', 'Career path to area manager'],
    skills: ['Team Leadership', 'Cash Control', 'Customer Service', 'HSSE Awareness'],
    salary: { min: 1800000, max: 2600000, currency: 'UGX' },
    salaryPublic: true,
    experience: '3+ years in fuel retail or large-format retail supervision',
    education: 'Diploma or degree in a business or technical discipline',
    minYearsExperience: 3,
    educationLevel: 'Diploma',
    educationQualification: 'Business, Retail Management, or related',
    requiredCertifications: 'MEMD / site safety awareness for LPG and fuels',
    deadlineDaysFromNow: 52,
  },
  {
    title: 'Depot Operations Lead — Jinja Road',
    location: 'Kampala, Uganda',
    type: 'Full Time',
    category: 'Logistics & Supply',
    description:
      'Manage inbound/outbound bulk movements, loading schedules, and documentation for the Jinja Road depot. Ensure dangerous-goods protocols, stock accuracy, and 24/7 readiness for retail replenishment.',
    requirements: [
      '5+ years in fuels, terminals, or hazardous-goods logistics',
      'Experience with weighbridge, loading gantries, and fleet scheduling',
      'Comfortable with night and weekend escalation on-call rotations',
    ],
    responsibilities: [
      'Plan daily loading windows with transport and retail demand',
      'Maintain stock reconciliation and variance investigations',
      'Lead toolbox talks and permit-to-work for maintenance windows',
    ],
    benefits: ['On-call allowance', 'Medical cover', 'Pension where applicable'],
    skills: ['Bulk Fuels Handling', 'Scheduling', 'Dangerous Goods', 'Documentation'],
    salary: { min: 2200000, max: 3200000, currency: 'UGX' },
    salaryPublic: false,
    experience: '5+ years depot or terminal operations',
    education: 'Degree in Engineering, Logistics, or related',
    minYearsExperience: 5,
    educationLevel: 'Bachelor',
    educationQualification: 'Mechanical, Chemical, Logistics, or Supply Chain',
    requiredCertifications: 'Dangerous goods / transport certification preferred',
    deadlineDaysFromNow: 60,
  },
  {
    title: 'LPG Distribution Coordinator',
    location: 'Kampala, Uganda',
    type: 'Full Time',
    category: 'LPG',
    description:
      'Coordinate cylinder exchange routes, third-party hauliers, and depot stock for LPG. Be the operational link between retail sites, field agents, and compliance on cylinder tracking and customer safety.',
    requirements: [
      '3+ years in LPG, bottled gas, or last-mile distribution',
      'Strong Excel / ERP literacy for route and inventory planning',
      'Field-first mindset with valid driving licence',
    ],
    responsibilities: [
      'Optimise daily routes and cylinder balances across stations',
      'Track incidents, near-misses, and regulator reporting timelines',
      'Support sales campaigns for domestic and commercial LPG accounts',
    ],
    benefits: ['Field allowance', 'Medical cover', 'Sales incentives'],
    skills: ['Route Planning', 'Inventory Control', 'LPG Safety', 'Vendor Coordination'],
    salary: { min: 1900000, max: 2700000, currency: 'UGX' },
    salaryPublic: true,
    experience: '3+ years LPG or packaged distribution',
    education: 'Diploma or degree in Logistics, Business, or Engineering',
    minYearsExperience: 3,
    educationLevel: 'Diploma',
    educationQualification: 'Logistics, Operations, or Engineering technology',
    requiredCertifications: null,
    deadlineDaysFromNow: 48,
  },
  {
    title: 'Fleet Card Relationship Executive',
    location: 'Nairobi, Kenya',
    type: 'Full Time',
    category: 'Sales & Fleet',
    description:
      'Grow Stabex fleet card adoption with SMEs, logistics firms, and public-sector fleets. Own onboarding, spend analytics, and renewals while coordinating with retail sites for acceptance and dispute resolution.',
    requirements: [
      '4+ years B2B sales in payments, fuel cards, or logistics services',
      'Track record closing multi-stakeholder deals',
      'CRM discipline and comfortable presenting data to finance buyers',
    ],
    responsibilities: [
      'Prospect, pitch, and onboard fleet accounts',
      'Run quarterly business reviews with key fleet customers',
      'Feed product insights from the field to HQ marketing',
    ],
    benefits: ['Competitive OTE', 'Medical cover', 'Company laptop & airtime'],
    skills: ['B2B Sales', 'CRM', 'Negotiation', 'Data Presentation'],
    salary: { min: 140000, max: 220000, currency: 'KES' },
    salaryPublic: true,
    experience: '4+ years B2B sales or account management',
    education: "Bachelor's in Marketing, Commerce, or related",
    minYearsExperience: 4,
    educationLevel: 'Bachelor',
    educationQualification: 'Commerce, Marketing, Business Administration',
    requiredCertifications: null,
    deadlineDaysFromNow: 55,
  },
  {
    title: 'HSE Officer — Retail & Depots',
    location: 'Nairobi, Kenya (regional travel)',
    type: 'Full Time',
    category: 'Health, Safety & Environment',
    description:
      'Embed HSSE culture across Stabex retail and depot assets in Kenya: inspections, incident investigations, contractor controls, and regulatory liaison with ERC and county teams.',
    requirements: [
      'NEBOSH IGC or equivalent; 4+ years HSE in fuels, chemicals, or logistics',
      'Experience delivering toolbox talks and audit programmes',
      'Strong written communication for regulator correspondence',
    ],
    responsibilities: [
      'Schedule and document site inspections with corrective actions',
      'Lead incident investigations and lessons-learned sessions',
      'Maintain contractor HSE files and PTW oversight',
    ],
    benefits: ['Medical cover', 'Professional membership support', 'Travel per diem'],
    skills: ['Incident Investigation', 'Risk Assessment', 'Training Delivery', 'Regulatory Engagement'],
    salary: { min: 160000, max: 240000, currency: 'KES' },
    salaryPublic: false,
    experience: '4+ years HSE in industrial or retail fuel environments',
    education: 'Degree in Environmental Science, Engineering, or Occupational Health',
    minYearsExperience: 4,
    educationLevel: 'Bachelor',
    educationQualification: 'Environmental, Mechanical, or Safety Engineering',
    requiredCertifications: 'NEBOSH IGC or equivalent',
    deadlineDaysFromNow: 50,
  },
  {
    title: 'HR Business Partner — Field Operations',
    location: 'Kampala, Uganda',
    type: 'Full Time',
    category: 'Human Resources',
    description:
      'Partner with retail and depot leaders on workforce planning, performance cycles, and employee relations for a growing multi-country footprint.',
    requirements: [
      '5+ years HR BP or HR generalist experience in retail or logistics',
      'Solid knowledge of Uganda employment law and practice',
      'Experience with HRIS and payroll interfaces',
    ],
    responsibilities: [
      'Support hiring, onboarding, and probation for frontline roles',
      'Coach managers on performance, discipline, and grievance handling',
      'Drive engagement and communication programmes for shift staff',
    ],
    benefits: ['Medical cover', 'Hybrid working where role allows', 'Learning budget'],
    skills: ['Employee Relations', 'Workforce Planning', 'HRIS', 'Coaching'],
    salary: { min: 2400000, max: 3600000, currency: 'UGX' },
    salaryPublic: false,
    experience: '5+ years HR business partnering',
    education: "Bachelor's in HR, Psychology, or related",
    minYearsExperience: 5,
    educationLevel: 'Bachelor',
    educationQualification: 'Human Resource Management, Psychology, Industrial Relations',
    requiredCertifications: 'IHRM or equivalent membership preferred',
    deadlineDaysFromNow: 56,
  },
  {
    title: 'Finance Analyst — Retail & Cards',
    location: 'Nairobi, Kenya',
    type: 'Full Time',
    category: 'Finance',
    description:
      'Support management reporting for retail margins, fleet card revenue, and working capital. Partner with operations on variance analysis and statutory timelines.',
    requirements: [
      'CPA II minimum (or ACCA equivalent) with 3+ years relevant experience',
      'Advanced Excel; experience with ERP retail modules is a plus',
      'Comfortable translating operational KPIs into finance narratives',
    ],
    responsibilities: [
      'Produce weekly margin and volume dashboards by region',
      'Support month-end close for retail and cards business lines',
      'Assist external audit and tax queries with clean documentation',
    ],
    benefits: ['Medical cover', 'Study support for CPA final', 'Bonus scheme'],
    skills: ['Financial Modelling', 'ERP', 'Variance Analysis', 'Reporting'],
    salary: { min: 130000, max: 190000, currency: 'KES' },
    salaryPublic: false,
    experience: '3+ years finance analysis in retail, FMCG, or payments',
    education: "Bachelor's in Finance, Accounting, or Commerce",
    minYearsExperience: 3,
    educationLevel: 'Bachelor',
    educationQualification: 'Commerce, Accounting, Finance, or Economics',
    requiredCertifications: 'CPA II or ACCA equivalent',
    deadlineDaysFromNow: 47,
  },
  {
    title: 'IT Systems Analyst — POS & Forecourt',
    location: 'Nairobi, Kenya',
    type: 'Full Time',
    category: 'Technology',
    description:
      'Own stability and enhancements for point-of-sale, tank gauging, and integrations used at Stabex sites. Be the bridge between vendors, cybersecurity, and retail operations.',
    requirements: [
      '4+ years supporting retail or hospitality POS ecosystems',
      'Understanding of payment flows, VPNs, and remote site connectivity',
      'Ability to document SOPs and train station supervisors',
    ],
    responsibilities: [
      'Triage incidents, escalate vendors, and track root-cause fixes',
      'Test releases for POS and forecourt peripherals',
      'Maintain asset inventory and patch compliance for sites',
    ],
    benefits: ['Medical cover', 'Certification budget', 'Hybrid working'],
    skills: ['POS Support', 'Networking', 'SQL', 'Documentation'],
    salary: { min: 150000, max: 210000, currency: 'KES' },
    salaryPublic: true,
    experience: '4+ years IT support or business systems analysis',
    education: 'Degree in IT, Computer Science, or related',
    minYearsExperience: 4,
    educationLevel: 'Bachelor',
    educationQualification: 'Computer Science, Information Systems, or Software Engineering',
    requiredCertifications: null,
    deadlineDaysFromNow: 59,
  },
  {
    title: 'Graduate Trainee Programme — Retail Operations',
    location: 'Kampala & Nairobi (rotations)',
    type: 'Full Time',
    category: 'Early Careers',
    description:
      'Two-year accelerated programme across station operations, depot shadowing, and HQ projects. Designed for graduates who want to grow into supervisory roles in fuel retail.',
    requirements: [
      "Bachelor's completed within the last 24 months (any discipline)",
      'High energy, customer-centric mindset, and mobility between cities',
      'Leadership experience through campus, volunteer, or work placements',
    ],
    responsibilities: [
      'Complete structured rotations with competency sign-offs',
      'Deliver a capstone project on customer experience or HSSE',
      'Participate in community and brand activations',
    ],
    benefits: ['Mentorship', 'Medical cover', 'Programme stipend plus performance uplift'],
    skills: ['Communication', 'Problem Solving', 'Teamwork', 'Data Literacy'],
    salary: { min: 850000, max: 1200000, currency: 'UGX' },
    salaryPublic: true,
    experience: '0–1 years professional experience (graduate)',
    education: "Bachelor's degree (any discipline)",
    minYearsExperience: 0,
    educationLevel: 'Bachelor',
    educationQualification: 'Open — strong academic record and extracurricular leadership',
    requiredCertifications: null,
    deadlineDaysFromNow: 45,
  },
];

async function seedStabexRecruitmentJobs(now: Date) {
  let settings = await prisma.recruitmentSettings.findUnique({ where: { id: 'default' } });
  let clientId: string;

  if (!settings) {
    const client = await prisma.client.create({
      data: {
        name: STABEX_RECRUITMENT_EMPLOYER,
        isAnonymous: false,
        contactName: DEMO_WORKSPACE.contactName,
        contactEmail: DEMO_WORKSPACE.contactEmail,
        contactPhone: DEMO_WORKSPACE.contactPhone,
      },
    });
    clientId = client.id;
    settings = await prisma.recruitmentSettings.create({
      data: {
        id: 'default',
        employerName: STABEX_RECRUITMENT_EMPLOYER,
        contactName: DEMO_WORKSPACE.contactName,
        contactEmail: DEMO_WORKSPACE.contactEmail,
        contactPhone: DEMO_WORKSPACE.contactPhone,
        linkedClientId: client.id,
      },
    });
  } else if (!settings.linkedClientId) {
    const client = await prisma.client.create({
      data: {
        name: STABEX_RECRUITMENT_EMPLOYER,
        isAnonymous: false,
        contactName: DEMO_WORKSPACE.contactName,
        contactEmail: DEMO_WORKSPACE.contactEmail,
        contactPhone: DEMO_WORKSPACE.contactPhone,
      },
    });
    clientId = client.id;
    await prisma.recruitmentSettings.update({
      where: { id: 'default' },
      data: {
        employerName: STABEX_RECRUITMENT_EMPLOYER,
        linkedClientId: client.id,
        contactName: DEMO_WORKSPACE.contactName,
        contactEmail: DEMO_WORKSPACE.contactEmail,
        contactPhone: DEMO_WORKSPACE.contactPhone,
      },
    });
  } else {
    clientId = settings.linkedClientId;
    await prisma.client.update({
      where: { id: clientId },
      data: {
        name: STABEX_RECRUITMENT_EMPLOYER,
        contactName: DEMO_WORKSPACE.contactName,
        contactEmail: DEMO_WORKSPACE.contactEmail,
        contactPhone: DEMO_WORKSPACE.contactPhone,
      },
    });
    await prisma.recruitmentSettings.update({
      where: { id: 'default' },
      data: {
        employerName: STABEX_RECRUITMENT_EMPLOYER,
        contactName: DEMO_WORKSPACE.contactName,
        contactEmail: DEMO_WORKSPACE.contactEmail,
        contactPhone: DEMO_WORKSPACE.contactPhone,
      },
    });
  }

  await prisma.job.deleteMany({ where: { clientId } });

  const year = now.getUTCFullYear();
  for (let idx = 0; idx < STABEX_CAREERS_JOBS.length; idx += 1) {
    const def = STABEX_CAREERS_JOBS[idx];
    const referenceId = `JOB-${year}-STB-${String(idx + 1).padStart(3, '0')}`;
    const slug = await ensureUniqueSlug(
      jobSlugBase(def.title, def.location, `stb${idx}`),
      async (s) => !!(await prisma.job.findUnique({ where: { slug: s } })),
    );
    const applicationDeadline = daysFromToday(def.deadlineDaysFromNow);
    const postedDate = daysFromToday(-2 - idx * 2);

    await prisma.job.create({
      data: {
        referenceId,
        slug,
        title: def.title,
        company: STABEX_RECRUITMENT_EMPLOYER,
        location: def.location,
        type: def.type,
        category: def.category,
        description: def.description,
        requirements: def.requirements as unknown as Prisma.JsonArray,
        responsibilities: def.responsibilities as unknown as Prisma.JsonArray,
        benefits: def.benefits as unknown as Prisma.JsonArray,
        salary: def.salary as Prisma.InputJsonValue,
        salaryPublic: def.salaryPublic,
        experience: def.experience,
        education: def.education,
        minYearsExperience: def.minYearsExperience,
        educationLevel: def.educationLevel,
        educationQualification: def.educationQualification,
        requiredCertifications: def.requiredCertifications,
        skills: def.skills as unknown as Prisma.JsonArray,
        isActive: true,
        postedDate,
        applicationStartAt: null,
        applicationDeadline,
        clientId,
        concealCompany: false,
      },
    });
  }

  console.log(
    `→ Careers: ${STABEX_CAREERS_JOBS.length} Stabex job listings (deadlines ${Math.min(...STABEX_CAREERS_JOBS.map((j) => j.deadlineDaysFromNow))}–${Math.max(...STABEX_CAREERS_JOBS.map((j) => j.deadlineDaysFromNow))} days from seed run)`,
  );
}

const DEMO_PIPELINE_EMAIL_DOMAIN = 'pipeline.demo.stabexintl.com';

function utcAtOffsetDaysHour(daysFromUtcToday: number, hourUtc: number, minuteUtc = 0): Date {
  const d = daysFromToday(daysFromUtcToday);
  d.setUTCHours(hourUtc, minuteUtc, 0, 0);
  return d;
}

/**
 * Candidates, applications, and interviews under the linked recruitment client.
 * Emails end with @{DEMO_PIPELINE_EMAIL_DOMAIN}; re-seed clears prior demo rows via deleteMany.
 */
async function seedStabexRecruitmentApplicationsAndInterviews() {
  const settings = await prisma.recruitmentSettings.findUnique({ where: { id: 'default' } });
  if (!settings?.linkedClientId) {
    console.log('→ Recruitment pipeline: skipped (no linked recruitment client).');
    return;
  }

  const removed = await prisma.candidate.deleteMany({
    where: { email: { endsWith: `@${DEMO_PIPELINE_EMAIL_DOMAIN}` } },
  });
  if (removed.count > 0) {
    console.log(`→ Recruitment pipeline: removed ${removed.count} prior demo candidate(s).`);
  }

  const jobs = await prisma.job.findMany({
    where: { clientId: settings.linkedClientId },
    orderBy: [{ referenceId: 'asc' }],
    select: { id: true, title: true },
  });
  if (jobs.length === 0) {
    console.log('→ Recruitment pipeline: no jobs found for linked client.');
    return;
  }

  const jid = (i: number) => jobs[i % jobs.length]!.id;

  type FD = Record<string, unknown>;

  type Row = {
    slug: string;
    first: string;
    last: string;
    phone: string;
    loc: string;
    nationality: string;
    county: string;
    xp: number;
    jobIx: number;
    status: ApplicationStatus;
    daysAgo: number;
    salary: string;
    cover?: string;
    notes?: string;
    fd: FD;
    iv?: {
      /** days from UTC “today” (same helper as roster) */
      dayOffset: number;
      hourUtc: number;
      type: 'video' | 'phone' | 'onsite';
      duration: 30 | 45 | 60;
      status: InterviewStatus;
      inviteSent: boolean;
      confirm?: ConfirmationStatus;
    };
  };

  /** Mix of statuses, education levels, disciplines, certs, memberships, employer names — matches dashboard filter keys. */
  const rows: Row[] = [
    {
      slug: 'edith.nakitende',
      first: 'Edith',
      last: 'Nakitende',
      phone: '+256 700 310001',
      loc: 'Kampala, Uganda',
      nationality: 'Ugandan',
      county: 'Kampala',
      xp: 9,
      jobIx: 0,
      status: ApplicationStatus.shortlisted,
      daysAgo: 2,
      salary: 'UGX 3.8M–4.2M monthly',
      cover: 'Regional retail leadership across East Africa; comfortable with Nairobi–Kampala travel.',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'masters',
            institution: 'Strathmore University',
            grade: 'Distinction',
            discipline: 'MBA — Strategy',
          },
          { level: 'undergraduate', institution: 'Makerere University', grade: 'Upper Second', discipline: 'Commerce' },
        ],
        employmentHistory: [
          {
            jobTitle: 'Operations Manager',
            companyName: 'Summit Petroleum Retail Kenya',
            industry: 'Retail',
            employmentType: 'Full-time',
            startDate: '2016-06',
            endDate: '2019-12',
            isCurrentJob: false,
          },
          {
            jobTitle: 'Area Supervisor',
            companyName: 'BlueFlame Stations Uganda',
            industry: 'Energy',
            employmentType: 'Full-time',
            startDate: '2020-02',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        professionalCertificationsList: [{ name: 'PMP' }],
        professionalMemberships: [{ name: 'East Africa Logistics Association', membershipNo: 'EALA-88421' }],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
      iv: {
        dayOffset: 6,
        hourUtc: 8,
        type: 'video',
        duration: 45,
        status: InterviewStatus.scheduled,
        inviteSent: true,
        confirm: ConfirmationStatus.confirmed,
      },
    },
    {
      slug: 'amos.kiprop',
      first: 'Amos',
      last: 'Kiprop',
      phone: '+254 722 910402',
      loc: 'Nairobi, Kenya',
      nationality: 'Kenyan',
      county: 'Nairobi',
      xp: 4,
      jobIx: 5,
      status: ApplicationStatus.shortlisted,
      daysAgo: 4,
      salary: 'KES 165k–210k',
      fd: {
        gender: 'Male',
        education: [
          {
            level: 'undergraduate',
            institution: 'JKUAT',
            grade: 'Second Class Upper',
            discipline: 'Environmental Science',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'HSE Advisor',
            companyName: 'Transline Logistics PLC',
            industry: 'Transport',
            employmentType: 'Full-time',
            startDate: '2021-04',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        professionalCertificationsList: [{ name: 'NEBOSH IGC' }],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
      iv: {
        dayOffset: 3,
        hourUtc: 13,
        type: 'onsite',
        duration: 60,
        status: InterviewStatus.scheduled,
        inviteSent: true,
        confirm: ConfirmationStatus.pending,
      },
    },
    {
      slug: 'stella.amani',
      first: 'Stella',
      last: 'Amani',
      phone: '+256 702 774102',
      loc: 'Jinja, Uganda',
      nationality: 'Ugandan',
      county: 'Jinja',
      xp: 6,
      jobIx: 2,
      status: ApplicationStatus.shortlisted,
      daysAgo: 3,
      salary: 'UGX 2.5M negotiable',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'undergraduate',
            institution: 'MUK',
            grade: 'Second Class Upper',
            discipline: 'Chemical Engineering',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Depot Superintendent',
            companyName: 'Great Lakes Bulk Fuels',
            industry: 'Logistics',
            employmentType: 'Full-time',
            startDate: '2019-07',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
      iv: {
        dayOffset: -2,
        hourUtc: 7,
        type: 'phone',
        duration: 30,
        status: InterviewStatus.completed,
        inviteSent: true,
        confirm: ConfirmationStatus.confirmed,
      },
    },
    {
      slug: 'paul.mwendwa',
      first: 'Paul',
      last: 'Mwendwa',
      phone: '+254 733 661902',
      loc: 'Mombasa, Kenya',
      nationality: 'Kenyan',
      county: 'Mombasa',
      xp: 5,
      jobIx: 4,
      status: ApplicationStatus.shortlisted,
      daysAgo: 5,
      salary: 'KES 150k–180k plus OTE',
      fd: {
        gender: 'Male',
        education: [
          {
            level: 'undergraduate',
            institution: 'USIU-Africa',
            grade: 'First Class',
            discipline: 'Marketing',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'B2B Account Executive',
            companyName: 'Pacific Fleet Payments',
            industry: 'Payments',
            employmentType: 'Full-time',
            startDate: '2020-01',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
      iv: {
        dayOffset: 8,
        hourUtc: 15,
        type: 'video',
        duration: 45,
        status: InterviewStatus.scheduled,
        inviteSent: false,
        confirm: ConfirmationStatus.pending,
      },
    },
    {
      slug: 'julian.akello',
      first: 'Julian',
      last: 'Akello',
      phone: '+256 775 902314',
      loc: 'Mbale, Uganda',
      nationality: 'Ugandan',
      county: 'Mbale',
      xp: 1,
      jobIx: 9,
      status: ApplicationStatus.pending,
      daysAgo: 1,
      salary: 'Open to graduate stipend programme',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'undergraduate',
            institution: 'Makerere University',
            grade: 'Second Class Upper',
            discipline: 'Economics',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Graduate Trainee — Analytics',
            companyName: 'TechBridge Uganda Ltd',
            industry: 'Technology',
            employmentType: 'Contract',
            startDate: '2025-09',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'nancy.waithira',
      first: 'Nancy',
      last: 'Waithira',
      phone: '+254 713 557720',
      loc: 'Kiambu, Kenya',
      nationality: 'Kenyan',
      county: 'Kiambu',
      xp: 3,
      jobIx: 7,
      status: ApplicationStatus.pending,
      daysAgo: 5,
      salary: 'KES 155k–200k',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'undergraduate',
            institution: 'University of Nairobi',
            grade: 'Second Class Upper',
            discipline: 'Computer Science',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'IT Support Analyst',
            companyName: 'Retail Systems East Africa',
            industry: 'Technology',
            employmentType: 'Full-time',
            startDate: '2022-01',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'peter.otim',
      first: 'Peter',
      last: 'Otim',
      phone: '+256 702 889011',
      loc: 'Arua, Uganda',
      nationality: 'Ugandan',
      county: 'Arua',
      xp: 4,
      jobIx: 3,
      status: ApplicationStatus.pending,
      daysAgo: 6,
      salary: 'UGX 2.1M negotiable',
      fd: {
        gender: 'Male',
        education: [
          {
            level: 'diploma',
            institution: 'Uganda Petroleum Institute',
            grade: 'Merit',
            discipline: 'Logistics',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Route Supervisor',
            companyName: 'GasLink Distribution',
            industry: 'Energy',
            employmentType: 'Full-time',
            startDate: '2022-03',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'james.odhiambo',
      first: 'James',
      last: 'Odhiambo',
      phone: '+254 721 904011',
      loc: 'Kisumu, Kenya',
      nationality: 'Kenyan',
      county: 'Kisumu',
      xp: 4,
      jobIx: 6,
      status: ApplicationStatus.reviewed,
      daysAgo: 8,
      salary: 'UGX / KES equivalence discussed at offer',
      notes: 'Strong ER examples; scheduling panel next week.',
      fd: {
        gender: 'Male',
        education: [
          {
            level: 'masters',
            institution: 'University of Nairobi',
            grade: 'Pass',
            discipline: 'Human Resource Management',
          },
          {
            level: 'undergraduate',
            institution: 'Maseno University',
            grade: 'Upper Second',
            discipline: 'Psychology',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Senior HR Officer',
            companyName: 'Eastlands Retail Cooperative',
            industry: 'Retail',
            employmentType: 'Full-time',
            startDate: '2018-06',
            endDate: '2025-01',
            isCurrentJob: false,
          },
        ],
        professionalMemberships: [{ name: 'IHRM Uganda', membershipNo: 'IHRM-45290' }],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
      iv: {
        dayOffset: 12,
        hourUtc: 10,
        type: 'video',
        duration: 45,
        status: InterviewStatus.scheduled,
        inviteSent: true,
        confirm: ConfirmationStatus.confirmed,
      },
    },
    {
      slug: 'claire.mbatha',
      first: 'Claire',
      last: 'Mbatha',
      phone: '+254 722 600882',
      loc: 'Nairobi, Kenya',
      nationality: 'Kenyan',
      county: 'Nairobi',
      xp: 3,
      jobIx: 8,
      status: ApplicationStatus.reviewed,
      daysAgo: 7,
      salary: 'KES 148k–195k',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'undergraduate',
            institution: 'Strathmore University',
            grade: 'Upper Second',
            discipline: 'Information Technology',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Junior Systems Analyst',
            companyName: 'Nairobi Convenience Systems',
            industry: 'Software',
            employmentType: 'Full-time',
            startDate: '2023-01',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'violet.namukasa',
      first: 'Violet',
      last: 'Namukasa',
      phone: '+256 772 661203',
      loc: 'Kampala, Uganda',
      nationality: 'Ugandan',
      county: 'Wakiso',
      xp: 5,
      jobIx: 1,
      status: ApplicationStatus.pending,
      daysAgo: 2,
      salary: 'UGX 2.2M monthly',
      cover: 'Forecourt supervisory experience across three high-volume Kampala outlets.',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'diploma',
            institution: 'Kyambogo University',
            grade: 'Credit',
            discipline: 'Business Management',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Senior Station Supervisor',
            companyName: 'MetroFuel Uganda',
            industry: 'Retail',
            employmentType: 'Full-time',
            startDate: '2019-04',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'simon.otieno',
      first: 'Simon',
      last: 'Otieno',
      phone: '+254 715 993044',
      loc: 'Westlands, Kenya',
      nationality: 'Kenyan',
      county: 'Nairobi',
      xp: 4,
      jobIx: 6,
      status: ApplicationStatus.pending,
      daysAgo: 3,
      salary: 'KES 155k gross',
      fd: {
        gender: 'Male',
        education: [
          {
            level: 'undergraduate',
            institution: 'Kenyatta University',
            grade: 'Second Class Upper',
            discipline: 'Psychology',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'HR Coordinator',
            companyName: 'LogiChain Kenya Ltd',
            industry: 'Logistics',
            employmentType: 'Full-time',
            startDate: '2022-06',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'sarah.nakayi',
      first: 'Sarah',
      last: 'Nakayi',
      phone: '+256 701 774290',
      loc: 'Gulu, Uganda',
      nationality: 'Ugandan',
      county: 'Gulu',
      xp: 2,
      jobIx: 9,
      status: ApplicationStatus.pending,
      daysAgo: 4,
      salary: 'UGX 980k stipend expectation',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'certificate',
            institution: 'Uganda Martyrs Certificate College',
            grade: 'Pass',
            discipline: 'Marketing',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Volunteer Outreach Lead',
            companyName: 'North Uganda Youth Forum',
            industry: 'Community',
            employmentType: 'Freelance',
            startDate: '2024-01',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'ruth.chepkemei',
      first: 'Ruth',
      last: 'Chepkemei',
      phone: '+254 720 884102',
      loc: 'Kericho, Kenya',
      nationality: 'Kenyan',
      county: 'Kericho',
      xp: 2,
      jobIx: 5,
      status: ApplicationStatus.pending,
      daysAgo: 6,
      salary: 'KES 138k gross',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'certificate',
            institution: 'Boma Safety College',
            grade: 'Distinction',
            discipline: 'Occupational Safety',
          },
          { level: 'high_school', institution: 'Kericho Girls High', grade: 'B Plain' },
        ],
        employmentHistory: [
          {
            jobTitle: 'Safety Assistant',
            companyName: 'Highland Warehousing',
            industry: 'Industrial',
            employmentType: 'Contract',
            startDate: '2024-04',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        professionalCertificationsList: [{ name: 'First Aid Instructor' }],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'david.bukenya',
      first: 'David',
      last: 'Bukenya',
      phone: '+256 772 993011',
      loc: 'Masaka, Uganda',
      nationality: 'Ugandan',
      county: 'Masaka',
      xp: 6,
      jobIx: 7,
      status: ApplicationStatus.pending,
      daysAgo: 9,
      salary: 'UGX 3.8M negotiating',
      fd: {
        gender: 'Male',
        education: [
          {
            level: 'masters',
            institution: 'Makerere University',
            grade: 'Merit',
            discipline: 'Information Systems',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'DevOps Technician',
            companyName: 'AgriFuel Systems',
            industry: 'Agriculture',
            employmentType: 'Full-time',
            startDate: '2019-07',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'beatrice.oloo',
      first: 'Beatrice',
      last: 'Oloo',
      phone: '+254 734 889103',
      loc: 'Kisumu, Kenya',
      nationality: 'Kenyan',
      county: 'Kisumu',
      xp: 5,
      jobIx: 7,
      status: ApplicationStatus.pending,
      daysAgo: 10,
      salary: 'KES 148k gross',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'masters',
            institution: 'KCA University',
            grade: 'Credit',
            discipline: 'Computer Science',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Systems Administrator',
            companyName: 'LakeHub Cooperative',
            industry: 'Finance',
            employmentType: 'Full-time',
            startDate: '2020-11',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'patrick.mugenyi',
      first: 'Patrick',
      last: 'Mugenyi',
      phone: '+256 703 774290',
      loc: 'Kampala, Uganda',
      nationality: 'Ugandan',
      county: 'Kampala',
      xp: 7,
      jobIx: 2,
      status: ApplicationStatus.pending,
      daysAgo: 11,
      salary: 'UGX 3.6M gross',
      fd: {
        gender: 'Male',
        education: [
          {
            level: 'masters',
            institution: 'ESAMI',
            grade: 'Pass',
            discipline: 'Supply Chain Management',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Warehouse Lead',
            companyName: 'FreshRoute Cold Chain Ltd',
            industry: 'Cold chain',
            employmentType: 'Full-time',
            startDate: '2017-06',
            endDate: '2026-03',
            isCurrentJob: true,
          },
        ],
        professionalCertificationsList: [{ name: 'Lean Six Sigma Green Belt' }],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'florence.makori',
      first: 'Florence',
      last: 'Makori',
      phone: '+254 722 330911',
      loc: 'Machakos, Kenya',
      nationality: 'Kenyan',
      county: 'Machakos',
      xp: 4,
      jobIx: 4,
      status: ApplicationStatus.hired,
      daysAgo: 28,
      salary: 'KES 148k negotiated',
      notes: 'Accepted offer — onboarding handoff to HRBP.',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'masters',
            institution: 'Daystar University',
            grade: 'Distinction',
            discipline: 'Business Administration',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Key Account Manager — Fleet',
            companyName: 'MetroLine Transport',
            industry: 'Transport',
            employmentType: 'Full-time',
            startDate: '2020-06',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        professionalCertificationsList: [{ name: 'Salesforce Ranger' }],
        professionalMemberships: [{ name: 'MSK', membershipNo: 'MSK-10293' }],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
      iv: {
        dayOffset: -18,
        hourUtc: 9,
        type: 'onsite',
        duration: 45,
        status: InterviewStatus.completed,
        inviteSent: true,
        confirm: ConfirmationStatus.confirmed,
      },
    },
    {
      slug: 'moses.kansiime',
      first: 'Moses',
      last: 'Kansiime',
      phone: '+256 772 330011',
      loc: 'Hoima, Uganda',
      nationality: 'Ugandan',
      county: 'Hoima',
      xp: 5,
      jobIx: 1,
      status: ApplicationStatus.rejected,
      daysAgo: 14,
      salary: 'UGX 2.5M expectation',
      notes: 'Insufficient supervisory tenure for flagship city site.',
      fd: {
        gender: 'Male',
        education: [
          {
            level: 'high_school',
            institution: 'St. Andrews College',
            grade: 'Arts focus',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Pump Attendant Supervisor',
            companyName: 'QuickFill Uganda',
            industry: 'Retail',
            employmentType: 'Full-time',
            startDate: '2022-06',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'joseph.ruto',
      first: 'Joseph',
      last: 'Ruto',
      phone: '+254 734 993011',
      loc: 'Eldoret, Kenya',
      nationality: 'Kenyan',
      county: 'Uasin Gishu',
      xp: 2,
      jobIx: 0,
      status: ApplicationStatus.pending,
      daysAgo: 12,
      salary: 'KES 295k negotiating',
      fd: {
        gender: 'Male',
        education: [
          {
            level: 'masters',
            institution: 'University of Edinburgh',
            grade: 'Merit',
            discipline: 'Engineering Management',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Regional Sales Lead — East Africa',
            companyName: 'Horizon PetroServices',
            industry: 'Energy',
            employmentType: 'Freelance',
            startDate: '2025-06',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        professionalCertificationsList: [{ name: 'CPA(K)' }],
        professionalMemberships: [{ name: 'ICPAK', membershipNo: 'ICPAK-DEMO-99301' }],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'mariamu.nabasirye',
      first: 'Mariamu',
      last: 'Nabasirye',
      phone: '+256 774 993011',
      loc: 'Kampala, Uganda',
      nationality: 'Ugandan',
      county: 'Kampala',
      xp: 4,
      jobIx: 4,
      status: ApplicationStatus.pending,
      daysAgo: 13,
      salary: 'UGX equivalent to KES 140k expectation',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'masters',
            institution: 'Manchester Business School Uganda Hub',
            grade: 'Pass',
            discipline: 'MBA — Marketing',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Channel Partner Manager',
            companyName: 'Summit Petro Retail Kenya',
            industry: 'Retail',
            employmentType: 'Freelance',
            startDate: '2026-03',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        professionalCertificationsList: [{ name: 'Google Ads Search' }],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'diana.jepkorir',
      first: 'Diana',
      last: 'Jepkorir',
      phone: '+254 722 112903',
      loc: 'Nairobi, Kenya',
      nationality: 'Kenyan',
      county: 'Nairobi',
      xp: 3,
      jobIx: 9,
      status: ApplicationStatus.pending,
      daysAgo: 14,
      salary: 'KES 75k trainee allowance',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'masters',
            institution: 'Technical University of Kenya',
            grade: 'Distinction',
            discipline: 'Data Science',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Graduate Intern — Analytics',
            companyName: 'CityPay Kenya',
            industry: 'Finance',
            employmentType: 'Contract',
            startDate: '2025-10',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'peter.akampurira',
      first: 'Peter',
      last: 'Akampurira',
      phone: '+256 774 884102',
      loc: 'Kabale, Uganda',
      nationality: 'Ugandan',
      county: 'Kabale',
      xp: 6,
      jobIx: 3,
      status: ApplicationStatus.pending,
      daysAgo: 15,
      salary: 'UGX 3.9M negotiating',
      fd: {
        gender: 'Male',
        education: [
          {
            level: 'masters',
            institution: 'Uganda Martyrs University',
            grade: 'Credit',
            discipline: 'Environmental Management',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Fleet Coordinator — LPG',
            companyName: 'GreenCylinder Uganda',
            industry: 'Energy',
            employmentType: 'Full-time',
            startDate: '2019-02',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'linda.otieno',
      first: 'Linda',
      last: 'Otieno',
      phone: '+254 722 993011',
      loc: 'Nairobi, Kenya',
      nationality: 'Kenyan',
      county: 'Nairobi',
      xp: 2,
      jobIx: 6,
      status: ApplicationStatus.pending,
      daysAgo: 14,
      salary: 'KES 120k probation band',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'certificate',
            institution: 'College of HR Excellence',
            grade: 'Credit',
            discipline: 'Industrial Relations',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Recruitment Coordinator',
            companyName: 'Summit Petro Retail Kenya',
            industry: 'Retail',
            employmentType: 'Full-time',
            startDate: '2026-06',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'amina.kirabo',
      first: 'Amina',
      last: 'Kirabo',
      phone: '+256 702 993011',
      loc: 'Kampala, Uganda',
      nationality: 'Ugandan',
      county: 'Kampala',
      xp: 5,
      jobIx: 5,
      status: ApplicationStatus.pending,
      daysAgo: 16,
      salary: 'UGX negotiable aligned to HSE scales',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'masters',
            institution: 'Aga Khan University',
            grade: 'Distinction',
            discipline: 'Nursing Leadership',
          },
          {
            level: 'undergraduate',
            institution: 'MUK',
            grade: 'Second Class Upper',
            discipline: 'Nursing',
          },
        ],
        employmentHistory: [
          {
            jobTitle: 'Lead Nurse Clinician',
            companyName: 'Metro Medical Centre Kampala',
            industry: 'Healthcare',
            employmentType: 'Full-time',
            startDate: '2020-01',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        professionalCertificationsList: [{ name: 'Advanced Cardiac Life Support' }],
        professionalMemberships: [{ name: 'UNMC', membershipNo: 'UNMC-N-99301' }],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'winnie.kabatesi',
      first: 'Winnie',
      last: 'Kabatesi',
      phone: '+256 772 440011',
      loc: 'Mbarara, Uganda',
      nationality: 'Ugandan',
      county: 'Mbarara',
      xp: 1,
      jobIx: 5,
      status: ApplicationStatus.pending,
      daysAgo: 17,
      salary: 'UGX stipend-aligned',
      fd: {
        gender: 'Female',
        education: [
          {
            level: 'certificate',
            institution: 'Mbarara Nursing School',
            grade: 'Pass',
            discipline: 'Nursing',
          },
          { level: 'high_school', institution: 'Ntare Girls', grade: 'B+' },
        ],
        employmentHistory: [
          {
            jobTitle: 'Community Health Volunteer',
            companyName: 'West Ankole Cooperative',
            industry: 'Healthcare',
            employmentType: 'Freelance',
            startDate: '2024-06',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        professionalCertificationsList: [{ name: 'Basic Life Support' }],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
    {
      slug: 'isaac.nyamai',
      first: 'Isaac',
      last: 'Nyamai',
      phone: '+254 722 440011',
      loc: 'Nairobi, Kenya',
      nationality: 'Kenyan',
      county: 'Nairobi',
      xp: 1,
      jobIx: 8,
      status: ApplicationStatus.pending,
      daysAgo: 17,
      salary: 'KES 155k probation',
      fd: {
        gender: 'Male',
        education: [{ level: 'phd', institution: 'MIT', grade: 'Ongoing research', discipline: 'Human–Computer Interaction' }],
        employmentHistory: [
          {
            jobTitle: 'Research Affiliate',
            companyName: 'Nairobi HCI Lab',
            industry: 'Academia',
            employmentType: 'Contract',
            startDate: '2025-12',
            endDate: '',
            isCurrentJob: true,
          },
        ],
        declarations: {
          accurate: true,
          dataProcessing: true,
          backgroundChecks: true,
          talentPool: true,
        },
      },
    },
  ];

  let interviewCount = 0;
  for (const r of rows) {
    const email = `${r.slug}@${DEMO_PIPELINE_EMAIL_DOMAIN}`;
    const candidate = await prisma.candidate.create({
      data: {
        firstName: r.first,
        lastName: r.last,
        email,
        phone: r.phone,
        location: r.loc,
        nationality: r.nationality,
        homeCounty: r.county,
        experience: r.xp,
        education: 'Profile completed in structured application.',
        resumePath: '/uploads/resumes/amara_njoroge_cv.pdf',
      },
    });

    const appliedDate = daysFromToday(-r.daysAgo);
    const application = await prisma.application.create({
      data: {
        jobId: jid(r.jobIx),
        candidateId: candidate.id,
        status: r.status,
        appliedDate,
        coverLetter: r.cover ?? null,
        salaryExpectations: r.salary,
        notes: r.notes ?? null,
        formData: r.fd as Prisma.InputJsonValue,
        resumePath: '/uploads/resumes/amara_njoroge_cv.pdf',
      },
    });

    if (r.iv) {
      const scheduledAt = utcAtOffsetDaysHour(r.iv.dayOffset, r.iv.hourUtc);
      await prisma.interview.create({
        data: {
          applicationId: application.id,
          scheduledAt,
          durationMinutes: r.iv.duration,
          type: r.iv.type,
          locationOrLink:
            r.iv.type === 'video'
              ? 'https://meet.stabexintl.com/demo-interview-room'
              : r.iv.type === 'phone'
                ? `Phone: candidate ${r.phone}`
                : 'Stabex — Kampala HQ, Boardroom East (demo address)',
          notes: 'Scheduled via demo seed.',
          status: r.iv.status,
          inviteSentAt: r.iv.inviteSent ? daysFromToday(-1) : null,
          confirmationStatus: r.iv.confirm ?? ConfirmationStatus.pending,
          confirmationAt: r.iv.confirm === ConfirmationStatus.confirmed ? daysFromToday(-1) : null,
        },
      });
      interviewCount += 1;
    }
  }

  for (const j of jobs) {
    const c = await prisma.application.count({ where: { jobId: j.id } });
    await prisma.job.update({ where: { id: j.id }, data: { applicationCount: c } });
  }

  const stationSupervisor = jobs.find((j) => j.title.includes('Station Supervisor'));
  if (stationSupervisor) {
    await prisma.interviewScheduleBreak.deleteMany({ where: { jobId: stationSupervisor.id } });
    await prisma.interviewScheduleBreak.create({
      data: {
        jobId: stationSupervisor.id,
        scheduledAt: utcAtOffsetDaysHour(4, 11, 30),
        durationMinutes: 45,
        label: 'Panel lunch — bookable gap',
        notes: 'Interview day buffer for back-to-back panel slots.',
      },
    });
  }

  console.log(
    `→ Recruitment pipeline: ${rows.length} applications (${interviewCount} interviews) across ${jobs.length} Stabex job(s). Talent pool populated with the same candidates.`,
  );
}

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

  const existingKeWorkspace = await prisma.outsourcingClient.findFirst({
    where: {
      OR: [
        { entityCode: 'ke' },
        { name: DEMO_WORKSPACE.name },
        { name: 'Demo Corporation' },
        { name: 'Stabex International' },
        { name: 'Stabex Kenya Ltd' },
      ],
    },
    select: { id: true },
  });
  const keClient = existingKeWorkspace
    ? await prisma.outsourcingClient.update({
        where: { id: existingKeWorkspace.id },
        data: {
          name: 'Stabex Kenya Ltd',
          entityCode: 'ke',
          contactName: 'Diana Namutebi',
          contactEmail: 'hr.ke@stabexintl.com',
          contactPhone: '+254 709 000000',
          postalAddress: 'Nairobi — retail, depot, fleet',
          county: 'Kenya',
          employeeNumberPrefix: 'STB-KE',
          payrollFrequency: DEMO_WORKSPACE.payrollFrequency,
          leavePayMode: DEMO_WORKSPACE.leavePayMode,
          currency: 'KES',
        },
      })
    : await prisma.outsourcingClient.create({
        data: {
          name: 'Stabex Kenya Ltd',
          entityCode: 'ke',
          contactName: 'Diana Namutebi',
          contactEmail: 'hr.ke@stabexintl.com',
          contactPhone: '+254 709 000000',
          postalAddress: 'Nairobi — retail, depot, fleet',
          county: 'Kenya',
          employeeNumberPrefix: 'STB-KE',
          payrollFrequency: DEMO_WORKSPACE.payrollFrequency,
          leavePayMode: DEMO_WORKSPACE.leavePayMode,
          currency: 'KES',
        },
      });

  let ugClient = await prisma.outsourcingClient.findFirst({ where: { entityCode: 'ug' } });
  if (!ugClient) {
    ugClient = await prisma.outsourcingClient.create({
      data: {
        name: 'Stabex Uganda Ltd',
        entityCode: 'ug',
        contactName: 'Diana Namutebi',
        contactEmail: 'hr.ug@stabexintl.com',
        contactPhone: '+256 414 000000',
        postalAddress: 'Kampala — retail, depot, LPG',
        county: 'Uganda',
        employeeNumberPrefix: 'STB-UG',
        payrollFrequency: DEMO_WORKSPACE.payrollFrequency,
        leavePayMode: DEMO_WORKSPACE.leavePayMode,
        currency: 'UGX',
      },
    });
  }

  await prisma.outsourcingClient.deleteMany({
    where: {
      id: { notIn: [keClient.id, ugClient.id] },
      employees: { none: {} },
      entityCode: null,
    },
  });

  await prisma.employee.deleteMany({
    where: { outsourcingClientId: { in: [keClient.id, ugClient.id] } },
  });
  await prisma.department.deleteMany({
    where: { outsourcingClientId: { in: [keClient.id, ugClient.id] } },
  });

  if (hasModel('publicHoliday')) {
    for (const holiday of kenyanHolidays) {
      const existing = await prismaAny.publicHoliday.findFirst({
        where: holiday.recurring
          ? {
              name: holiday.name,
              recurring: true,
              recurMonth: holiday.recurMonth,
              recurDay: holiday.recurDay,
            }
          : { name: holiday.name, date: new Date(`${holiday.date}T00:00:00.000Z`) },
        select: { id: true },
      });
      if (existing) {
        await prismaAny.publicHoliday.update({
          where: { id: existing.id },
          data: {
            recurring: holiday.recurring,
            date: holiday.recurring ? null : new Date(`${holiday.date}T00:00:00.000Z`),
            recurMonth: holiday.recurring ? holiday.recurMonth : null,
            recurDay: holiday.recurring ? holiday.recurDay : null,
            isActive: true,
          },
        });
      } else {
        await prismaAny.publicHoliday.create({
          data: {
            name: holiday.name,
            recurring: holiday.recurring,
            date: holiday.recurring ? null : new Date(`${holiday.date}T00:00:00.000Z`),
            recurMonth: holiday.recurring ? holiday.recurMonth : null,
            recurDay: holiday.recurring ? holiday.recurDay : null,
            isActive: true,
          },
        });
      }
    }
  }

  await seedStabexRecruitmentJobs(now);
  await seedStabexRecruitmentApplicationsAndInterviews();

  const deptByClientId = new Map<string, Map<string, string>>();
  for (const client of [keClient, ugClient]) {
    const deptByName = new Map<string, string>();
    for (const name of departments) {
      const existing = await prisma.department.findFirst({
        where: { outsourcingClientId: client.id, name },
        select: { id: true },
      });
      if (existing) {
        deptByName.set(name, existing.id);
      } else {
        const created = await prisma.department.create({
          data: { outsourcingClientId: client.id, name },
          select: { id: true },
        });
        deptByName.set(name, created.id);
      }
    }
    deptByClientId.set(client.id, deptByName);
  }

  const employeeByEmail = new Map<string, Awaited<ReturnType<typeof prisma.employee.upsert>>>();
  for (const emp of employeesSeed) {
    const isUganda = emp.employeeNumber.startsWith('STB-UG');
    const clientId = isUganda ? ugClient.id : keClient.id;
    const deptMap = deptByClientId.get(clientId)!;
    const employee = await prisma.employee.upsert({
      where: { idNumber: emp.idNumber },
      update: {
        outsourcingClientId: clientId,
        departmentId: deptMap.get(emp.department) ?? null,
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
        outsourcingClientId: clientId,
        departmentId: deptMap.get(emp.department) ?? null,
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
    {
      email: 'moses.okello@stabexintl.com',
      category: 'regulatory_compliance' as CredentialCategory,
      name: 'Fuel Handling Licence',
      number: 'PPDA-UG-MO-001',
      authority: 'PPDA Uganda',
      issue: d(2023, 4, 1),
      expiry: d(2026, 8, 1),
      status: 'active' as CredentialStatus,
    },
    {
      email: 'moses.okello@stabexintl.com',
      category: 'training' as CredentialCategory,
      name: 'Fire Safety Certificate',
      number: 'UFB-MO-002',
      authority: 'Uganda Fire Brigade',
      issue: d(2024, 1, 10),
      expiry: daysFromToday(10),
      status: 'expiring_soon' as CredentialStatus,
    },
    {
      email: 'grace.nakato@stabexintl.com',
      category: 'regulatory_compliance' as CredentialCategory,
      name: 'Fuel Handling Licence',
      number: 'PPDA-UG-GN-001',
      authority: 'PPDA Uganda',
      issue: d(2022, 8, 1),
      expiry: d(2026, 2, 10),
      status: 'active' as CredentialStatus,
    },
    {
      email: 'grace.nakato@stabexintl.com',
      category: 'life_support' as CredentialCategory,
      name: 'First Aid Certificate',
      number: 'URC-GN-002',
      authority: 'Uganda Red Cross',
      issue: d(2024, 5, 1),
      expiry: daysFromToday(12),
      status: 'expiring_soon' as CredentialStatus,
    },
    {
      email: 'robert.ssem@stabexintl.com',
      category: 'regulatory_compliance' as CredentialCategory,
      name: 'Fuel Handling Licence',
      number: 'PPDA-UG-RS-001',
      authority: 'PPDA Uganda',
      issue: d(2022, 6, 1),
      expiry: daysFromToday(-28),
      status: 'expired' as CredentialStatus,
    },
    {
      email: 'harriet.amanya@stabexintl.com',
      category: 'regulatory_compliance' as CredentialCategory,
      name: 'LPG Handling Certification',
      number: 'MEMD-HA-001',
      authority: 'MEMD Uganda',
      issue: d(2023, 2, 1),
      expiry: d(2026, 1, 15),
      status: 'active' as CredentialStatus,
    },
    {
      email: 'harriet.amanya@stabexintl.com',
      category: 'training' as CredentialCategory,
      name: 'Fire Safety Certificate',
      number: 'UFB-HA-002',
      authority: 'Uganda Fire Brigade',
      issue: d(2024, 3, 15),
      expiry: d(2026, 7, 1),
      status: 'active' as CredentialStatus,
    },
    {
      email: 'paul.mugisha@stabexintl.com',
      category: 'regulatory_compliance' as CredentialCategory,
      name: 'Fuel Handling Licence',
      number: 'PPDA-UG-PM-001',
      authority: 'PPDA Uganda',
      issue: d(2021, 1, 10),
      expiry: d(2026, 5, 20),
      status: 'active' as CredentialStatus,
    },
    {
      email: 'paul.mugisha@stabexintl.com',
      category: 'oil_gas_operations' as CredentialCategory,
      name: 'Dangerous Goods Transport Certificate',
      number: 'UNRA-PM-002',
      authority: 'UNRA',
      issue: d(2023, 9, 1),
      expiry: daysFromToday(16),
      status: 'expiring_soon' as CredentialStatus,
    },
    {
      email: 'brian.otieno@stabexintl.com',
      category: 'regulatory_compliance' as CredentialCategory,
      name: 'Fuel Handling Licence',
      number: 'ERC-KE-BO-001',
      authority: 'ERC Kenya',
      issue: d(2023, 5, 1),
      expiry: d(2026, 10, 15),
      status: 'active' as CredentialStatus,
    },
    {
      email: 'aisha.wanjiru@stabexintl.com',
      category: 'regulatory_compliance' as CredentialCategory,
      name: 'Fuel Handling Licence',
      number: 'ERC-KE-AW-001',
      authority: 'ERC Kenya',
      issue: d(2022, 10, 1),
      expiry: d(2026, 3, 1),
      status: 'active' as CredentialStatus,
    },
    {
      email: 'aisha.wanjiru@stabexintl.com',
      category: 'training' as CredentialCategory,
      name: 'Fire Safety Certificate',
      number: 'KFB-AW-002',
      authority: 'Kenya Fire Brigade',
      issue: d(2024, 2, 1),
      expiry: daysFromToday(9),
      status: 'expiring_soon' as CredentialStatus,
    },
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
    { name: 'Peak retail', startMinutes: 7 * 60, endMinutes: 19 * 60, breakMinutes: 45, color: '#7c3aed' },
    { name: 'Depot extended', startMinutes: 6 * 60, endMinutes: 22 * 60, breakMinutes: 60, color: '#a16207' },
    { name: 'Admin day', startMinutes: 8 * 60, endMinutes: 17 * 60, breakMinutes: 60, color: '#059669' },
    { name: 'Station on-call', startMinutes: 8 * 60, endMinutes: 8 * 60, breakMinutes: 120, color: '#dc2626' },
  ];

  const templateIdByClientAndName = new Map<string, string>();
  for (const client of [keClient, ugClient]) {
    for (const t of shiftTemplateDefs) {
      const mapKey = `${client.id}:${t.name}`;
      const existing = await prisma.shiftTemplate.findFirst({
        where: { outsourcingClientId: client.id, name: t.name },
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
        templateIdByClientAndName.set(mapKey, existing.id);
      } else {
        const created = await prisma.shiftTemplate.create({
          data: { outsourcingClientId: client.id, ...t, isActive: true },
        });
        templateIdByClientAndName.set(mapKey, created.id);
      }
    }
  }

  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  const rotaIdByClientId = new Map<string, string>();
  for (const client of [keClient, ugClient]) {
    let rota = await prisma.rotaPeriod.findFirst({
      where: {
        outsourcingClientId: client.id,
        startDate: monthStart,
        endDate: monthEnd,
      },
    });
    if (!rota) {
      rota = await prisma.rotaPeriod.create({
        data: {
          outsourcingClientId: client.id,
          name: `${now.toLocaleString('en-GB', { month: 'long' })} ${now.getUTCFullYear()} Rota`,
          startDate: monthStart,
          endDate: monthEnd,
          status: 'published',
        },
      });
    } else if (rota.status !== 'published') {
      rota = await prisma.rotaPeriod.update({ where: { id: rota.id }, data: { status: 'published' } });
    }
    rotaIdByClientId.set(client.id, rota.id);
  }

  const roleEmails = {
    brian: 'brian.otieno@stabexintl.com',
    grace: 'grace.nakato@stabexintl.com',
    aisha: 'aisha.wanjiru@stabexintl.com',
    robert: 'robert.ssem@stabexintl.com',
    james: 'james.mwangi@stabexintl.com',
    paul: 'paul.mugisha@stabexintl.com',
    moses: 'moses.okello@stabexintl.com',
    harriet: 'harriet.amanya@stabexintl.com',
    kevin: 'kevin.kamau@stabexintl.com',
    diana: 'diana.namutebi@stabexintl.com',
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
      assignmentsSeed.push({ email: roleEmails.robert, date: day, template: i % 2 === 0 ? 'Night shift' : 'Day shift' });
      assignmentsSeed.push({ email: roleEmails.aisha, date: day, template: i % 2 === 0 ? 'Day shift' : 'Night shift' });
      assignmentsSeed.push({ email: roleEmails.moses, date: day, template: i % 3 === 0 ? 'Depot extended' : 'Peak retail' });
      assignmentsSeed.push({ email: roleEmails.paul, date: day, template: i % 4 === 0 ? 'Depot extended' : 'Peak retail' });
      assignmentsSeed.push({ email: roleEmails.harriet, date: day, template: 'Day shift' });
      assignmentsSeed.push({ email: roleEmails.kevin, date: day, template: isWeekday ? 'Admin day' : 'Day shift' });
      assignmentsSeed.push({ email: roleEmails.diana, date: day, template: isWeekday ? 'Admin day' : 'Day shift' });
      assignmentsSeed.push({ email: roleEmails.james, date: day, template: isWeekday ? 'Admin day' : 'Day shift' });
    }
    if (ymd === `${marchYear}-03-24`) {
      // no-op marker for static demo date references
    }
  }

  for (const item of assignmentsSeed) {
    const employee = employeeByEmail.get(item.email);
    if (!employee) continue;
    const rotaId = rotaIdByClientId.get(employee.outsourcingClientId);
    if (!rotaId) continue;
    const tplKey = `${employee.outsourcingClientId}:${item.template}`;
    const templateId = templateIdByClientAndName.get(tplKey);
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
      where: { rotaPeriodId: rotaId, employeeId: employee.id, workDate: new Date(`${workYmd}T00:00:00.000Z`) },
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
          rotaPeriodId: rotaId,
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
    { email: roleEmails.brian, date: isoDate(daysFromToday(-2)), checkIn: '19:55', checkOut: '08:10', overtimeMinutes: 15, lateMinutes: 0, notes: 'Cross-midnight night shift — Nairobi West' },
    { email: roleEmails.paul, date: isoDate(daysFromToday(-3)), checkIn: '06:50', checkOut: '23:15', overtimeMinutes: 84, lateMinutes: 0, notes: 'Extended depot coverage — Jinja Road' },
    { email: roleEmails.grace, date: todayYmd, checkIn: '08:02', checkOut: null, overtimeMinutes: 0, lateMinutes: 2, notes: 'Missing clock-out for supervisor review' },
    { email: roleEmails.aisha, date: isoDate(daysFromToday(-1)), checkIn: '08:47', checkOut: '20:05', overtimeMinutes: 5, lateMinutes: 47, notes: 'Late arrival — Mombasa Road' },
    { email: roleEmails.robert, date: isoDate(daysFromToday(-4)), checkIn: '07:58', checkOut: '21:30', overtimeMinutes: 90, lateMinutes: 0, notes: 'Corrected clock-out after peak retail evening' },
    { email: roleEmails.harriet, date: isoDate(daysFromToday(-5)), checkIn: '07:55', checkOut: '20:04', overtimeMinutes: 4, lateMinutes: 0, notes: null },
    { email: roleEmails.moses, date: isoDate(daysFromToday(-6)), checkIn: '08:03', checkOut: '20:07', overtimeMinutes: 7, lateMinutes: 3, notes: null },
    { email: roleEmails.kevin, date: isoDate(daysFromToday(-7)), checkIn: '08:01', checkOut: '17:12', overtimeMinutes: 12, lateMinutes: 1, notes: null },
    { email: roleEmails.james, date: isoDate(daysFromToday(-8)), checkIn: '07:02', checkOut: '19:10', overtimeMinutes: 10, lateMinutes: 2, notes: null },
    { email: roleEmails.paul, date: isoDate(daysFromToday(-9)), checkIn: '06:58', checkOut: '23:02', overtimeMinutes: 62, lateMinutes: 0, notes: null },
    { email: roleEmails.brian, date: isoDate(daysFromToday(-10)), checkIn: '20:04', checkOut: '08:08', overtimeMinutes: 8, lateMinutes: 4, notes: null },
    { email: roleEmails.robert, date: isoDate(daysFromToday(-11)), checkIn: '20:07', checkOut: '08:00', overtimeMinutes: 0, lateMinutes: 7, notes: null },
    { email: roleEmails.grace, date: isoDate(daysFromToday(-12)), checkIn: '08:11', checkOut: '20:00', overtimeMinutes: 0, lateMinutes: 11, notes: null },
    { email: roleEmails.aisha, date: isoDate(daysFromToday(-13)), checkIn: '08:06', checkOut: '19:52', overtimeMinutes: 0, lateMinutes: 6, notes: null },
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
          outsourcingClientId: employee.outsourcingClientId,
          firstInAt: checkIn,
          lastOutAt: checkOut,
          minutesWorked: workedMinutes,
          lateMinutes: row.lateMinutes,
          overtimeMinutes: row.overtimeMinutes,
          holidayOvertimeMinutes: 0,
          publicHolidayName: null,
          status: checkOut ? AttendanceSummaryStatus.reconciled : AttendanceSummaryStatus.draft,
        },
        create: {
          employeeId: employee.id,
          outsourcingClientId: employee.outsourcingClientId,
          workDate,
          firstInAt: checkIn,
          lastOutAt: checkOut,
          minutesWorked: workedMinutes,
          lateMinutes: row.lateMinutes,
          overtimeMinutes: row.overtimeMinutes,
          holidayOvertimeMinutes: 0,
          publicHolidayName: null,
          status: checkOut ? AttendanceSummaryStatus.reconciled : AttendanceSummaryStatus.draft,
        },
      });
    }
  }

  const grace = employeeByEmail.get(roleEmails.grace);
  const aisha = employeeByEmail.get(roleEmails.aisha);
  if (grace && hasModel('attendanceException')) {
    await upsertAttendanceException({
      employeeId: grace.id,
      workDate: new Date(`${todayYmd}T00:00:00.000Z`),
      type: AttendanceExceptionType.missing_check_out,
      status: AttendanceExceptionStatus.open,
      description: 'No check-out event found for this shift/day window.',
    });
  }
  if (aisha && hasModel('attendanceException')) {
    await upsertAttendanceException({
      employeeId: aisha.id,
      workDate: new Date(`${isoDate(daysFromToday(-1))}T00:00:00.000Z`),
      type: AttendanceExceptionType.late_arrival,
      status: AttendanceExceptionStatus.open,
      description: 'Clock-in occurred 47 minutes after scheduled shift start.',
    });
  }

  if (hasModel('attendancePolicy') && hasModel('attendancePolicyAssignment')) {
    for (const client of [keClient, ugClient]) {
      const policy = await prismaAny.attendancePolicy.upsert({
        where: { id: `default-attendance-${client.id}` },
        update: {
          outsourcingClientId: client.id,
          name: 'Default attendance policy',
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
          id: `default-attendance-${client.id}`,
          outsourcingClientId: client.id,
          name: 'Default attendance policy',
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
        if (employee.outsourcingClientId !== client.id) continue;
        await prismaAny.attendancePolicyAssignment.upsert({
          where: { id: `${employee.id}-${policy.id}` },
          update: { effectiveFrom: d(2026, 1, 1), effectiveTo: null, isPrimary: true },
          create: {
            id: `${employee.id}-${policy.id}`,
            employeeId: employee.id,
            attendancePolicyId: policy.id,
            effectiveFrom: d(2026, 1, 1),
            effectiveTo: null,
            isPrimary: true,
          },
        });
      }
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

  const leavePolicyByClientId = new Map<string, string>();
  if (prismaAny.leavePolicy) {
    for (const client of [keClient, ugClient]) {
      const leavePolicy = await prismaAny.leavePolicy.upsert({
        where: { id: `default-leave-${client.id}` },
        update: {
          outsourcingClientId: client.id,
          name: 'Standard Leave Policy',
          description: 'Default leave policy for demo data data.',
          isDefault: true,
          isActive: true,
        },
        create: {
          id: `default-leave-${client.id}`,
          outsourcingClientId: client.id,
          name: 'Standard Leave Policy',
          description: 'Default leave policy for demo data data.',
          isDefault: true,
          isActive: true,
        },
      });
      leavePolicyByClientId.set(client.id, leavePolicy.id);

      if (prismaAny.leavePolicyRule) {
        for (const lt of leaveTypeDefs) {
          const leaveTypeId = leaveTypeByName.get(lt.name)!;
          await prismaAny.leavePolicyRule.upsert({
            where: { leavePolicyId_leaveTypeId: { leavePolicyId: leavePolicy.id, leaveTypeId } },
            update: {
              accrualMode: lt.daysPerYear > 0 ? LeaveAccrualMode.monthly_accrual : LeaveAccrualMode.annual_grant,
              annualEntitlement: lt.daysPerYear,
              monthlyAccrualDays: new Prisma.Decimal(lt.daysPerYear > 0 ? (lt.daysPerYear / 12).toFixed(2) : '0'),
              maxCarryForwardDays: lt.name === 'Annual Leave' ? 10 : 0,
              requiresApproval: !lt.name.includes('Unpaid'),
              active: true,
            },
            create: {
              leavePolicyId: leavePolicy.id,
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
    const leavePolicyIdForEmployee = leavePolicyByClientId.get(employee.outsourcingClientId);
    if (leavePolicyIdForEmployee && prismaAny.leavePolicyAssignment) {
      await prismaAny.leavePolicyAssignment.upsert({
        where: { id: `${employee.id}-${leavePolicyIdForEmployee}` },
        update: { effectiveFrom: d(2026, 1, 1), effectiveTo: null },
        create: {
          id: `${employee.id}-${leavePolicyIdForEmployee}`,
          employeeId: employee.id,
          leavePolicyId: leavePolicyIdForEmployee,
          effectiveFrom: d(2026, 1, 1),
          effectiveTo: null,
        },
      });
    }
  }

  const kevin = employeeByEmail.get(roleEmails.kevin)!;
  const brian = employeeByEmail.get(roleEmails.brian)!;
  const aishaLeave = employeeByEmail.get(roleEmails.aisha)!;
  const annualLeaveType = annualTypeId;
  const sickLeaveType = sickTypeId;

  await upsertLeaveApplication(kevin.id, annualLeaveType, daysFromToday(0), daysFromToday(4), LeaveStatus.approved, 'Annual leave approved');
  await upsertLeaveApplication(brian.id, sickLeaveType, daysFromToday(-1), daysFromToday(2), LeaveStatus.approved, 'Sick leave — medical certificate on file');
  await upsertLeaveApplication(aishaLeave.id, annualLeaveType, daysFromToday(7), daysFromToday(11), LeaveStatus.pending, 'Pending annual leave request');

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
  const demoAdmin = 'demo@stabexintl.com';
  await prisma.user.upsert({
    where: { email: demoAdmin },
    update: { name: 'System Administrator', passwordHash: hashed, role: UserRole.admin, staffUserType: StaffUserType.director, isActive: true },
    create: { email: demoAdmin, name: 'System Administrator', passwordHash: hashed, role: UserRole.admin, staffUserType: StaffUserType.director, isActive: true },
  });
  await prisma.user.upsert({
    where: { email: roleEmails.diana },
    update: { name: 'Diana Namutebi', passwordHash: hashed, role: UserRole.staff, staffUserType: StaffUserType.business_manager, isActive: true },
    create: { email: roleEmails.diana, name: 'Diana Namutebi', passwordHash: hashed, role: UserRole.staff, staffUserType: StaffUserType.business_manager, isActive: true },
  });
  await prisma.user.upsert({
    where: { email: roleEmails.james },
    update: { name: 'James Mwangi', passwordHash: hashed, role: UserRole.staff, staffUserType: StaffUserType.finance, isActive: true },
    create: { email: roleEmails.james, name: 'James Mwangi', passwordHash: hashed, role: UserRole.staff, staffUserType: StaffUserType.finance, isActive: true },
  });
  const seededUsers = await prisma.user.findMany({
    where: { email: { in: [demoAdmin, roleEmails.diana, roleEmails.james] } },
    select: { id: true, email: true, name: true },
  });
  const userByEmail = new Map(seededUsers.map((u) => [u.email.toLowerCase(), u]));
  const paul = employeeByEmail.get(roleEmails.paul);
  const robert = employeeByEmail.get(roleEmails.robert);
  const moses = employeeByEmail.get(roleEmails.moses);
  await prisma.auditEvent.createMany({
    data: [
      {
        actorUserId: userByEmail.get(roleEmails.diana)?.id ?? null,
        actorEmail: roleEmails.diana,
        action: 'employee.salary.view',
        entityType: 'Employee',
        entityId: paul?.id ?? null,
        route: 'GET /api/outsourcing/employees/[id]',
        metadata: { message: 'Diana Namutebi viewed employee salary: Paul Mugisha (Depot Supervisor)' },
        createdAt: new Date(Date.UTC(currentYear, 3, 26, 7, 30, 0)),
      },
      {
        actorUserId: userByEmail.get(roleEmails.james)?.id ?? null,
        actorEmail: roleEmails.james,
        action: 'payroll.run.approve',
        entityType: 'PayrollBatch',
        entityId: `${marchYear}-03`,
        route: 'POST /api/outsourcing/payroll/generate',
        metadata: { message: `James Mwangi approved payroll run March ${marchYear}` },
        createdAt: new Date(Date.UTC(currentYear, 3, 1, 11, 15, 0)),
      },
      {
        actorUserId: userByEmail.get(roleEmails.diana)?.id ?? null,
        actorEmail: roleEmails.diana,
        action: 'attendance.correction',
        entityType: 'Attendance',
        entityId: robert?.id ?? null,
        route: 'POST /api/outsourcing/attendance',
        metadata: { message: 'Diana Namutebi corrected attendance: Robert Ssemwogerere clock-out 20:00 -> 21:30' },
        createdAt: new Date(Date.UTC(currentYear, 3, 23, 18, 0, 0)),
      },
      {
        actorUserId: userByEmail.get(demoAdmin)?.id ?? null,
        actorEmail: demoAdmin,
        action: 'employee.create',
        entityType: 'Employee',
        entityId: moses?.id ?? null,
        route: 'POST /api/outsourcing/employees',
        metadata: { message: `${demoAdmin} created employee: Moses Okello` },
        createdAt: new Date(Date.UTC(currentYear, 3, 15, 8, 0, 0)),
      },
      {
        actorUserId: userByEmail.get(roleEmails.diana)?.id ?? null,
        actorEmail: roleEmails.diana,
        action: 'leave.approval',
        entityType: 'LeaveApplication',
        entityId: kevin?.id ?? null,
        route: 'PATCH /api/staff/leave/applications/[id]',
        metadata: { message: 'Diana Namutebi approved leave: Kevin Kamau annual leave' },
        createdAt: new Date(Date.UTC(currentYear, 3, 25, 12, 30, 0)),
      },
    ],
  });

  if (moses) {
    await prisma.essPortalUser.upsert({
      where: { email: 'moses.okello@stabexintl.com' },
      update: {
        passwordHash: hashed,
        name: 'Moses Okello',
        employeeId: moses.id,
        role: EssPortalRole.employee,
        isActive: true,
        mustResetPassword: false,
      },
      create: {
        email: 'moses.okello@stabexintl.com',
        name: 'Moses Okello',
        passwordHash: hashed,
        employeeId: moses.id,
        role: EssPortalRole.employee,
        isActive: true,
        mustResetPassword: false,
      },
    });
  }

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

  console.log(`Seed complete: Stabex Kenya Ltd + Stabex Uganda Ltd (entity switcher)`);
  console.log(
    `Careers board: ${STABEX_CAREERS_JOBS.length} roles at ${STABEX_RECRUITMENT_EMPLOYER}; demo candidates + interviews + talent pool seeded (pipeline.demo.stabexintl.com emails)`,
  );
  console.log(`Employees: ${employeesSeed.length} (Stabex International — retail, depot, LPG, fleet, HR, finance)`);
  console.log(`Credentials: ${credentialsSeed.length} seeded (licences & safety certs; includes expiring-soon and expired samples)`);
  console.log(`Rota: published for ${monthStart.toISOString().slice(0, 10)} to ${monthEnd.toISOString().slice(0, 10)}`);
  console.log(`Attendance: ${attendanceRows.length} summary rows seeded for last 14 days`);
  console.log(`Payroll: March ${marchYear} approved, April ${aprilYear} draft`);
  console.log(`Users: demo admin (${demoAdmin}) + HR (${roleEmails.diana}) + finance (${roleEmails.james}) — password Demo@2026!`);
  console.log(`ESS portal: moses.okello@stabexintl.com — same password (linked to employee record)`);
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
