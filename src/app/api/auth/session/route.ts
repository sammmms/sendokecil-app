import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('sendokecil_session');
  const expectedUser = (process.env.ADMIN_USERNAME || 'admin').trim();

  if (sessionCookie && sessionCookie.value.startsWith('auth_')) {
    return NextResponse.json({
      authenticated: true,
      user: { username: expectedUser },
    });
  }

  return NextResponse.json({
    authenticated: false,
    user: null,
  });
}
