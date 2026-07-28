import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST() {
  try {
    const requestHeaders = await headers();
    const origin = requestHeaders.get('origin');
    const host = requestHeaders.get('host');
    if (origin && host && new URL(origin).host !== host) {
      return NextResponse.json({ error: 'Cross-origin badge requests are not allowed.' }, { status: 403 });
    }

    const supabase = createClient(await cookies());
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Sign in to evaluate badge progress.' }, { status: 401 });
    }

    const { data, error } = await supabase.rpc('evaluate_current_student_badges');
    if (error) {
      const status = error.code === '28000' ? 401 : error.code === '42501' ? 403 : 422;
      return NextResponse.json(
        { error: error.message || 'Unable to evaluate badge progress.' },
        { status }
      );
    }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to evaluate badge progress.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
