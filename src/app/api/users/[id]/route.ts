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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminError = await requireAdmin(request);
  if (adminError) return adminError;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'User id required' }, { status: 400 });

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(toSummary(user));
  } catch (e) {
    console.error('GET /api/users/[id] error:', e);
    return NextResponse.json({ error: 'Failed to load user.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminError = await requireAdmin(request);
  if (adminError) return adminError;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'User id required' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name = typeof b.name === 'string' ? b.name.trim() : undefined;
  const role = typeof b.role === 'string' ? (b.role as UserRole) : undefined;
  const isActive = typeof b.isActive === 'boolean' ? b.isActive : undefined;
  const password = typeof b.password === 'string' ? b.password : undefined;

  if (name === undefined && role === undefined && isActive === undefined && password === undefined) {
    return NextResponse.json({ error: 'Provide at least one field to update.' }, { status: 400 });
  }
  if (role !== undefined && !ROLES.includes(role)) {
    return NextResponse.json({ error: 'Role must be admin, staff, or viewer.' }, { status: 400 });
  }
  if (password !== undefined && password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
    }

    const data: { name?: string; role?: UserRole; isActive?: boolean; passwordHash?: string } = {};
    if (name !== undefined) data.name = name;
    if (role !== undefined) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;
    if (password !== undefined) data.passwordHash = await bcrypt.hash(password, ROUNDS);

    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return NextResponse.json(toSummary(user));
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === 'P2025') return NextResponse.json({ error: 'User not found' }, { status: 404 });
    console.error('PATCH /api/users/[id] error:', e);
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminError = await requireAdmin(request);
  if (adminError) return adminError;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'User id required' }, { status: 400 });

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === 'P2025') return NextResponse.json({ error: 'User not found' }, { status: 404 });
    console.error('DELETE /api/users/[id] error:', e);
    return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
  }
}
