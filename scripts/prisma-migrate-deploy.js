const { spawnSync } = require('child_process');

function run() {
  if (process.env.RUN_MIGRATIONS_ON_BUILD !== 'true') {
    console.log(
      '[prisma-migrate-deploy] Skipping `prisma migrate deploy` (set RUN_MIGRATIONS_ON_BUILD=true to enable).'
    );
    return;
  }

  const result = spawnSync(
    'npx',
    ['prisma', 'migrate', 'deploy'],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    }
  );

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  const output = `${stdout}\n${stderr}`.trim();

  if (result.status === 0) {
    process.stdout.write(stdout);
    return;
  }

  // If the production DB already contains a previously failed migration record (P3009),
  // we don't want to block Next.js builds. We log the output and continue.
  if (output.includes('P3009')) {
    process.stdout.write(stdout);
    process.stderr.write(stderr);
    console.warn(
      '\n[prisma-migrate-deploy] Detected P3009 (failed migration present). ' +
        'Continuing so Vercel can complete `next build`. ' +
        'You should resolve the failed migration record separately.'
    );
    return;
  }

  // Unknown failure: fail the build so we don't hide real migration issues.
  process.stdout.write(stdout);
  process.stderr.write(stderr);
  process.exit(result.status ?? 1);
}

run();

