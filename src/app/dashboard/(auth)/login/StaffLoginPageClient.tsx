'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePublicBrand } from '@/components/BrandProvider';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getMetadataTitle } from '@/lib/brand';
import { DemoLoginCredentialsHint } from '@/components/DemoLoginCredentialsHint';
import { OAuthEmailDivider, OAuthProviderButtons } from '@/components/auth/OAuthProviderButtons';
import { LoginCard, LoginPageShell } from '@/components/auth/LoginPageShell';
import type { LoginPublicConfig } from '@/lib/login-public-config';

const STAFF_LOGIN_PATH = '/api/auth/login';

type StaffWelcomeCopy = {
 welcomeTitle: string;
 welcomeSubtitle: string;
 emailLoginEnabled: boolean;
};

type StaffLoginContentProps = {
 loginConfig: LoginPublicConfig;
 initialError: string;
 welcomeCopy: StaffWelcomeCopy;
};

export function StaffLoginContent({ loginConfig, initialError, welcomeCopy }: StaffLoginContentProps) {
 const { orgName, contactAddress, privacyPolicyUrl, termsUrl, defaultLandingPath } = usePublicBrand();
 const router = useRouter();
 const demoAdminEmail = loginConfig.showDemoHint ? loginConfig.staffDemoRows[0]?.email ?? '' : '';
 const demoPasswordValue = loginConfig.showDemoHint ? loginConfig.demoPassword : '';
 const [email, setEmail] = useState(demoAdminEmail);
 const [password, setPassword] = useState(demoPasswordValue);
 const [showPassword, setShowPassword] = useState(false);
 const [error, setError] = useState(initialError);
 const [loading, setLoading] = useState(false);
 const [mfaCode, setMfaCode] = useState('');
 const [mfaChallenge, setMfaChallenge] = useState('');
 const [showOAuth, setShowOAuth] = useState(false);
 const emailLoginEnabled = welcomeCopy.emailLoginEnabled;
 const [rememberMe, setRememberMe] = useState(true);

 useEffect(() => {
 document.title = getMetadataTitle('Login');
 }, []);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError('');
 setLoading(true);
 try {
 const res = await fetch(STAFF_LOGIN_PATH, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email, password }),
 });
 const data = await res.json().catch(() => ({}));
 if (!res.ok) {
 setError(data.error || 'Invalid email or password.');
 setLoading(false);
 return;
 }
 if (data?.mfaRequired && typeof data?.challenge === 'string') {
 setMfaChallenge(data.challenge);
 setError('');
 setLoading(false);
 return;
 }
 router.push(defaultLandingPath || '/dashboard');
 router.refresh();
 } catch {
 setError('Something went wrong. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 const handleMfaSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError('');
 setLoading(true);
 try {
 const res = await fetch('/api/auth/mfa/verify-login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ challenge: mfaChallenge, code: mfaCode }),
 });
 const data = await res.json().catch(() => ({}));
 if (!res.ok) {
 setError(data.error || 'Invalid MFA code.');
 return;
 }
 router.push(defaultLandingPath || '/dashboard');
 router.refresh();
 } catch {
 setError('Unable to verify MFA code. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <LoginPageShell
 audience="staff"
 welcomeTitle={welcomeCopy.welcomeTitle}
 welcomeSubtitle={welcomeCopy.welcomeSubtitle}
 footer={
 <footer className="border-t border-[#e3e8ee] bg-white px-5 py-4 text-center lg:hidden">
 <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#6b7f99]">
 <Link href="/careers" className="hover:text-[#0a2540]">Careers</Link>
 <Link href={privacyPolicyUrl || '/privacy'} className="hover:text-[#0a2540]">Privacy</Link>
 <Link href={termsUrl || '/terms'} className="hover:text-[#0a2540]">Terms</Link>
 </nav>
 <p className="mx-auto mt-2 max-w-xs text-pretty text-xs leading-relaxed text-[#6b7f99]" suppressHydrationWarning>
 © {new Date().getFullYear()} {orgName}
 {contactAddress ? ` · ${contactAddress}` : ''}
 </p>
 </footer>
 }
 >
 <LoginCard
 footer={
 <p className="text-center text-[0.8125rem] text-[#6b7f99]">
 Employee?{' '}
 <Link href="/ess/login" className="font-medium text-[#635bff] hover:text-[#4b45c6]">
 Sign in to employee portal
 </Link>
 </p>
 }
 >
 <h2 className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-[#0a2540]">
 Sign in to your account
 </h2>

 {error && (
 <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[0.8125rem] leading-snug text-red-700">
 <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
 <span>{error}</span>
 </div>
 )}

 {emailLoginEnabled ? (
 <form
 onSubmit={mfaChallenge ? handleMfaSubmit : handleSubmit}
 className={`space-y-4 ${error ? 'mt-4' : 'mt-6'}`}
 >
 <div>
 <label htmlFor="email" className="mb-1.5 block text-[0.8125rem] font-medium text-[#0a2540]">
 Email
 </label>
 <input
 id="email"
 type="email"
 autoComplete="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 className="h-10 w-full rounded-md border border-[#d5dae1] bg-white px-3 text-sm text-[#0a2540] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#9ca8b7] hover:border-[#b4bcc6] focus:border-[#635bff] focus:outline-none focus:ring-2 focus:ring-[#635bff]/12"
 placeholder={loginConfig.emailPlaceholder}
 />
 </div>

 {!mfaChallenge ? (
 <div>
 <div className="mb-1.5 flex items-center justify-between">
 <label htmlFor="password" className="text-[0.8125rem] font-medium text-[#0a2540]">
 Password
 </label>
 <Link
 href="/dashboard/forgot-password"
 className="text-[0.8125rem] font-medium text-[#635bff] hover:text-[#4b45c6]"
 >
 Forgot?
 </Link>
 </div>
 <div className="relative">
 <input
 id="password"
 type={showPassword ? 'text' : 'password'}
 autoComplete="current-password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 className="h-10 w-full rounded-md border border-[#d5dae1] bg-white px-3 pr-9 text-sm text-[#0a2540] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#9ca8b7] hover:border-[#b4bcc6] focus:border-[#635bff] focus:outline-none focus:ring-2 focus:ring-[#635bff]/12"
 placeholder="••••••••"
 />
 <button
 type="button"
 onClick={() => setShowPassword((s) => !s)}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#9ca8b7] transition-colors hover:text-[#425466]"
 aria-label={showPassword ? 'Hide password' : 'Show password'}
 >
 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
 </button>
 </div>
 </div>
 ) : (
 <div>
 <label htmlFor="mfaCode" className="mb-1.5 block text-[0.8125rem] font-medium text-[#0a2540]">
 Authentication code
 </label>
 <input
 id="mfaCode"
 type="text"
 inputMode="numeric"
 autoComplete="one-time-code"
 value={mfaCode}
 onChange={(e) => setMfaCode(e.target.value)}
 required
 className="h-10 w-full rounded-md border border-[#d5dae1] bg-white px-3 text-sm text-[#0a2540] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all placeholder:text-[#9ca8b7] hover:border-[#b4bcc6] focus:border-[#635bff] focus:outline-none focus:ring-2 focus:ring-[#635bff]/12"
 placeholder="123456"
 />
 </div>
 )}

 {!mfaChallenge && (
 <label className="flex cursor-pointer select-none items-center gap-2">
 <input
 type="checkbox"
 checked={rememberMe}
 onChange={(e) => setRememberMe(e.target.checked)}
 className="h-3.5 w-3.5 rounded border-[#d5dae1] text-[#635bff] focus:ring-2 focus:ring-[#635bff]/20 focus:ring-offset-0"
 />
 <span className="text-[0.8125rem] text-[#425466]">Remember me</span>
 </label>
 )}

 <button
 type="submit"
 disabled={loading}
 className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#635bff] text-sm font-semibold text-white transition-all hover:bg-[#4b45c6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635bff]/40 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
 style={{
 boxShadow: '0 0 0 1px rgba(99,91,255,0.5), 0 2px 5px rgba(99,91,255,0.2)',
 }}
 >
 {loading ? (
 <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
 ) : mfaChallenge ? (
 'Verify'
 ) : (
 'Sign in'
 )}
 </button>

 {loginConfig.showDemoHint ? (
 <DemoLoginCredentialsHint
 variant="staff"
 visible
 demoPassword={loginConfig.demoPassword}
 staffDemoRows={loginConfig.staffDemoRows}
 essDemoRow={loginConfig.essDemoRow}
 onSelectEmail={(selected) => {
 setEmail(selected);
 setPassword(loginConfig.demoPassword);
 setError('');
 }}
 />
 ) : null}
 </form>
 ) : null}

 <OAuthEmailDivider />

 <OAuthProviderButtons onError={setError} onVisibleChange={setShowOAuth} />
 </LoginCard>
 </LoginPageShell>
 );
}

export function StaffLoginWithSearchParams({
 loginConfig,
 welcomeCopy,
}: {
 loginConfig: LoginPublicConfig;
 welcomeCopy: StaffWelcomeCopy;
}) {
 const searchParams = useSearchParams();
 const oauthError = searchParams.get('error');
 let initialError = '';
 if (oauthError === 'domain') initialError = 'Use your organization-issued work account (Microsoft or Google) to sign in.';
 else if (oauthError === 'no_account') initialError = 'No active staff account exists for this email. Ask an admin to add you.';
 else if (oauthError === 'inactive') initialError = 'Your staff account is inactive. Contact an administrator.';
 else if (oauthError === 'oauth') initialError = 'Sign-in with Microsoft or Google failed. Please try again.';
 else if (oauthError === 'oauth_disabled') initialError = 'That sign-in method is disabled for this organisation.';
 return <StaffLoginContent loginConfig={loginConfig} initialError={initialError} welcomeCopy={welcomeCopy} />;
}
