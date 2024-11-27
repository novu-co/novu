/**
 * Release all packages in the monorepo.
 * 
 * Usage: pnpm release <version>
 * 
 * Known issues:
 * - nx release with independent versioning and updateDependents: "auto" increases patch by the amount of dependencies updated (https://github.com/nrwl/nx/issues/27823)
 */

import { hideBin } from 'yargs/helpers';
import { releaseChangelog, releasePublish, releaseVersion } from 'nx/release/index.js';
import inquirer from 'inquirer';
import yargs from 'yargs/yargs';
import { execa } from 'execa';

(async () => {
  const { dryRun, verbose, ...rest } = yargs(hideBin(process.argv))
    .version(false)
    .option('dryRun', {
      alias: 'd',
      description: 'Whether or not to perform a dry-run of the release process, defaults to true',
      type: 'boolean',
      default: true,
    })
    .option('verbose', {
      description: 'Whether or not to enable verbose logging, defaults to false',
      type: 'boolean',
      default: false,
    })
    .help()
    .parse();

  const specifier = rest._[0];

  if (!specifier) {
    console.error('Missing version! Usage: pnpm release <version>');
    process.exit(1);
  }

  const { workspaceVersion, projectsVersionData } = await releaseVersion({
    projects: ['tag:type:package'],
    specifier,
    dryRun,
    verbose,
    firstRelease: false,
  });

  await releaseChangelog({
    projects: ['tag:type:package'],
    specifier,
    versionData: projectsVersionData,
    version: workspaceVersion,
    dryRun,
    verbose,
  });

  await execa({
    stdout: process.stdout,
    stderr: process.stderr,
  })`pnpm run build:packages --skip-nx-cache`;

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'otp',
      message: 'Enter NPM OTP:',
    },
  ]);

  await releasePublish({
    projects: ['tag:type:package'],
    specifier: 'patch',
    dryRun,
    verbose,
    otp: answers.otp,
  });
})();
