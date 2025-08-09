import { NextRequest, NextResponse } from 'next/server';
import { pixabayService } from '../../../../src/services/pixabayService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination');
  const country = searchParams.get('country');
  const count = parseInt(searchParams.get('count') || '1');

  if (!destination) {
    return NextResponse.json(
      { error: 'Destination parameter is required' },
      { status: 400 }
    );
  }

  try {
    if (count === 1) {
      const imageUrl = await pixabayService.searchDestinationImage(destination, country || undefined);
      return NextResponse.json({ imageUrl });
    } else {
      const imageUrls = await pixabayService.getDestinationImages(destination, country || undefined, count);
      return NextResponse.json({ imageUrls });
    }
  } catch (error) {
    console.error('Error fetching destination image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destination image' },
      { status: 500 }
    );
  }
}