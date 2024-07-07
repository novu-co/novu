const DEFAULT_ENV_FILE = '.env';

const envFileFromNodeEnv = {
  production: '.env.production',
  test: '.env.test',
  ci: '.env.ci',
  local: '.env',
  dev: '.env.development',
} satisfies Record<string, string>;

/**
 * Get the path to the .env file for the current environment.
 * @param env The current environment.
 * @param configDir The config directory.
 * @returns The path to the .env file.
 */
export function getEnvFileNameForNodeEnv(env: { NODE_ENV: keyof typeof envFileFromNodeEnv }): string {
  const selectedEnvFile = envFileFromNodeEnv[env.NODE_ENV] || DEFAULT_ENV_FILE;

  return selectedEnvFile;
}

/**
 * Converts all the values T of the object to typed template literals.
 * Use this type to convert the env object to a type that can be used to validate the env object.
 */
export type StringifyEnv<T extends Record<string, string | number | boolean | undefined>> = {
  [K in keyof T]: T[K] extends undefined ? never : `${T[K]}`;
};
