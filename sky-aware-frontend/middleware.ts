// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // ✅ always return something
  return NextResponse.next();
}
