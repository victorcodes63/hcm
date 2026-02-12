import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { parseStaffSession } from '@/lib/auth-session';
import type { UserSummary, UserRole } from '@/types/dashboard';

const ROUNDS = 10;
const ROLES: UserRole[] = ['admin', 'staff', 'viewer'];

function toSummary(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): UserSummary {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const rawSession = request.cookies.get('staff_session')?.value;
  if (!rawSession) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const parsed = parseStaffSession(rawSession);
  if (!process.env.DATABASE_URL) {
    if (parsed.role === 'admin') return null;
    return NextResponse.json({ error: 'Only admins can manage staff and roles.' }, { status: 403 });
  }

  let currentUser = null as Awaited<ReturnType<typeof prisma.user.findUnique>> | null;
  if (parsed.userId) {
    currentUser = await prisma.user.findUnique({ where: { id: parsed.userId } });
  }
  if (!currentUser && parsed.email) {
    currentUser = await prisma.user.findUnique({ where: { email: parsed.email.toLowerCase() } });
  }

  if (!currentUser) {
    return NextResponse.json({ error: 'No staff account found for this session.' }, { status: 401 });
  }
  if (!currentUser.isActive) {
    return NextResponse.json({ error: 'Your account is inactive. Contact an administrator.' }, { status: 403 });
  }
  if (currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can manage staff and roles.' }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const adminError = await requireAdmin(request);
  if (adminError) return adminError;

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json([]);
    }
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users.map(toSummary));
  } catch (e) {
    console.error('GET /api/users error:', e);
    return NextResponse.json({ error: 'Failed to load users.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminError = await requireAdmin(request);
  if (adminError) return adminError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const password = typeof b.password === 'string' ? b.password : '';
  const role = (typeof b.role === 'string' ? b.role : 'staff') as UserRole;

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }
  if (!ROLES.includes(role)) {
    return NextResponse.json({ error: 'Role must be admin, staff, or viewer.' }, { status: 400 });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, ROUNDS);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, role },
    });
    return NextResponse.json(toSummary(user));
  } catch (e) {
    console.error('POST /api/users error:', e);
    return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
  }
}
