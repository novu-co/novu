export function isDemoIntegration(providerId: string) {
  return providerId === 'novu-email' || providerId === 'novu-sms';
}
