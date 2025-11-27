import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // Only delay the /ttfb page
  if (request.nextUrl.pathname === "/ttfb") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/ttfb",
};
