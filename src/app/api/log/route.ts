import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Logging endpoint only available in development' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { type, context, data } = body;

    // Format the log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      context,
      data,
    };

    // Log to server console with formatting
    console.log('\n=== Development Log Entry ===');
    console.log(JSON.stringify(logEntry, null, 2));
    console.log('============================\n');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing log entry:', error);
    return NextResponse.json({ error: 'Invalid log entry' }, { status: 400 });
  }
}
