import type { Command } from 'commander';
import { askInitPrompts } from '../prompts/init.prompt.js';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger.js';
import { fileURLToPath } from 'url';
import { cpDir } from '../utils/fs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function initCommand(program: Command) {
  program
    .command('init [projectPath]')
    .action(async (defaultPath: string = '') => {
      try {
        const promptAnswers = await askInitPrompts({ defaultPath });

        const destinationPath = path.resolve(
          promptAnswers.projectPath || defaultPath,
        );
        const templatePath = path.resolve(__dirname, '../../templates/base');

        await cpDir(templatePath, destinationPath);
        logger.info`template copied`;

        // update package name generated previously
        if (promptAnswers.packageName) {
          const packageJsonPath = path.join(destinationPath, 'package.json');
          const jsonData = await fs.readJSON(packageJsonPath);
          if (jsonData.name !== promptAnswers.packageName) {
            await fs.writeJSON(
              packageJsonPath,
              {
                ...jsonData,
                name: promptAnswers.packageName,
              },
              { spaces: 2 },
            );
            logger.action`updated package.json`;
          }
        }

        logger.done`project initialized`;
      } catch (error) {
        if (error instanceof Error)
          logger.error`failed to initialize project: ${error.message}`;
        process.exit(1);
      }
    });
}
