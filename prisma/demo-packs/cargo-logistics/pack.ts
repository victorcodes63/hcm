import { buildVerticalPackFromGeneric } from '../build-from-generic';

export const cargoLogisticsPack = buildVerticalPackFromGeneric({
  id: 'cargo-logistics',
  label: 'Cargo & logistics demo',
  orgName: 'SwiftFreight East Africa Ltd',
  emailDomain: 'swiftfreight.demo.imara.co.ke',
  prefix: 'SFE',
  tagline: 'Fleet, warehouse, and dispatch operations — payroll and compliance for logistics teams.',
  publicFooterText:
    'SwiftFreight East Africa Ltd runs on Imara — driver payroll, shift rota, and statutory compliance for cargo operations.',
  departments: [
    'Fleet & Drivers',
    'Warehouse',
    'Dispatch',
    'Customs & Clearing',
    'Finance',
    'HR & Administration',
  ],
  departmentMap: {
    Operations: 'Dispatch',
    Sales: 'Dispatch',
    Logistics: 'Warehouse',
    Finance: 'Finance',
    'Human Resources': 'HR & Administration',
    ICT: 'Dispatch',
  },
  postalAddress: 'Industrial Area, Nairobi — regional cargo hub',
});
