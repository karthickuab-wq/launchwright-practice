#!/usr/bin/env node
// Checks health-check.mjs on small made-up apps in a temporary folder.
// Usage: node skills/existing-app/health-check-test.mjs   Exit code 1 lists every failed check.
// The made-up keys are built from pieces, so this file never holds one whole (the health check of
// this repo would list it otherwise). Plain Node 20+, no packages.

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { healthCheck, isEnvFile, keyKindsIn, mainVersion } from './health-check.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'health-check-'));
const failed = [];
let passed = 0;
const check = (name, ok) => (ok ? passed++ : failed.push(name));

const STRIPE_LIVE = ['sk', 'live', 'Zx8Qw2Er4Ty6Ui8Op0As2Df4'].join('_');
const ANTHROPIC = ['sk', 'ant', 'api03', 'Qw2Er4Ty6Ui8Op0As2Df4Gh6Jk8'].join('-');
const AWS = 'AK' + 'IA' + 'QWERTYUIOPASDFGH';
const jwt = (payload) => ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify(payload)).toString('base64url'), 'c2lnbmF0dXJlc2lnbmF0dXJl'].join('.');

function makeApp(name, files, { git = true } = {}) {
  const root = join(tmp, name);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof text === 'string' ? text : JSON.stringify(text, null, 2));
  }
  mkdirSync(root, { recursive: true });
  if (git) {
    const g = (...a) => execFileSync('git', ['-C', root, ...a], { stdio: 'ignore' });
    g('init', '-q', '-b', 'main');
    g('-c', 'user.name=t', '-c', 'user.email=t@example.com', 'add', '-A');
    g('-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-q', '-m', 'first', '--allow-empty');
  }
  return root;
}
const commit = (root, message) => {
  const g = (...a) => execFileSync('git', ['-C', root, ...a], { stdio: 'ignore' });
  g('-c', 'user.name=t', '-c', 'user.email=t@example.com', 'add', '-A');
  g('-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-q', '-m', message);
};

try {
  // ---- the small helpers ----
  check('a Stripe live key is named', keyKindsIn(`const k = "${STRIPE_LIVE}";`).includes('a Stripe secret key (live)'));
  check('an Anthropic key is not also called an OpenAI key', JSON.stringify(keyKindsIn(`key: '${ANTHROPIC}'`)) === '["an Anthropic key"]');
  check('Supabase\'s public key is left alone', keyKindsIn(`const anon = '${jwt({ role: 'anon' })}'`).length === 0);
  check('Supabase\'s service key is named', keyKindsIn(`const s = '${jwt({ role: 'service_role' })}'`).includes('a Supabase service key'));
  check('a placeholder is not a key', keyKindsIn('api_key: "your-api-key-goes-here"').length === 0);
  check('reading a key from the environment is not a key', keyKindsIn('const apiKey = process.env.API_KEY || "abcdefghijklmnop"').length === 0);
  check('a password in a setting is named', keyKindsIn('db_password = "hunter2hunter2hunter2"').includes('a value named like a secret'));
  check('a database address with its password is named', keyKindsIn(`url = "postgres://app:${'s3cr3t' + 'pass'}@db.example.com/x"`).includes('a database address with its password'));
  check('.env files follow the guard\'s rule', isEnvFile('.env') && isEnvFile('app/.env.local') && isEnvFile('prod.env') && !isEnvFile('.env.example') && !isEnvFile('src/environment.ts'));
  check('version numbers', mainVersion('~58.0.26') === 58 && mainVersion('^0.74.1') === 74 && mainVersion('latest') === null);

  // ---- an Expo app with a key in the code, a committed .env file, and no tests ----
  const expo = makeApp('expo-app', {
    'package.json': { name: 'pets', scripts: { start: 'expo start', 'store-ios': 'eas submit --platform ios' }, dependencies: { expo: '~52.0.0', 'react-native': '0.76.3', react: '18.3.1', 'expo-router': '~4.0.0' } },
    'package-lock.json': '{}',
    'app.json': { expo: { name: 'Pets' } },
    'eas.json': { build: { preview: {}, production: {} }, submit: { production: {} } },
    'app/index.tsx': `export default function Home() { return null; }\nconst stripe = "${STRIPE_LIVE}";\n`,
    'app/login.tsx': 'export default function Login() { return null; }\n',
    '.env': `ANTHROPIC_KEY=${ANTHROPIC}\n`,
    '.gitignore': 'node_modules\n',
    'ios/Podfile': '',
    'tsconfig.json': '{}',
  });
  const r1 = healthCheck(expo, { history: true });
  const out1 = JSON.stringify(r1);
  check('Expo is something the kit knows', r1.builtWith.kind === 'expo');
  check('an Expo app\'s own iPhone folder is not a second toolset', !r1.builtWith.toolsets.some((t) => t.name.startsWith('Xcode')));
  check('the key in the code is named by kind, file and line', r1.keys.inCode.some((k) => k.kind === 'a Stripe secret key (live)' && k.file === 'app/index.tsx' && k.line === 2 && !k.inTestFile));
  check('the committed .env file is named', r1.keys.envFilesInCode.includes('.env'));
  check('the .env file is never opened', !r1.keys.inCode.some((k) => k.file === '.env') && !r1.keys.history.found.some((k) => k.file === '.env'));
  check('no key value is ever in the report', !out1.includes(STRIPE_LIVE) && !out1.includes(ANTHROPIC) && !out1.includes('Zx8Qw2Er4'));
  check('no tests is fragile', r1.fragile.some((f) => f.what === 'no-tests'));
  check('.env not left out by .gitignore is fragile', r1.fragile.some((f) => f.what === 'env-not-ignored'));
  check('Expo is compared with the kit\'s starter', r1.packages.kitFound && r1.packages.compared.find((c) => c.name === 'expo')?.behind === 6);
  check('a script that submits under another name is a production script', r1.guardHints.productionScripts.includes('store-ios') && !r1.guardHints.productionScripts.includes('start'));
  check('sign-in and the store identity need care', r1.careful.some((c) => /sign-in/.test(c.why)) && r1.careful.some((c) => /store identity/.test(c.why)));
  check('the app sits at the top', JSON.stringify(r1.builtWith.appFolders) === '["."]');

  // ---- a key that was removed is still in the history ----
  writeFileSync(join(expo, 'app/index.tsx'), 'export default function Home() { return null; }\n');
  writeFileSync(join(expo, 'server.js'), `const aws = "${AWS}";\n`);
  commit(expo, 'second');
  writeFileSync(join(expo, 'server.js'), 'const aws = process.env.AWS_KEY;\n');
  commit(expo, 'third');
  const r2 = healthCheck(expo, { history: true });
  check('a removed key is no longer in the code', !r2.keys.inCode.some((k) => k.kind.startsWith('an Amazon')));
  check('a removed key is found in the history, by commit', r2.keys.history.found.some((k) => k.kind === 'an Amazon (AWS) key' && k.file === 'server.js' && /^[0-9a-f]{7,}$/.test(k.commit) && !k.stillInCode));
  check('the .env file is listed as once in the code', r2.keys.history.envFilesEver.includes('.env'));
  check('without --history the history is not searched', healthCheck(expo).keys.history === undefined);

  // ---- a Lovable-style web app that deploys on every push to main ----
  const lovable = makeApp('lovable-app', {
    'package.json': { name: 'shop', scripts: { dev: 'vite', build: 'vite build', test: 'echo "Error: no test specified" && exit 1', 'db:push': 'supabase db push' }, dependencies: { react: '18.3.1', '@supabase/supabase-js': '2.0.0' }, devDependencies: { vite: '5.4.0', 'lovable-tagger': '1.0.0' } },
    'bun.lockb': 'x', 'package-lock.json': '{}',
    'src/lib/supabase.ts': `export const url = "https://abcdxyz.supabase.co";\nexport const anon = "${jwt({ role: 'anon' })}";\n`,
    'src/pages/Checkout.tsx': 'export default 1;\n',
    'supabase/migrations/001.sql': 'create table t();',
    'exports/customers.csv': 'name\n',
    '.github/workflows/deploy.yml': 'on:\n  push:\n    branches: [main]\njobs:\n  d:\n    steps:\n      - run: npx vercel deploy --prod\n',
    '.gitignore': '.env\n',
  });
  const r3 = healthCheck(lovable);
  check('a Vite app is a web app on another toolset', r3.builtWith.kind === 'web-js');
  check('Lovable leaves a trace', r3.builtWith.madeWith.includes('Lovable'));
  check('Supabase is the backend', r3.builtWith.backends.includes('Supabase'));
  check('Supabase\'s public key is not listed', r3.keys.inCode.length === 0);
  check('a push to main deploys', r3.runsAndShips.deploysOnMainPush && r3.guardHints.workingBranch !== 'main');
  check('a test command that tests nothing still counts as no tests', r3.fragile.some((f) => f.what === 'no-tests'));
  check('two lockfiles are fragile', r3.fragile.some((f) => f.what === 'two-lockfiles'));
  check('the database host is a real-data host', r3.guardHints.userDataHosts.includes('abcdxyz.supabase.co'));
  check('an exports folder is real users\' data', r3.guardHints.userDataPaths.includes('exports/'));
  check('a script that pushes the database is a production script', r3.guardHints.productionScripts.includes('db:push'));
  check('migrations and money need care', r3.careful.some((c) => /shape of real/.test(c.why)) && r3.careful.some((c) => c.why === 'money'));

  // ---- something the kit doesn't know, an empty folder, and no git ----
  const flutter = makeApp('flutter-app', { 'pubspec.yaml': 'name: x\n', 'lib/main.dart': 'void main() {}\n', 'test/widget_test.dart': 'final u = "https://madeup.supabase.co";\n' });
  const r4 = healthCheck(flutter);
  check('Flutter is something else', r4.builtWith.kind === 'other' && r4.builtWith.toolsets.some((t) => t.name === 'Flutter'));
  check('a host only a test names is not real data', r4.guardHints.userDataHosts.length === 0);
  check('Flutter\'s tests are found', !r4.fragile.some((f) => f.what === 'no-tests'));
  const empty = makeApp('empty', {}, { git: false });
  check('an empty folder is none', healthCheck(empty).builtWith.kind === 'none');
  const plain = makeApp('plain', { 'package.json': { dependencies: { next: '15.0.0', react: '19.0.0' } }, 'node_modules/x/index.js': `k="${STRIPE_LIVE}"` }, { git: false });
  const r5 = healthCheck(plain);
  check('without git, installed packages are skipped', r5.keys.inCode.length === 0 && r5.builtWith.kind === 'web-js');

  // ---- links are never followed: one to a key file under a harmless name, one out of the app, one broken ----
  const outside = makeApp('outside', { 'secret.txt': `k="${STRIPE_LIVE}"\n` }, { git: false });
  const linked = makeApp('linked', { 'package.json': { dependencies: { expo: '~58.0.0' } }, '.env': `STRIPE=${STRIPE_LIVE}\n` }, { git: false });
  symlinkSync('.env', join(linked, 'config.js'));
  symlinkSync(join(outside, 'secret.txt'), join(linked, 'notes.txt'));
  symlinkSync(join(outside, 'nowhere'), join(linked, 'broken.js'));
  symlinkSync(outside, join(linked, 'shared'));
  let r6 = null;
  try { r6 = healthCheck(linked); } catch { r6 = null; }
  check('a broken link doesn\'t stop the check', r6 !== null);
  check('a link is never read, so a key behind one is never opened', r6 !== null && r6.keys.inCode.length === 0);

  // ---- the command line ----
  const cli = spawnSync(process.execPath, [join(HERE, 'health-check.mjs'), expo], { encoding: 'utf8' });
  check('the command line prints the report', cli.status === 0 && JSON.parse(cli.stdout).builtWith.kind === 'expo');
  check('the command line never prints a key', !cli.stdout.includes(STRIPE_LIVE) && !cli.stdout.includes(ANTHROPIC));
  check('a missing folder is a usage mistake', spawnSync(process.execPath, [join(HERE, 'health-check.mjs'), join(tmp, 'nope')]).status === 2);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log(`${passed} passed, ${failed.length} failed`);
for (const f of failed) console.log(`  FAILED: ${f}`);
process.exit(failed.length ? 1 : 0);
