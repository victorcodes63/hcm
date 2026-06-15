/**
 * Seed all vertical showcase packs into one database.
 * The entity switcher lists one Kenya entity per sector — switch without re-seeding.
 *
 * Run: npm run demo:reseed:all-verticals
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { VERTICAL_SHOWCASE_PACK_IDS } from './demo-packs/load-pack';
import {
  OPERATING_ENTITIES_SETTINGS_KEY,
  sanitizeOperatingEntitiesSettings,
} from '../src/lib/operating-entities';
import { UNIFIED_DEMO_EMAIL } from './demo-packs/build-from-generic';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const prisma = new PrismaClient();

async function seedCombinedOperatingEntities() {
  const clients = await prisma.outsourcingClient.findMany({
    where: { entityCode: { endsWith: '__ke' } },
    orderBy: [{ entityCode: 'asc' }],
  });

  const order = VERTICAL_SHOWCASE_PACK_IDS as readonly string[];
  const showcase = clients
    .filter((c) => order.some((packId) => c.entityCode?.startsWith(`${packId}__`)))
    .sort(
      (a, b) =>
        order.findIndex((p) => a.entityCode?.startsWith(`${p}__`)) -
        order.findIndex((p) => b.entityCode?.startsWith(`${p}__`)),
    );

  if (showcase.length === 0) {
    console.warn('No vertical showcase entities found — skip operating entities merge.');
    return;
  }

  const entities = showcase.map((client) => {
    const slug = client.entityCode!.toLowerCase();
    return {
      id: slug,
      legalName: client.name,
      countryCode: 'KE' as const,
      currency: client.currency ?? 'KES',
      employeeNumberPrefix: client.employeeNumberPrefix ?? 'EMP',
      isActive: true,
    };
  });

  const settings = sanitizeOperatingEntitiesSettings({
    multiEntityEnabled: true,
    defaultEntityId: entities[0]!.id,
    entities,
  });

  await prisma.systemSetting.upsert({
    where: { key: OPERATING_ENTITIES_SETTINGS_KEY },
    update: { value: settings },
    create: { key: OPERATING_ENTITIES_SETTINGS_KEY, value: settings },
  });

  console.log(`→ Vertical switcher: ${entities.length} company contexts (one per sector)`);
  for (const e of entities) {
    console.log(`   · ${e.legalName} (${e.id})`);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.');
  }

  console.log('Seeding all vertical showcase contexts into one database…');
  console.log(`Unified admin login: ${UNIFIED_DEMO_EMAIL}\n`);

  for (const packId of VERTICAL_SHOWCASE_PACK_IDS) {
    console.log(`\n════════ ${packId} ════════\n`);
    execSync('npx tsx prisma/seed-demo.ts', {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        DEMO_PACK: packId,
        DEMO_MULTI_CONTEXT: 'true',
        DEMO_ENTITY_PREFIX: packId,
        DEMO_UNIFIED_ADMIN_EMAIL: process.env.DEMO_UNIFIED_ADMIN_EMAIL ?? UNIFIED_DEMO_EMAIL,
      },
    });
  }

  await seedCombinedOperatingEntities();
  console.log('\nAll vertical contexts seeded. Use the top-bar switcher to change sector demo.\n');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
