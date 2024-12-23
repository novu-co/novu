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

const projects = ['tag:type:package'];

(async () => {
  const { dryRun, verbose, from, ...rest } = yargs(hideBin(process.argv))
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
    .option('from', {
      description:
        'The git reference to use as the start of the changelog. If not set it will attempt to resolve the latest tag and use that.',
      type: 'string',
    })
    .help()
    .parse();

  const specifier = rest._[0];

  if (!specifier) {
    console.error('Missing version! Usage: pnpm release <version>');
    process.exit(1);
  }

  const { workspaceVersion, projectsVersionData } = await releaseVersion({
    projects,
    specifier,
    dryRun,
    verbose,
    firstRelease: false,
  });

  await releaseChangelog({
    projects,
    specifier,
    versionData: projectsVersionData,
    version: workspaceVersion,
    dryRun,
    verbose,
    from,
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
    projects,
    specifier: 'patch',
    dryRun,
    verbose,
    otp: answers.otp,
  });
})();
