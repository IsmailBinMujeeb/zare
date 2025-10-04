/* v8 ignore start */
import { dirname, join, resolve } from 'path';
import { readdir } from 'fs/promises';
import type { Dirent } from 'fs';

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

export function mapOrApply<T, U>(
  value: T | T[],
  callback: (item: T) => U,
): U | U[] {
  if (Array.isArray(value)) {
    return value.map(callback);
  } else {
    return callback(value);
  }
}

export function normalizeRoute(path: string): string {
  path = path.replace(/\.zare$/i, '').replace(/\\/g, '/');
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  if (path === '/index') {
    return '/';
  }
  return path.replace(/\/index$/, '');
}
/* v8 ignore end */
