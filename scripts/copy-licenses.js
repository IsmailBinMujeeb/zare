import { getPackages } from '@manypkg/get-packages';
import { copyFile } from 'fs/promises';
import { join, resolve } from 'path';

const root = resolve(import.meta.dirname, '..');

const { packages } = await getPackages(root);

await Promise.all(
  packages.map(({ dir }) =>
    copyFile(join(root, 'LICENSE'), join(dir, 'LICENSE')),
  ),
);
