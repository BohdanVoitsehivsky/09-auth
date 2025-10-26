import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PAGES = ['/sign-in', '/sign-up'];
const PROTECTED_PREFIXES = ['/profile', '/notes'];

const isAuthPage = (pathname: string) => AUTH_PAGES.includes(pathname);
const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // 1) Читаємо кукі з запиту
  let accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // 2) Якщо accessToken немає, але refreshToken є - пробуємо оновити сесію
  if (!accessToken && refreshToken) {
    const sessionResponse = await fetch(`${origin}/api/auth/session`, {
      method: 'GET',
      headers: {
        Cookie: request.headers.get('Cookie') ?? '',
      },
    });

    // 3) Отримуємо нові cookie з відповіді
    const setCookieHeader = sessionResponse.headers.getSetCookie?.() ??
      sessionResponse.headers.get('set-cookie');

    // 4) Якщо сервер повернув нові токени - додаємо їх у відповідь
    if (setCookieHeader) {
      const response = NextResponse.next();

      (Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader])
        .forEach((cookie) => {
          response.headers.append('set-cookie', cookie);
        });

      
      accessToken = 'restored';

      return response; 
    }
  }

  // 6) Якщо користувач вже авторизований і переходить на /sign-in або /sign-up - ведемо на головну
  if (accessToken && isAuthPage(pathname)) {
    const destination = request.nextUrl.clone();
    destination.pathname = '/';
    return NextResponse.redirect(destination);
  }

  // 7) Якщо користувач НЕ авторизований і намагається зайти на приватні маршрути - ведемо на login
  if (!accessToken && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/sign-in';
    return NextResponse.redirect(redirectUrl);
  }

  // 8) Все інше пропускаємо
  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
