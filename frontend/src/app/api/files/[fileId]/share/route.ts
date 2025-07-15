import { NextRequest, NextResponse } from 'next/server';

const NESTJS_BACKEND_URL = process.env.NESTJS_BACKEND_URL || 'http://localhost:3000';

export async function POST(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const response = await fetch(`${NESTJS_BACKEND_URL}/files/${params.fileId}/share`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to create share link' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create share API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}