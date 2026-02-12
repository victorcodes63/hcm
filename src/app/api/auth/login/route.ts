import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getStaffSessionMaxAgeSeconds } from '@/lib/auth-session';
import { reportApiError } from '@/lib/monitoring';

const STAFF_SESSION_COOKIE = 'staff_session';
const COOKIE_MAX_AGE = getStaffSessionMaxAgeSeconds();
const ALLOWED_DOMAIN = (process.env.STAFF_ALLOWED_DOMAIN || 'eaglehr.co.ke').toLowerCase();

// Dev-only fallback when STAFF_PASSWORD is not set (never used in production)
const DEV_FALLBACK_PASSWORD = 'eaglehr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedPassword = typeof password === 'string' ? password : '';

    const staffPassword = process.env.STAFF_PASSWORD;
    const staffEmail = process.env.STAFF_EMAIL; // optional: legacy restriction to one email
    const isProduction = process.env.NODE_ENV === 'production';

    if (!normalizedEmail || !normalizedPassword) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (!normalizedEmail.endsWith(`@${ALLOWED_DOMAIN}`)) {
      return NextResponse.json(
        { error: `Use your @${ALLOWED_DOMAIN} email to sign in.` },
        { status: 401 }
      );
    }

    if (staffEmail && normalizedEmail !== staffEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'This email is not authorized for dashboard access.' },
        { status: 401 }
      );
    }

    // Primary path: enforce allowlist from User table.
    if (process.env.DATABASE_URL) {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (!user) {
        return NextResponse.json(
          { error: 'No staff account found for this email. Ask an admin to add you.' },
          { status: 401 }
        );
      }
      if (!user.isActive) {
        return NextResponse.json(
          { error: 'Your account is inactive. Contact an administrator.' },
          { status: 403 }
        );
      }
      const passwordOk = await bcrypt.compare(normalizedPassword, user.passwordHash);
      if (!passwordOk) {
        return NextResponse.json(
          { error: 'Incorrect password. Please try again.' },
          { status: 401 }
        );
      }

      const response = NextResponse.json({ success: true });
      response.cookies.set(STAFF_SESSION_COOKIE, `local:${user.id}:${user.role}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });
      return response;
    }

    // Dev fallback when DB is unavailable.
    const effectivePassword = staffPassword || (isProduction ? '' : DEV_FALLBACK_PASSWORD);
    if (isProduction && !effectivePassword) {
      console.error('Staff login is not configured: DATABASE_URL and STAFF_PASSWORD missing.');
      return NextResponse.json(
        { error: 'Staff login is not configured.' },
        { status: 500 }
      );
    }
    if (!effectivePassword || normalizedPassword !== effectivePassword) {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(STAFF_SESSION_COOKIE, `legacy:${normalizedEmail}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    return response;
  } catch (error) {
    await reportApiError({
      route: 'POST /api/auth/login',
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Unable to sign in right now. Please try again.' },
      { status: 500 }
    );
  }
}
