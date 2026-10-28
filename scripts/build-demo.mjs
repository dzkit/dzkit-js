// Assembles the playground into ./site: the demo files plus the built package.
// Run `npm run build` first (or use `npm run demo`, which does both).
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist', 'index.js');
const site = join(root, 'site');

if (!existsSync(dist)) {
  console.error('dist/index.js is missing: run `npm run build` first.');
  process.exit(1);
}

rmSync(site, { recursive: true, force: true });
mkdirSync(site, { recursive: true });
cpSync(join(root, 'demo'), site, { recursive: true });
cpSync(dist, join(site, 'dzkit.js'));
console.log('Playground ready in ./site. Serve it with any static server, e.g. `npx serve site`.');
