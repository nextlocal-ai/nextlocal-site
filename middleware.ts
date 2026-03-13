import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'nl_internal_auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/internal')) return NextResponse.next();

  // Allow the login page through
  if (pathname === '/internal/login') return NextResponse.next();

  const auth = req.cookies.get(COOKIE)?.value;
  if (auth === process.env.INTERNAL_PASSWORD) return NextResponse.next();

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = '/internal/login';
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: '/internal/:path*',
};
