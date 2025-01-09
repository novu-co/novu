export function resolveApiUrl(providedApiUrl?: string): string {
  return providedApiUrl || process.env.NOVU_API_URL || 'https://api.novu.co';
}

export function resolveSecretKey(providedSecretKey?: string): string {
  return providedSecretKey || process.env.NOVU_SECRET_KEY || process.env.NOVU_API_KEY || '';
}

export function resolveLogging(providedLogging?: boolean): boolean {
  if (providedLogging !== undefined) {
    return providedLogging;
  }
  if (process.env.NOVU_LOGGING !== undefined) {
    return process.env.NOVU_LOGGING === 'true';
  }

  // Disable verbose logging in test and production environments
  return ['test', 'production'].includes(process.env.NODE_ENV);
}
