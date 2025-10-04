import type { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger.js';
import renderer from 'zare/core/renderer.js';
import { cpDir, getAllFiles } from '../utils/fs.js';
import { ZareCliConfig as ZareConfig } from '../config.js';
import { normalizeRoute } from 'zare/utils/shared.js';

function generateAllPaths(
  pathTemplate: string,
  params: Record<string, any> = {},
): Record<string, Record<string, string | number>> {
  const paramNames =
    pathTemplate.match(/\[(\w+)\]/g)?.map(match => match.slice(1, -1)) || [];

  const pathMap: Record<string, Record<string, string | number>> = {};
  let allPaths = [{ path: pathTemplate, params: {} }];

  for (const param of paramNames) {
    const newPaths = [];

    for (const item of allPaths) {
      const iter = params[param];
      if (!iter) {
        continue;
      }
      for (const value of iter) {
        const newPath = item.path.replace(`[${param}]`, value + '');
        const newParams = { ...item.params, [param]: value };
        newPaths.push({ path: newPath, params: newParams });
      }
    }

    allPaths = newPaths;
  }

  allPaths.forEach(item => {
    pathMap[item.path] = item.params;
  });

  return pathMap;
}

async function renderPage(
  pagePath: string,
  outputPath: string,
  renderOptions: Record<string, any> = {},
  config: ZareConfig,
) {
  const fileContent = await fs.readFile(pagePath, 'utf-8');
  const outputHtmlContent = await renderer(
    fileContent,
    renderOptions,
    pagePath,
    config,
  );
  if (!(await fs.exists(outputPath))) {
    await fs.createFile(outputPath);
  }
  await fs.writeFile(outputPath, outputHtmlContent);
}

export function buildCommand(program: Command) {
  program
    .command('build [projectPath]')
    .action(async (projectPath: string = '.') => {
      try {
        const zareConfig = await ZareConfig.find(path.resolve(projectPath));

        const rootDir = zareConfig.configDir || projectPath;
        const outDir = path.resolve(rootDir, zareConfig.options.outDir);

        logger.action`checking project destination`;

        // Check if project directory exist or not
        if (!(await fs.pathExists(rootDir))) {
          logger.error`Project path does not exists: ${rootDir}`;
          process.exit(1);
        }

        if (!(await fs.stat(rootDir)).isDirectory()) {
          logger.error`Project path is not a folder: ${rootDir}`;
          process.exit(1);
        }

        // Check if outdir exist if not create one.
        if (!(await fs.pathExists(outDir))) {
          await fs.mkdir(outDir, { recursive: true });
          logger.info`output directory created`;
        }

        logger.action`loading pages`;
        const pagesDir = path.resolve(rootDir, zareConfig.options.pagesDir);
        const pagePaths = (await getAllFiles(pagesDir)).filter(f =>
          f.toLowerCase().endsWith('.zare'),
        );

        await Promise.all(
          pagePaths.map(async pagePath => {
            const pageRoute = normalizeRoute(path.relative(pagesDir, pagePath));

            const staticParams =
              await zareConfig.options.generateStaticParams(pageRoute);
            const allPaths = generateAllPaths(pageRoute, staticParams!);

            return Promise.all(
              Object.entries(allPaths).map(async ([generatedPath, params]) => {
                const outputPath = path.join(outDir, `${generatedPath}.html`);
                await renderPage(pagePath, outputPath, { params }, zareConfig);
              }),
            );
          }),
        );

        // Copying all included files and folders
        await Promise.all(
          zareConfig.options.staticDir.map(async staticDest => {
            await fs.mkdir(outDir, { recursive: true });
            await cpDir(staticDest, outDir);
          }),
        );

        logger.done`build complete`;
      } catch (error) {
        if (error instanceof Error)
          logger.error`failed to build project: ${error.message}`;
        process.exit(1);
      }
    });
}
