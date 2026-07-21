import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { webhookUrl, payload } = await request.json();
    if (!webhookUrl) {
      return NextResponse.json({ error: 'Webhook URL is missing' }, { status: 400 });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: `Webhook returned status ${response.status}: ${text}` }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
