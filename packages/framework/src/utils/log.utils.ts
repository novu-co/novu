import chalk from 'chalk';

function info(message: string) {
  return chalk.blue(message);
}

function warning(message: string) {
  return chalk.yellow(message);
}

function error(message: string) {
  return chalk.red(message);
}

function success(message: string) {
  return chalk.green(message);
}

function underline(message: string) {
  return chalk.underline(message);
}

function bold(message: string) {
  return chalk.bold(message);
}

export const EMOJI = {
  SUCCESS: success('✔'),
  ERROR: error('✗'),
  WARNING: warning('⚠'),
  INFO: info('ℹ'),
  ARROW: bold('→'),
  MOCK: info('○'),
  HYDRATED: bold(info('→')),
  STEP: info('σ'),
  ACTION: info('α'),
  DURATION: info('Δ'),
  PROVIDER: info('⚙'),
  OUTPUT: info('⇢'),
  INPUT: info('⇠'),
  WORKFLOW: info('ω'),
  STATE: info('σ'),
  EXECUTE: info('ε'),
  PREVIEW: info('ρ'),
};

const f = {
  info,
  warning,
  error,
  success,
  underline,
  bold,
  emoji: EMOJI,
};

let enabled = true;

export function log(message: string | ((formatter: typeof f) => string)): void {
  if (!enabled) {
    return;
  }

  if (typeof message === 'string') {
    console.log(message);
  } else if (typeof message === 'function') {
    console.log(message(f));
  }
}

log.enable = () => (enabled = true);
log.disable = () => (enabled = false);
