import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUser = (process.env.ADMIN_USERNAME || 'admin').trim();
    const expectedPass = (process.env.ADMIN_PASSWORD || 'sendokecil2026').trim();

    if (username === expectedUser && password === expectedPass) {
      const response = NextResponse.json({
        success: true,
        message: 'Login berhasil',
        user: { username: expectedUser },
      });

      // Set auth cookie
      response.cookies.set({
        name: 'sendokecil_session',
        value: `auth_${Date.now()}_${Buffer.from(expectedUser).toString('base64')}`,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Username atau password salah. Cek file .env (ADMIN_USERNAME & ADMIN_PASSWORD).',
      },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
