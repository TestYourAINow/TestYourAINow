// app/api/cron/ping-supabase/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { error } = await supabase.storage.from('announcements').list('', { limit: 1 });

    if (error) {
      console.error('Supabase ping failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Supabase ping cron job failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also allow POST for manual testing
export async function POST() {
  return GET();
}
