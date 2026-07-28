import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type CompletionBody = {
  activityType?: unknown;
  activityId?: unknown;
  submittedOutput?: unknown;
  score?: unknown;
  timeSpent?: unknown;
  attemptsCount?: unknown;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function integerInRange(value: unknown, fallback: number, min: number, max: number) {
  if (value === undefined) return fallback;
  return Number.isInteger(value) ? Math.min(max, Math.max(min, value as number)) : fallback;
}

export async function POST(request: Request) {
  try {
    const requestHeaders = await headers();
    const origin = requestHeaders.get('origin');
    const host = requestHeaders.get('host');
    if (origin && host && new URL(origin).host !== host) {
      return NextResponse.json({ error: 'Cross-origin completion requests are not allowed.' }, { status: 403 });
    }

    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Sign in to save progress.' }, { status: 401 });
    }

    const rawBody: unknown = await request.json();
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json({ error: 'Invalid completion request.' }, { status: 400 });
    }
    const body = rawBody as CompletionBody;
    const activityType = body.activityType;
    if (activityType !== 'lesson' && activityType !== 'challenge' && activityType !== 'daily_login') {
      return NextResponse.json({ error: 'Unsupported activity type.' }, { status: 400 });
    }

    const activityId = activityType === 'daily_login' ? null : body.activityId;
    if (activityId !== null && (typeof activityId !== 'string' || !UUID_PATTERN.test(activityId))) {
      return NextResponse.json(
        { error: 'This curriculum item is not synchronized with the secure course database yet.' },
        { status: 409 }
      );
    }

    const submittedOutput =
      typeof body.submittedOutput === 'string' ? body.submittedOutput.slice(0, 10_000) : null;

    const { data, error } = await supabase.rpc('complete_learning_activity', {
      p_activity_type: activityType,
      p_activity_id: activityId,
      p_submitted_output: submittedOutput,
      p_score: integerInRange(body.score, 100, 0, 100),
      p_time_spent: integerInRange(body.timeSpent, 0, 0, 86_400),
      p_attempts_count: integerInRange(body.attemptsCount, 1, 1, 1_000)
    });

    if (error) {
      const status = error.code === '28000' ? 401 : error.code === '42501' ? 403 : 422;
      return NextResponse.json(
        { error: error.message || 'Unable to complete this activity.' },
        { status }
      );
    }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to complete this activity.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
