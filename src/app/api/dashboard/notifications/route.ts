import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireStaffUser } from '@/lib/staff-api-auth';
import { reportApiError } from '@/lib/monitoring';
import { whereExcludeSeedStaffNotifications } from '@/lib/staff-notification-seed-filter';

export const dynamic = 'force-dynamic';

/** GET — recent notifications for the signed-in staff user. */
export async function GET(request: NextRequest) {
  const user = await requireStaffUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = Math.min(50, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || '30', 10)));

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.staffNotification.findMany({
        where: { userId: user.id, ...whereExcludeSeedStaffNotifications() },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          title: true,
          body: true,
          readAt: true,
          href: true,
          contractId: true,
          event: true,
          priority: true,
          createdAt: true,
        },
      }),
      prisma.staffNotification.count({
        where: { userId: user.id, readAt: null, ...whereExcludeSeedStaffNotifications() },
      }),
    ]);

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        href: n.href,
        contractId: n.contractId,
        event: n.event,
        priority: n.priority,
        unread: n.readAt === null,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (error) {
    await reportApiError({
      route: 'GET /api/dashboard/notifications',
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to load notifications.' }, { status: 500 });
  }
}

/** PATCH — body: { markAllRead?: boolean; ids?: string[] } */
export async function PATCH(request: NextRequest) {
  const user = await requireStaffUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { markAllRead?: boolean; ids?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const now = new Date();

  try {
    if (body.markAllRead) {
      await prisma.staffNotification.updateMany({
        where: { userId: user.id, readAt: null, ...whereExcludeSeedStaffNotifications() },
        data: { readAt: now },
      });
      return NextResponse.json({ ok: true });
    }

    const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === 'string') : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    await prisma.staffNotification.updateMany({
      where: { userId: user.id, id: { in: ids } },
      data: { readAt: now },
    });
    return NextResponse.json({ ok: true, updated: ids.length });
  } catch (error) {
    await reportApiError({
      route: 'PATCH /api/dashboard/notifications',
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to update notifications.' }, { status: 500 });
  }
}
