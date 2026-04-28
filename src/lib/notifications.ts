import { prisma } from '@/lib/prisma';
import { buildNotificationEmail, type NotificationEvent } from '@/lib/notification-emails';
import { sendEmail } from '@/lib/email';

export type NotificationChannel = 'in_app' | 'email' | 'both';
export type NotificationPriority = 'info' | 'action_required' | 'urgent';

export interface NotificationPayload {
  event: NotificationEvent;
  recipientUserIds?: string[];
  recipientEssPortalUserIds?: string[];
  title: string;
  body: string;
  href?: string;
  priority: NotificationPriority;
  channel: NotificationChannel;
  emailSubject?: string;
  emailHtml?: string;
  metadata?: Record<string, unknown>;
}

export async function getUserIdsByRole(role: 'admin' | 'staff' | 'viewer'): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { role, isActive: true },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

export async function getHrUserIds(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      OR: [{ role: 'admin' }, { staffUserType: { in: ['operations', 'business_manager'] } }],
    },
    select: { id: true },
  });
  return [...new Set(users.map((u) => u.id))];
}

export async function getPayrollUserIds(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      OR: [{ role: 'admin' }, { staffUserType: 'finance' }],
    },
    select: { id: true },
  });
  return [...new Set(users.map((u) => u.id))];
}

export async function getManagerUserIdForEmployee(employeeId: string): Promise<string | null> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { managerEmployeeId: true },
  });
  if (!employee?.managerEmployeeId) return null;
  const managerEss = await prisma.essPortalUser.findFirst({
    where: { employeeId: employee.managerEmployeeId, isActive: true },
    select: { id: true },
  });
  return managerEss?.id ?? null;
}

export async function getEssPortalUserIdForEmployee(employeeId: string): Promise<string | null> {
  const essUser = await prisma.essPortalUser.findFirst({
    where: { employeeId, isActive: true },
    select: { id: true },
  });
  return essUser?.id ?? null;
}

export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const staffIds = [...new Set(payload.recipientUserIds ?? [])];
  const essIds = [...new Set(payload.recipientEssPortalUserIds ?? [])];

  if (payload.channel === 'in_app' || payload.channel === 'both') {
    if (staffIds.length > 0) {
      await prisma.staffNotification.createMany({
        data: staffIds.map((userId) => ({
          userId,
          title: payload.title,
          body: payload.body,
          href: payload.href || null,
          event: payload.event,
          priority: payload.priority,
        })),
      });
    }
    if (essIds.length > 0) {
      await prisma.staffNotification.createMany({
        data: essIds.map((essPortalUserId) => ({
          essPortalUserId,
          title: payload.title,
          body: payload.body,
          href: payload.href || null,
          event: payload.event,
          priority: payload.priority,
        })),
      });
    }
  }

  if (payload.channel === 'email' || payload.channel === 'both') {
    let emailSubject = payload.emailSubject;
    let emailHtml = payload.emailHtml;
    if (!emailHtml) {
      const generated = buildNotificationEmail(payload.event, {
        ...(payload.metadata || {}),
        body: payload.body,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '',
      });
      emailSubject = emailSubject || generated.subject;
      emailHtml = generated.html;
    }
    if (!emailSubject || !emailHtml) {
      console.warn(`[notifications] Event ${payload.event} requested email but no subject/html provided`);
      return;
    }

    if (staffIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: staffIds }, isActive: true },
        select: { email: true },
      });
      for (const user of users) {
        if (!user.email) continue;
        try {
          await sendEmail({ to: user.email, subject: emailSubject, html: emailHtml });
        } catch (err) {
          console.error(`[notifications] Failed to email ${user.email} for ${payload.event}:`, err);
        }
      }
    }

    if (essIds.length > 0) {
      const users = await prisma.essPortalUser.findMany({
        where: { id: { in: essIds }, isActive: true },
        select: { email: true },
      });
      for (const user of users) {
        if (!user.email) continue;
        try {
          await sendEmail({ to: user.email, subject: emailSubject, html: emailHtml });
        } catch (err) {
          console.error(`[notifications] Failed to email ESS ${user.email} for ${payload.event}:`, err);
        }
      }
    }
  }
}
