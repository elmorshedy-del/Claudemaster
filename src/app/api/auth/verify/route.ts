import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    
    // Get password from environment variable
    const correctPassword = process.env.APP_PASSWORD;
    
    // If no password is set in env, allow access (for local development)
    if (!correctPassword) {
      return NextResponse.json({ success: true });
    }
    
    // Verify password
    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
