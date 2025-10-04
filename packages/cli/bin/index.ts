#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.command.js';
import { buildCommand } from './commands/build.command.js';
import { serveCommand } from './commands/serve.command.js';
import packageJson from '../package.json' with { type: 'json' };

const program = new Command();

program.name('zare').version(packageJson.version);

initCommand(program);
buildCommand(program);
serveCommand(program);

program.parse(process.argv);
