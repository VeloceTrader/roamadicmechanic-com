import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const searchable = new Set(['.html', '.js', '.mjs', '.json', '.md']);
const ignoredDirectories = new Set(['.git', 'node_modules']);
const forbiddenProvider = /housecall\s*pro|housecallpro|pro\.housecallpro|hcpro/i;

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(path));
    else if (searchable.has(extname(entry.name))) files.push(path);
  }
  return files;
}

test('the public site cannot route bookings through the retired provider', async () => {
  const matches = [];
  for (const file of await sourceFiles(root)) {
    if (file.endsWith('booking-provider.test.mjs')) continue;
    if (forbiddenProvider.test(await readFile(file, 'utf8'))) matches.push(file);
  }
  assert.deepEqual(matches, []);
});

test('homepage booking calls to action use the Roamadic scheduling flow', async () => {
  const homepage = await readFile(join(root, 'index.html'), 'utf8');
  const bookingLinks = [...homepage.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>[^<]*(?:Book|Appointment)[^<]*<\/a>/gi)]
    .map((match) => match[1]);
  assert.ok(bookingLinks.length >= 3);
  assert.ok(bookingLinks.every((href) => href === '/schedule/'));
});
