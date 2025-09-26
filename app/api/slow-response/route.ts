import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const delay = parseInt(searchParams.get("delay") || "1000", 10);

  // Clamp delay to reasonable bounds (100ms to 10s)
  const clampedDelay = Math.max(100, Math.min(delay, 10000));

  // Simulate server processing delay
  await new Promise((resolve) => setTimeout(resolve, clampedDelay));

  return NextResponse.json({
    message: "Response delayed for demonstration",
    delay: clampedDelay,
    timestamp: new Date().toISOString(),
  });
}
