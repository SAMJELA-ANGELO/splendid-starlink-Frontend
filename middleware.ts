import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/',
];

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/buy',
  '/buy-for-others',
  '/history',
  '/payment',
  '/status',
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if current path is public or protected
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  // If trying to access protected route without token
  if (isProtectedRoute && !token) {
    // Redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login/signup, redirect to dashboard
  if ((pathname === '/auth/login' || pathname === '/auth/signup') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
