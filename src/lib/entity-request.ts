import type { NextRequest } from 'next/server';
import type { Prisma } from '@prisma/client';
import type { EntityId } from '@/lib/entityConfig';
import { ENTITY_HEADER, HRIS_ENTITY_COOKIE } from '@/lib/entity-constants';

export { ENTITY_HEADER, HRIS_ENTITY_COOKIE } from '@/lib/entity-constants';

export function parseEntityIdFromRequest(
  request: Pick<NextRequest, 'headers' | 'cookies' | 'nextUrl'>,
): EntityId | null {
  const header = request.headers.get(ENTITY_HEADER)?.trim().toLowerCase();
  if (header === 'ke' || header === 'ug') return header;

  const fromQuery = request.nextUrl.searchParams.get('entityId')?.trim().toLowerCase();
  if (fromQuery === 'ke' || fromQuery === 'ug') return fromQuery;

  const cookie = request.cookies.get(HRIS_ENTITY_COOKIE)?.value?.trim().toLowerCase();
  if (cookie === 'ke' || cookie === 'ug') return cookie;

  return null;
}

/** Narrow recruitment search / analytics to jobs in the active country (demo heuristic). */
export function jobLocationMatchesEntity(entityId: EntityId): Prisma.JobWhereInput {
  if (entityId === 'ke') {
    return {
      OR: [
        { location: { contains: 'Kenya', mode: 'insensitive' } },
        { location: { contains: 'Nairobi', mode: 'insensitive' } },
        { location: { contains: 'Mombasa', mode: 'insensitive' } },
        { location: { contains: 'Nakuru', mode: 'insensitive' } },
        { location: { contains: 'Kisumu', mode: 'insensitive' } },
        { location: { contains: 'Westlands', mode: 'insensitive' } },
      ],
    };
  }
  return {
    OR: [
      { location: { contains: 'Uganda', mode: 'insensitive' } },
      { location: { contains: 'Kampala', mode: 'insensitive' } },
      { location: { contains: 'Jinja', mode: 'insensitive' } },
      { location: { contains: 'Entebbe', mode: 'insensitive' } },
      { location: { contains: 'Nansana', mode: 'insensitive' } },
    ],
  };
}
