import { createUIMessageStreamResponse } from "ai";
import { getRun } from "workflow/api";
import { WorkflowRunNotFoundError } from "workflow/internal/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const startIndex = searchParams.get("startIndex")
    ? Number.parseInt(searchParams.get("startIndex")!, 10)
    : undefined;

  try {
    const run = getRun(id);
    const stream = run.getReadable({ startIndex });
    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    if (WorkflowRunNotFoundError.is(error)) {
      return new Response("Workflow run not found", { status: 404 });
    }
    throw error;
  }
}
