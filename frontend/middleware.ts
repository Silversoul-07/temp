import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const username = request.cookies.get('username')?.value;
  const path = request.nextUrl.pathname;

  if (!token && !['/login', '/signup'].includes(path)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && ['/login', '/signup'].includes(path)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (path === '/home') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (path === '/collections') {
    return NextResponse.redirect(new URL('/explore', request.url));
  }

  if (username && path === `/p/${username}`) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api|sitemap.xml).*)'],
};