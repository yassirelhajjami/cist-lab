import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db-server';

if (!supabaseAdmin) {
  console.error('[ensure-student] CRITICAL: Supabase admin client not initialized. Ensure SUPABASE_SERVICE_ROLE_KEY is configured.');
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server misconfiguration: Supabase admin client not initialized.' }, { status: 503 });
    }

    // Verify the caller is authenticated via the anon client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Validate the token — get the user from Supabase Auth
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch the profile to confirm it's a student
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.role !== 'student') {
      return NextResponse.json({ error: 'Not a student account' }, { status: 403 });
    }

    // Check if student row already exists (race condition guard)
    const { data: existing } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (existing) {
      // Already exists — return it
      return NextResponse.json({ student: existing });
    }

    // Generate a unique student code by appending a random suffix
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const studentCode = `CIST-${new Date().getFullYear()}-${randomPart}`;

    // Insert using service role (bypasses RLS)
    const { data: newStudent, error: insertErr } = await supabaseAdmin
      .from('students')
      .insert({
        profile_id: profile.id,
        student_code: studentCode,
        grade: profile.grade || 'Grade 10',
        classroom: 'Room 204',
        status: 'active',
      })
      .select()
      .single();

    if (insertErr) {
      console.error('[ensure-student] Insert failed:', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ student: newStudent });
  } catch (err: unknown) {
    console.error('[ensure-student] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
