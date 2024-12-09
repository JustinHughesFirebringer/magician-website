import { NextResponse } from 'next/server';
import { getMagicianById } from '../../../../lib/db/queries';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const magician = await getMagicianById(params.id);
    
    if (!magician) {
      return NextResponse.json(
        { error: 'Magician not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(magician);
  } catch (error) {
    console.error('Error fetching magician:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate static params for all magician IDs
export async function generateStaticParams() {
  // Since we're using a database, we'll make this dynamic
  return [];
}
