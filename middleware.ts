import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const AUTH_PAGES = ['/sign-in', '/sign-up'];
const PROTECTED_PREFIXES = ['/profile', '/notes'];

const isAuthPage = (pathname: string) => AUTH_PAGES.includes(pathname);
const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const cookieStore = await cookies();

  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  
  if (!accessToken && refreshToken) {
    const sessionResponse = await fetch(`${origin}/api/auth/session`, {
      method: 'GET',
      headers: {
        Cookie: request.headers.get('Cookie') ?? '',
      },
    });

    const setCookieHeader = sessionResponse.headers.getSetCookie?.() ??
      sessionResponse.headers.get('set-cookie');

    
    if (setCookieHeader) {
      const response = NextResponse.next();
      (Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]).forEach((cookie) => {
        response.headers.append('set-cookie', cookie);
      });
      return response; 
    }
  }

  
  if (accessToken && isAuthPage(pathname)) {
    const destination = request.nextUrl.clone();
    destination.pathname = '/';
    return NextResponse.redirect(destination);
  }

  
  if (!accessToken && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/sign-in';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
