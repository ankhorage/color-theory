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
    "import { COLOR_HARMONIES, type ColorHarmony } from '@ankhorage/color-theory';\nimport { converter, formatHex } from '@ankhorage/color-theory/culori/fn';\nconst harmony: ColorHarmony = COLOR_HARMONIES[0]!;\nconst toOklch = converter('oklch');\nvoid harmony;\nvoid toOklch;\nvoid formatHex;\n",
  );
  const typecheckResult = Bun.spawnSync(
    [
      join(process.cwd(), 'node_modules/.bin/tsc'),
      '--noEmit',
      '--ignoreConfig',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      'consumer.ts',
    ],
    { cwd: consumerDirectory },
  );
  if (typecheckResult.exitCode !== 0) {
    throw new Error(
      `${new TextDecoder().decode(typecheckResult.stdout)}${new TextDecoder().decode(typecheckResult.stderr)}`,
    );
  }

  const reactNativeTypecheckResult = Bun.spawnSync(
    [
      join(process.cwd(), 'node_modules/.bin/tsc'),
      '--noEmit',
      '--ignoreConfig',
      '--module',
      'ESNext',
      '--moduleResolution',
      'bundler',
      '--customConditions',
      'react-native',
      'consumer.ts',
    ],
    { cwd: consumerDirectory },
  );
  if (reactNativeTypecheckResult.exitCode !== 0) {
    throw new Error(
      `${new TextDecoder().decode(reactNativeTypecheckResult.stdout)}${new TextDecoder().decode(reactNativeTypecheckResult.stderr)}`,
    );
  }

  const browserTypecheckResult = Bun.spawnSync(
    [
      join(process.cwd(), 'node_modules/.bin/tsc'),
      '--noEmit',
      '--ignoreConfig',
      '--module',
      'ESNext',
      '--moduleResolution',
      'bundler',
      '--customConditions',
      'browser',
      'consumer.ts',
    ],
    { cwd: consumerDirectory },
  );
  if (browserTypecheckResult.exitCode !== 0) {
    throw new Error(
      `${new TextDecoder().decode(browserTypecheckResult.stdout)}${new TextDecoder().decode(browserTypecheckResult.stderr)}`,
    );
  }

  const nodeResult = Bun.spawnSync(
    [
      'node',
      '--input-type=module',
      '--eval',
      "import { COLOR_HARMONIES } from '@ankhorage/color-theory'; import { converter, formatHex } from '@ankhorage/color-theory/culori/fn'; if (!COLOR_HARMONIES.includes('triadic') || typeof converter !== 'function' || typeof formatHex !== 'function') process.exit(1);",
    ],
    { cwd: consumerDirectory },
  );
  if (nodeResult.exitCode !== 0) {
    throw new Error(new TextDecoder().decode(nodeResult.stderr));
  }

  const browserResult = Bun.spawnSync(
    [
      'node',
      '--conditions=browser',
      '--input-type=module',
      '--eval',
      "import { converter, formatHex } from '@ankhorage/color-theory/culori/fn'; if (typeof converter !== 'function' || typeof formatHex !== 'function') process.exit(1);",
    ],
    { cwd: consumerDirectory },
  );
  if (browserResult.exitCode !== 0) {
    throw new Error(new TextDecoder().decode(browserResult.stderr));
  }
} finally {
  await rm(consumerDirectory, { force: true, recursive: true });
}
