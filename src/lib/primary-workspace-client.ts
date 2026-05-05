import type { PrismaClient } from '@prisma/client';
import type { NextRequest } from 'next/server';
import { parseEntityIdFromRequest } from '@/lib/entity-request';

const DEFAULT_PRIMARY_WORKSPACE_NAME = 'Stabex International';
const DEFAULT_EMPLOYEE_PREFIX = 'STB';

/**
 * Single-tenant helper: resolve the primary outsourcing workspace client.
 * If none exists yet, create a default one automatically.
 */
export async function getOrCreatePrimaryWorkspaceClient(prisma: PrismaClient) {
  const existing = await prisma.outsourcingClient.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (existing) return existing;

  return prisma.outsourcingClient.create({
    data: {
      name: DEFAULT_PRIMARY_WORKSPACE_NAME,
      employeeNumberPrefix: DEFAULT_EMPLOYEE_PREFIX,
      currency: 'KES',
    },
  });
}

export async function resolvePrimaryWorkspaceClientId(
  prisma: PrismaClient,
  requestedClientId?: string | null,
  request?: Pick<NextRequest, 'headers' | 'cookies' | 'nextUrl'> | NextRequest | null,
) {
  if (request) {
    const entityId = parseEntityIdFromRequest(request);
    if (entityId) {
      const row = await prisma.outsourcingClient.findFirst({
        where: { entityCode: entityId },
        select: { id: true },
      });
      if (row) return row.id;
    }
  }
  if (requestedClientId && requestedClientId.trim()) return requestedClientId.trim();
  const workspace = await getOrCreatePrimaryWorkspaceClient(prisma);
  return workspace.id;
}

/**
 * Outsourcing clients tied to the dashboard entity switcher (ke / ug).
 * Used for "combined" list views that span both legal employers.
 */
export async function listEntitySwitcherOutsourcingClientIds(prisma: PrismaClient): Promise<string[]> {
  const rows = await prisma.outsourcingClient.findMany({
    where: { entityCode: { in: ['ke', 'ug'] } },
    select: { id: true },
    orderBy: { name: 'asc' },
  });
  return rows.map((r) => r.id);
}
