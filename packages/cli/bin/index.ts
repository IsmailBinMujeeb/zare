#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.command';
import { buildCommand } from './commands/build.command';
import { serveCommand } from './commands/serve.command';
import { cli } from './config/package.config';

const program = new Command();

program.name('zare').version(cli.version);

initCommand(program);
buildCommand(program);
serveCommand(program);

program.parse(process.argv);
