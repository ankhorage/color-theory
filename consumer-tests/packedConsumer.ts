import { mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const consumerDirectory = await mkdtemp(join(tmpdir(), 'color-theory-packed-consumer-'));
const packDirectory = join(consumerDirectory, 'pack');
const commandEnvironment = {
  ...process.env,
  BUN_INSTALL_CACHE_DIR: join(consumerDirectory, 'bun-cache'),
  TMPDIR: consumerDirectory,
  npm_config_cache: join(consumerDirectory, 'npm-cache'),
};

try {
  await mkdir(packDirectory);
  const packResult = Bun.spawnSync(
    ['npm', 'pack', '--ignore-scripts', '--pack-destination', packDirectory],
    {
      env: commandEnvironment,
    },
  );
  if (packResult.exitCode !== 0) {
    throw new Error(new TextDecoder().decode(packResult.stderr));
  }

  const [archiveName] = await readdir(packDirectory);
  if (!archiveName) {
    throw new Error('npm pack did not create an archive.');
  }
  const archive = join(packDirectory, archiveName);
  await Bun.write(join(consumerDirectory, 'package.json'), '{"type":"module"}\n');
  const installResult = Bun.spawnSync(['bun', 'install', '--ignore-scripts', archive], {
    cwd: consumerDirectory,
    env: commandEnvironment,
  });
  if (installResult.exitCode !== 0) {
    throw new Error(new TextDecoder().decode(installResult.stderr));
  }

  await Bun.write(
    join(consumerDirectory, 'consumer.ts'),
    "import { COLOR_HARMONIES, type ColorHarmony } from '@ankhorage/color-theory';\nconst harmony: ColorHarmony = COLOR_HARMONIES[0]!;\nvoid harmony;\n",
  );
  const typecheckResult = Bun.spawnSync(
    [
      join(process.cwd(), 'node_modules/.bin/tsc'),
      '--noEmit',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      'consumer.ts',
    ],
    { cwd: consumerDirectory },
  );
  if (typecheckResult.exitCode !== 0) {
    throw new Error(new TextDecoder().decode(typecheckResult.stderr));
  }

  const nodeResult = Bun.spawnSync(
    [
      'node',
      '--input-type=module',
      '--eval',
      "import { COLOR_HARMONIES } from '@ankhorage/color-theory'; if (!COLOR_HARMONIES.includes('triadic')) process.exit(1);",
    ],
    { cwd: consumerDirectory },
  );
  if (nodeResult.exitCode !== 0) {
    throw new Error(new TextDecoder().decode(nodeResult.stderr));
  }
} finally {
  await rm(consumerDirectory, { force: true, recursive: true });
}
