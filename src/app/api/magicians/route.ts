import { NextResponse } from 'next/server';
import { searchMagicians } from '../../lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || undefined;
    const city = searchParams.get('city') || undefined;
    const service = searchParams.get('service') || undefined;
    const query = searchParams.get('query') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '10');

    const results = await searchMagicians({
      query,
      service,
      state,
      city,
      page,
      pageSize
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching magicians:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
