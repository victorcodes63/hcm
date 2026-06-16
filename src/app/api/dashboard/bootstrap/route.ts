import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loadCompanySetupSettings } from '@/lib/company-setup';
import { getAuthProvidersSummary } from '@/lib/auth-providers';
import { getDeploymentSummary } from '@/lib/deployment-config';
import { reportApiError } from '@/lib/monitoring';
import {
  isMultiEntityEnvEnabled,
  loadOperatingEntitiesSettings,
  shouldShowEntitySwitcher,
  toPublicEntities,
} from '@/lib/operating-entities';
import { listLicensedModules, MODULE_DEFINITIONS, resolveEffectiveModules } from '@/lib/modules';
import { moduleAdminFlagsSetCookieHeader } from '@/lib/module-cookie';
import { unauthorizedResponse } from '@/lib/demo-route-access';
import { requireStaffUser } from '@/lib/staff-api-auth';
import { userRowToSummary } from '@/lib/user-summary-api';

export const dynamic = 'force-dynamic';

/** GET — session user, module flags, and entity switcher config in one round-trip. */
export async function GET(request: NextRequest) {
  const staffUser = await requireStaffUser(request);
  if (!staffUser) return unauthorizedResponse();

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  try {
    const [fullUser, setup, entitySettings] = await Promise.all([
      prisma.user.findUnique({ where: { id: staffUser.id } }),
      loadCompanySetupSettings(),
      loadOperatingEntitiesSettings(),
    ]);

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const licensed = listLicensedModules();
    const moduleAdminFlags = setup.moduleAdminFlags;
    const modules = resolveEffectiveModules(moduleAdminFlags);
    const entities = toPublicEntities(entitySettings);

    const response = NextResponse.json({
      me: await userRowToSummary(fullUser),
      deployment: getDeploymentSummary(),
      authProviders: getAuthProvidersSummary(),
      modules,
      moduleAdminFlags,
      moduleCatalog: MODULE_DEFINITIONS.map(({ key, label, envVar, description, canDisable }) => ({
        key,
        label,
        envVar,
        description,
        canDisable,
        licensed: licensed[key],
        adminEnabled: moduleAdminFlags[key],
        enabled: modules[key],
      })),
      entities,
      defaultEntityId: entitySettings.defaultEntityId,
      showEntitySwitcher: shouldShowEntitySwitcher(entitySettings),
      multiEntityEnabled: entitySettings.multiEntityEnabled,
      multiEntityEnvEnabled: isMultiEntityEnvEnabled(),
    });

    response.headers.append('Set-Cookie', moduleAdminFlagsSetCookieHeader(moduleAdminFlags));
    return response;
  } catch (error) {
    await reportApiError({
      route: 'GET /api/dashboard/bootstrap',
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to load dashboard session.' }, { status: 500 });
  }
}
