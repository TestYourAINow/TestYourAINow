import { sendEmail } from '@/lib/sendgrid';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { to, subject, text } = await req.json();

  try {
    await sendEmail(to, subject, text);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
