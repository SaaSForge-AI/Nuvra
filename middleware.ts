import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle /@username -> /u/username
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2).split("/")[0];
    if (username) {
      const url = request.nextUrl.clone();
      url.pathname = `/u/${username}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/@:path*"],
};
