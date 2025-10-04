import fs from 'fs-extra';
import path from 'path';

export async function cpDir(src: string, dest: string) {
  await fs.ensureDir(dest);

  const entries = await fs.readdir(src, { withFileTypes: true });

  const promises = entries.map(async entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      return cpDir(srcPath, destPath);
    } else if (entry.isFile()) {
      return fs.copyFile(srcPath, destPath);
    }
  });

  await Promise.all(promises);
}

export async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subDirFiles = await getAllFiles(filePath);
      files.push(...subDirFiles);
    } else {
      files.push(filePath);
    }
  }
  return files;
}
