// Lists every screen of an exported Expo web build (the dist/ folder from `npm run export:web`),
// for the checkpoint's screenshot design review. Plain Node, no packages.
//
// Expo's static export writes one .html file per screen. Route groups such as "(tabs)" don't
// appear in the address, so they're dropped; "_sitemap" and "+not-found" aren't the app's own
// screens, so they're skipped. A screen whose address needs a value ("[id].html") can't be opened
// as it stands: it's listed under needsValue, and the checkpoint opens it with a sample value.
// A build with server code (web.output "server") has no .html files: its pages are drawn when
// they're opened, so they're read from the build's route list (server/_expo/routes.json) instead.
// A build whose only page is index.html was exported as one page for everything (web.output
// "single" in app.json): its screens can't be found this way, so onePage says so, and the
// checkpoint sets web.output to "static" first (both starters have it).
//
// Use: node list-screens.mjs <dist folder>   (prints JSON)
// Or:  import { listScreens } from './list-screens.mjs'

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

export function listScreens(dist) {
  const screens = new Set();
  const needsValue = new Set();
  const routes = join(dist, 'server', '_expo', 'routes.json');
  const pages = existsSync(routes) ? [] : walk(dist).filter((file) => file.endsWith('.html'));
  const names = existsSync(routes)
    ? (JSON.parse(readFileSync(routes, 'utf8')).htmlRoutes ?? []).filter((r) => !r.generated).map((r) => r.page.replace(/^\//, '').split('/'))
    : pages.map((file) => relative(dist, file).slice(0, -'.html'.length).split(sep));
  for (const parts of names) {
    if (parts[0] === '_expo' || parts[0] === 'assets') continue;
    if (parts.some((p) => p.startsWith('_') || p.startsWith('+'))) continue;
    const kept = parts.filter((p) => !/^\(.*\)$/.test(p));
    if (kept[kept.length - 1] === 'index') kept.pop();
    const route = '/' + kept.join('/');
    (kept.some((p) => /^\[.*\]$/.test(p)) ? needsValue : screens).add(route);
  }
  const onePage = pages.length === 1 && relative(dist, pages[0]) === 'index.html';
  return { screens: [...screens].sort(), needsValue: [...needsValue].sort(), onePage };
}

// A file name for a screen's picture: "/" is "home", "/settings/profile" is "settings-profile".
export const shotName = (route) => (route === '/' ? 'home' : route.slice(1).replace(/[^A-Za-z0-9]+/g, '-')) + '.png';

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const dist = process.argv[2];
  if (!dist) {
    console.error('Use: node list-screens.mjs <dist folder>');
    process.exit(2);
  }
  console.log(JSON.stringify(listScreens(dist), null, 2));
}
