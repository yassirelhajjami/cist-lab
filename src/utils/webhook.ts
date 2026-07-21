// src/utils/webhook.ts

interface WebhookPayload {
  username?: string;
  avatar_url?: string;
  content: string;
  embeds?: Array<{
    title: string;
    description: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp?: string;
  }>;
}

/**
 * Triggers a Discord/Teams webhook and records execution logs locally.
 */
export async function triggerWebhookAlert(
  title: string,
  description: string,
  fields: Array<{ name: string; value: string; inline?: boolean }> = []
) {
  if (typeof window === 'undefined') return;

  // Retrieve setting details
  const settingsRaw = localStorage.getItem('cist_cq_settings');
  let webhookUrl = '';
  let enabled = false;

  if (settingsRaw) {
    try {
      const parsed = JSON.parse(settingsRaw);
      webhookUrl = parsed.webhookUrl || '';
      enabled = !!parsed.webhookEnabled;
    } catch (e) {
      console.error('Failed to parse webhook configurations:', e);
    }
  }

  const logTimestamp = new Date().toISOString();
  const logMessage = `[${logTimestamp}] Fired webhook: "${title}" - ${description}`;

  // Log locally regardless of webhook active status
  try {
    const existingLogsRaw = localStorage.getItem('cist_cq_webhook_logs');
    const logs = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
    logs.unshift(logMessage);
    localStorage.setItem('cist_cq_webhook_logs', JSON.stringify(logs.slice(0, 50))); // Keep last 50 logs
  } catch (err) {
    console.error('Failed to save webhook log:', err);
  }

  if (!enabled || !webhookUrl) {
    console.log('Webhook warning: Slack/Discord webhook is disabled or URL is missing.');
    return;
  }

  // Construct payload (Discord-compatible markdown format)
  const payload: WebhookPayload = {
    username: 'CIST CodeQuest Monitor',
    avatar_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=128&q=80',
    content: `📢 **Platform Event Alert**`,
    embeds: [
      {
        title,
        description,
        color: 12922928, // Maple red color in hex decimal
        fields,
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const response = await fetch('/api/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl, payload })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Server responded with status ${response.status}`);
    }
    console.log('Webhook dispatched successfully!');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to dispatch webhook fetch event:', err);
    // Append error log
    try {
      const existingLogsRaw = localStorage.getItem('cist_cq_webhook_logs');
      const logs = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
      logs.unshift(`[${new Date().toISOString()}] ❌ WEBHOOK ERROR: ${err.message}`);
      localStorage.setItem('cist_cq_webhook_logs', JSON.stringify(logs.slice(0, 50)));
    } catch {}
    return { success: false, error: err.message };
  }
}
