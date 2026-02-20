/**
 * Seed a single staff account (for dev or initial setup).
 * Run: node prisma/seed-staff.js
 * Requires: DATABASE_URL set, migrations applied.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const STAFF_EMAIL = 'vchumo@eaglehr.co.ke';
const STAFF_PASSWORD = 'eaglehr';
const STAFF_NAME = 'Victor Chumo';
const ROUNDS = 10;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email: STAFF_EMAIL } });
  if (existing) {
    console.log('Staff account already exists:', STAFF_EMAIL);
    return;
  }

  const passwordHash = await bcrypt.hash(STAFF_PASSWORD, ROUNDS);
  await prisma.user.create({
    data: {
      email: STAFF_EMAIL,
      name: STAFF_NAME,
      passwordHash,
      role: 'staff',
      isActive: true,
    },
  });
  console.log('Staff account created:', STAFF_EMAIL);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
