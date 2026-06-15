import { buildVerticalPackFromGeneric } from '../build-from-generic';

export const hospitalHealthcarePack = buildVerticalPackFromGeneric({
  id: 'hospital-healthcare',
  label: 'Hospital & healthcare demo',
  orgName: 'Amani Medical Centre',
  emailDomain: 'amani.demo.imara.co.ke',
  prefix: 'AMC',
  tagline: 'Clinical rota, credentials, and payroll for hospitals and healthcare providers.',
  publicFooterText:
    'Amani Medical Centre runs on Imara — shift scheduling, licence tracking, and NHIF-ready payroll for healthcare teams.',
  departments: [
    'Clinical Services',
    'Nursing',
    'Pharmacy',
    'Laboratory',
    'Administration',
    'HR & Payroll',
  ],
  departmentMap: {
    Operations: 'Clinical Services',
    Sales: 'Administration',
    Logistics: 'Pharmacy',
    Finance: 'HR & Payroll',
    'Human Resources': 'HR & Payroll',
    ICT: 'Administration',
  },
  postalAddress: 'Ngong Road, Nairobi — 120-bed facility',
});
