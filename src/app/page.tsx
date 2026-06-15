import { redirect } from 'next/navigation';
import { isDemoMode, isPublicDemoMode } from '@/lib/deployment-config';
import { isModuleLicensed } from '@/lib/modules';

/** Public entry: demo lands on staff login; production ATS-first sites go to careers. */
export default function Home() {
  if (isDemoMode() || isPublicDemoMode()) {
    redirect('/dashboard/login');
  }
  if (isModuleLicensed('ats')) {
    redirect('/careers');
  }
  redirect('/dashboard/login');
}
