import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import app from '../server';
import { ZareRouter } from '../utils/zareRouter';
import { startWatcher } from '../utils/watcher';
import { logger } from '../utils/logger';
import { loadZareConfig } from '../utils/loadZareConfig';
import express from 'express';

export function serveCommand(program: Command) {
  program.command('serve <projectPath>').action(async (projectPath: string) => {
    try {
      const projectDestination = path.resolve(process.cwd(), projectPath);

      // Check if project directory exist or not
      if (!(await fs.pathExists(projectDestination))) {
        logger.error(`Project folder does not exists: ${projectDestination}`);
        process.exit(1);
      }

      const zareConfigurations = await loadZareConfig(projectDestination);
      const pagesDestination = path.resolve(
        projectDestination,
        zareConfigurations.pages,
      );
      const staticFilesDestination = path.resolve(
        projectDestination,
        zareConfigurations.static,
      );

      // pages as views
      app.set('views', pagesDestination);
      app.use(express.static(staticFilesDestination));

      // Check if project directory exist or not
      if (!(await fs.pathExists(pagesDestination))) {
        logger.error(`Pages folder does not exists: ${pagesDestination}`);
        process.exit(1);
      }

      logger.action('loading files');
      const pagesFile = await fs.readdir(pagesDestination, 'utf-8');

      fileRoutingHandler(pagesFile, pagesDestination);

      const PORT = zareConfigurations.port;
      app.set('port', PORT);

      const server = app.listen(PORT, () => {
        logger.done(`Server is running at http://localhost:${PORT}`);
      });

      startWatcher(pagesDestination, server);
    } catch (error) {
      if (error instanceof Error)
        logger.error(`Failed to build project: ${error.message}`);
      process.exit(1);
    }
  });
}

async function fileRoutingHandler(
  pagesFile: string[],
  pagesDestination: string,
  prefix: string = '',
) {
  const routes: string[] = [];

  for (const file of pagesFile) {
    const filePath = path.resolve(pagesDestination, file).trimEnd();
    const fileExtension = path.extname(filePath).toLowerCase();

    if (fileExtension !== '.zare') {
      const pathStats = await fs.stat(filePath);

      if (!pathStats.isDirectory) {
        // Skip and warn if this is not a zare file and directory
        logger.warn(`can't load ${fileExtension} files`);
        continue;
      }

      logger.action(`loading sub pages of ${file}`);
      const subPagesFileDestination = path.resolve(pagesDestination, file);
      const subPagesFile = await fs.readdir(subPagesFileDestination, 'utf-8');

      fileRoutingHandler(subPagesFile, subPagesFileDestination, file);
      continue;
    }

    const fileBaseName = path.basename(filePath, fileExtension);

    routes.push(`${prefix ? `/${prefix}` : ''}/${fileBaseName}`);
  }
  const router = new ZareRouter(routes);
  router.loadRoutes(app);
  app.use(`/`, router.getRoutes());
}
