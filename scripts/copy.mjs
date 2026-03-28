import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// as we publish only the dist folder, we need to copy some meta files inside (readme/license/package.json)
// also changes paths inside the copied `package.json` (`dist/index.js` -> `index.js`)
const root = resolve(fileURLToPath(import.meta.url), '../..');
const target = resolve(process.cwd(), 'dist');
const pkgPath = resolve(process.cwd(), 'package.json');

const options = process.argv.slice(2).reduce((args, arg) => {
  const [key, value] = arg.split('=');
  args[key.substring(2)] = value ?? true;

  return args;
}, {});

function copy(filename, from, to, newFilename = filename) {
  copyFileSync(resolve(from, filename), resolve(to, newFilename));
}

function rewrite(path, replacer) {
  try {
    const file = readFileSync(path).toString();
    const replaced = replacer(file);
    writeFileSync(path, replaced, { flush: true });
  } catch {
    // not found
  }
}

function bumpVersion(version, bump) {
  const parts = version.split('.');

  switch (String(bump).toLowerCase()) {
    case 'major': {
      parts[0] = `${+parts[0] + 1}`;
      parts[1] = 0;
      parts[2] = 0;
      break;
    }
    case 'minor': {
      parts[1] = `${+parts[1] + 1}`;
      parts[2] = 0;
      break;
    }
    case 'patch':
    default:
      parts[2] = `${+parts[2] + 1}`;
  }

  return parts.join('.');
}

/**
 * Checks next dev version number based on the `@mikro-orm/nestjs` package via `npm show`.
 * We always use this package, so we ensure the version is the same for each package in the monorepo.
 */
async function getNextVersion() {
  const versions = [];

  try {
    const versionString = execSync(`npm show @mikro-orm/nestjs versions --json`, { encoding: 'utf8', stdio: 'pipe' });
    const parsed = JSON.parse(versionString);
    versions.push(...parsed);
  } catch {
    // the package might not have been published yet
  }

  const pkg = JSON.parse(readFileSync(resolve(root, './package.json')).toString());
  let version = pkg.version.replace(/^(\d+\.\d+\.\d+)-?.*$/, '$1');

  if (options.canary || options.bump) {
    version = bumpVersion(version, options.canary ?? options.bump);
  }

  if (versions.some(v => v === version)) {
    console.error(
      `before-deploy: A release with version ${version} already exists. Please increment version accordingly.`,
    );
    process.exit(1);
  }

  if (options.bump) {
    return version;
  }

  const preid = options.preid ?? 'dev';
  const prereleaseNumbers = versions
    .filter(v => v.startsWith(`${version}-${preid}.`))
    .map(v => Number(v.match(/\.(\d+)$/)?.[1]));
  const lastPrereleaseNumber = Math.max(-1, ...prereleaseNumbers);

  return `${version}-${preid}.${lastPrereleaseNumber + 1}`;
}

const pkgJson = JSON.parse(readFileSync(pkgPath).toString());

if (options.canary || options.bump) {
  const nextVersion = await getNextVersion();
  pkgJson.version = nextVersion;
  console.info(`${options.canary ? 'canary' : 'stable'}: setting version to ${nextVersion}`);
  writeFileSync(pkgPath, `${JSON.stringify(pkgJson, null, 2)}\n`, { flush: true });
}

// Sync jsr.json version from package.json
const jsrJsonPath = resolve(process.cwd(), 'jsr.json');

try {
  const jsrJson = JSON.parse(readFileSync(jsrJsonPath, 'utf8'));
  jsrJson.version = pkgJson.version;
  writeFileSync(jsrJsonPath, JSON.stringify(jsrJson, null, 2) + '\n', { flush: true });
} catch {
  // no jsr.json
}

copy('README.md', root, target);
copy('LICENSE', root, target);
copy('package.json', process.cwd(), target);

rewrite(resolve(target, 'package.json'), pkg => {
  return pkg.replace(/dist\//g, '').replace(/src\/(.*)\.ts/g, '$1.js');
});
