import { NextRequest, NextResponse } from 'next/server';

const NESTJS_BACKEND_URL = process.env.NESTJS_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json(
                { message: 'Authorization header required' },
                { status: 401 }
            );
        }

        const response = await fetch(`${NESTJS_BACKEND_URL}/shares/my-shares`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log(data)

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to fetch shares' },
                { status: response.status }
            );
        }

        // Check if the backend response indicates failure
        if (!data.success) {
            console.log('Backend returned failure:', data);
            return NextResponse.json(
                { message: data.message || 'Backend request failed' },
                { status: 400 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Get shares API error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}