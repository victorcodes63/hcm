import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STAFF_SESSION_COOKIE = 'staff_session';
const ESS_SESSION_COOKIE = 'ess_session';
const LOGIN_PATH = '/dashboard/login';
const FORGOT_PASSWORD_PATH = '/dashboard/forgot-password';
const ESS_LOGIN_PATH = '/ess/login';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/dashboard/outsourcing/payroll') {
    const u = new URL(request.url);
    u.pathname = '/dashboard/accounts/payroll';
    return NextResponse.redirect(u, 308);
  }
  if (pathname === '/dashboard/outsourcing/payroll/payslips') {
    const u = new URL(request.url);
    u.pathname = '/dashboard/accounts/payroll/payslips';
    return NextResponse.redirect(u, 308);
  }

  // Only protect dashboard routes; allow login and forgot-password
  const isAuthPage = pathname.startsWith(LOGIN_PATH) || pathname.startsWith(FORGOT_PASSWORD_PATH);
  if (pathname.startsWith('/dashboard') && !isAuthPage) {
    const session = request.cookies.get(STAFF_SESSION_COOKIE);
    if (!session?.value) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const isEssAuthPage = pathname.startsWith(ESS_LOGIN_PATH);
  if (pathname.startsWith('/ess') && !isEssAuthPage) {
    const session = request.cookies.get(ESS_SESSION_COOKIE);
    if (!session?.value) {
      const loginUrl = new URL(ESS_LOGIN_PATH, request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/ess', '/ess/:path*'],
};
