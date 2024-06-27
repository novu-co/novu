#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand, devCommand, DevCommandOptions } from './commands';

const program = new Command();

program.name('novu').description('A CLI tool to interact with the Novu Platform');

program
  .command('init')
  .description('Initialize a new project and create an account')
  .action(() => {
    initCommand();
  });

program
  .command('dev')
  .description('Start Novu Studio and a localtunnel')
  .option('-p, --port <value>', 'The port for the local Bridge endpoint', '4000')
  .option('-r, --route <value>', 'The Bridge endpoint route', '/api/novu')
  .option('-o, --origin <value>', 'The origin for the Bridge endpoint')
  .option('-r, --region <value>', 'The Novu Cloud region', 'us')
  .option('-w, --web-url <value>', 'The Novu Cloud Web URL', 'https://web.novu.co')
  .option('-sp, --studio-port <value>', 'The port for the Novu Studio server', '2022')
  .action((options: DevCommandOptions) => devCommand(options))
  .parse(process.argv);
