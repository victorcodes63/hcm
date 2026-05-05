import { NextRequest, NextResponse } from 'next/server';
import { parseStaffSession } from '@/lib/auth-session';
import { prisma } from '@/lib/prisma';

export type AdminActor = {
  userId: string | null;
  email: string | null;
  name: string | null;
};

export async function requireAdminActor(
  request: NextRequest,
): Promise<{ error: NextResponse | null; actor: AdminActor | null }> {
  const rawSession = request.cookies.get('staff_session')?.value;
  if (!rawSession) {
    return { error: NextResponse.json({ error: 'Not authenticated.' }, { status: 401 }), actor: null };
  }

  const parsed = parseStaffSession(rawSession);
  if (!process.env.DATABASE_URL) {
    if (parsed.role === 'admin') {
      return {
        error: null,
        actor: { userId: parsed.userId ?? null, email: parsed.email ?? null, name: 'Admin' },
      };
    }
    return { error: NextResponse.json({ error: 'Only admins can perform this action.' }, { status: 403 }), actor: null };
  }

  let currentUser = null as Awaited<ReturnType<typeof prisma.user.findUnique>> | null;
  if (parsed.userId) {
    currentUser = await prisma.user.findUnique({ where: { id: parsed.userId } });
  }
  if (!currentUser && parsed.email) {
    currentUser = await prisma.user.findUnique({ where: { email: parsed.email.toLowerCase() } });
  }
  if (!currentUser) {
    return { error: NextResponse.json({ error: 'No staff account found for this session.' }, { status: 401 }), actor: null };
  }
  if (!currentUser.isActive) {
    return { error: NextResponse.json({ error: 'Your account is inactive. Contact an administrator.' }, { status: 403 }), actor: null };
  }
  if (currentUser.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Only admins can perform this action.' }, { status: 403 }), actor: null };
  }

  return {
    error: null,
    actor: { userId: currentUser.id, email: currentUser.email, name: currentUser.name },
  };
}
