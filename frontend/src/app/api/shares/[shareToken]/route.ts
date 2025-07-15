import { NextRequest, NextResponse } from 'next/server';

const NESTJS_BACKEND_URL = process.env.NESTJS_BACKEND_URL || 'http://localhost:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: { shareToken: string } }
) {
  try {
    const response = await fetch(`${NESTJS_BACKEND_URL}/shares/${params.shareToken}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Share not found' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get share API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}