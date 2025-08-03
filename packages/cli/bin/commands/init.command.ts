import { Command } from 'commander';
import { askInitPrompts } from '../prompts/init.prompt';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger';

export function initCommand(program: Command) {
  program.command('init <folderPath>').action(async (folderPath: string) => {
    try {
      const promptAnswers = await askInitPrompts();

      const templatePath = path.resolve(__dirname, '../../templates/base');
      const destinationPath = path.resolve(process.cwd(), folderPath);

      // Check if template exists
      if (!(await fs.pathExists(templatePath))) {
        logger.error(`Template not found at: ${templatePath}`);
        process.exit(1);
      }

      // Check if destination already exists
      if (await fs.pathExists(destinationPath)) {
        logger.error(`Destination folder already exists: ${destinationPath}`);
        process.exit(1);
      }

      await fs.copy(templatePath, destinationPath);

      logger.info('template copied');

      const packageJsonPath = path.resolve(destinationPath, 'package.json');

      if (await fs.pathExists(packageJsonPath)) {
        logger.action('creating package.json');
        const packageJson = await fs.readJSON(packageJsonPath);

        packageJson.name = promptAnswers.projectName;
        packageJson.scripts = {};
        packageJson.scripts.serve = `zare serve ${folderPath}`;
        packageJson.scripts.build = `zare build ${folderPath}`;

        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        logger.info('package.json created');
      }

      logger.done('project intialized');
    } catch (error) {
      if (error instanceof Error)
        logger.error(`Failed to initialize project: ${error.message}`);
      process.exit(1);
    }
  });
}
