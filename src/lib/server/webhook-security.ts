export const ALLOWED_WEBHOOK_HOSTS = new Set([
  'discord.com',
  'discordapp.com',
  'hooks.slack.com',
  'outlook.office.com'
]);

export function isApprovedWebhookUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.username === '' &&
      url.password === '' &&
      url.port === '' &&
      ALLOWED_WEBHOOK_HOSTS.has(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

export function isRedirectStatus(status: number): boolean {
  return status >= 300 && status < 400;
}
