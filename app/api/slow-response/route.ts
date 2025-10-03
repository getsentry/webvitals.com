import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TTFB_DELAY = 2000; // ms

export async function GET() {
  // Simulate server processing delay
  await new Promise((resolve) => setTimeout(resolve, TTFB_DELAY));

  return NextResponse.json({
    message: "Response delayed for demonstration",
    delay: TTFB_DELAY,
    timestamp: new Date().toISOString(),
  });
}
