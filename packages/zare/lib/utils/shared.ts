/* v8 ignore start */
import { dirname, join, resolve, sep } from 'path';
import { readdir } from 'fs/promises';
import type { Dirent } from 'fs';

export const toSlash: (s: string) => string =
  sep === '/' ? s => s : s => s.replace(/\\/g, '/');

export async function findUp(
  root: string,
  filter: (path: string, entry: Dirent<string>) => boolean,
): Promise<string | undefined> {
  let currentDir = resolve(root);

  while (true) {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile()) {
          const path = join(currentDir, entry.name);
          if (filter(path, entry)) {
            return path;
          }
        }
      }
    } catch (err) {}

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
}

export function isZareConfig(_: string, entry: Dirent<string>) {
  return /zare\.config\.(js|ts|mts|cts|mjs|cjs)$/i.test(entry.name);
}

export function normalizeRoute(path: string): string {
  path = toSlash(path.replace(/\.zare$/i, ''));
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  if (path === '/index') {
    return '/';
  }
  return path.replace(/\/index$/, '');
}
/* v8 ignore stop */
