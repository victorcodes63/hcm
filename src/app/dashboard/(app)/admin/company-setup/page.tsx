import { Building2 } from 'lucide-react';
import { CompanySetupPageClient } from './CompanySetupPageClient';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';

export default function CompanySetupPage() {
 return (
 <DashboardPage>
 <DashboardPageHeader
 icon={Building2}
 title="Company setup"
 description="Branding, login experience, careers page, and dashboard defaults for this deployment. Changes apply immediately after you save — no redeploy required."
 />

 <CompanySetupPageClient />
 </DashboardPage>
 );
}
