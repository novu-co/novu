import { hideBin } from 'yargs/helpers';
import { releaseChangelog, releasePublish, releaseVersion } from 'nx/release/index.js';
import inquirer from 'inquirer';
import yargs from 'yargs/yargs';

(async () => {
  const { dryRun, verbose, ...rest } = yargs(hideBin(process.argv))
    .version(false)
    .option('dryRun', {
      alias: 'd',
      description: 'Whether or not to perform a dry-run of the release process, defaults to true',
      type: 'boolean',
      default: false,
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
    specifier,
    dryRun,
    verbose,
    firstRelease: true,
  });

  await releaseChangelog({
    specifier,
    versionData: projectsVersionData,
    version: workspaceVersion,
    dryRun,
    verbose,
    from: 'b77f493e6',
  });

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'otp',
      message: 'Enter NPM OTP:',
    },
  ]);

  const publishStatus = await releasePublish({
    specifier,
    dryRun,
    verbose,
    otp: answers.otp,
  });

  process.exit(publishStatus ?? 1);
})();
