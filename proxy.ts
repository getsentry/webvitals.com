import { type NextRequest, NextResponse } from "next/server";

const DEMO_DELAY = 2000;
const DELAYED_ROUTES = ["/fcp", "/ttfb"];

export async function proxy(request: NextRequest) {
  if (DELAYED_ROUTES.includes(request.nextUrl.pathname)) {
    await new Promise((resolve) => setTimeout(resolve, DEMO_DELAY));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/fcp", "/ttfb"],
};
