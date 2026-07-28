import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { unauthenticatedResponse } from '@/lib/server/api-auth';
import { isApprovedWebhookUrl, isRedirectStatus } from '@/lib/server/webhook-security';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthenticatedResponse(user, 'Authentication required.')!;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    const { webhookUrl, payload } = body as { webhookUrl?: unknown; payload?: unknown };
    if (!isApprovedWebhookUrl(webhookUrl)) {
      return NextResponse.json({ error: 'Only approved HTTPS Discord, Slack, or Teams webhooks are allowed.' }, { status: 400 });
    }
    const serializedPayload = JSON.stringify(payload ?? {});
    if (serializedPayload.length > 64_000) {
      return NextResponse.json({ error: 'Webhook payload is too large.' }, { status: 413 });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: serializedPayload,
      signal: AbortSignal.timeout(10_000),
      redirect: 'manual'
    });

    if (isRedirectStatus(response.status)) {
      return NextResponse.json({ error: 'Webhook redirects are not allowed.' }, { status: 502 });
    }
    if (!response.ok) {
      return NextResponse.json({ error: `Webhook provider returned status ${response.status}.` }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
