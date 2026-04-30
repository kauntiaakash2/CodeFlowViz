import { NextResponse } from "next/server";
import { buildVisualizationGraph } from "@/lib/visualize";

const MAX_CODE_LENGTH = 100_000;

type VisualizeRequestBody = {
  code?: unknown;
};

export async function POST(request: Request) {
  let payload: VisualizeRequestBody;

  try {
    payload = (await request.json()) as VisualizeRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Invalid JSON payload.",
        },
      },
      { status: 400 },
    );
  }

  if (typeof payload.code !== "string") {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Invalid input. 'code' must be a string.",
        },
      },
      { status: 400 },
    );
  }

  if (payload.code.length > MAX_CODE_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: `Input too large. Maximum ${MAX_CODE_LENGTH} characters allowed.`,
        },
      },
      { status: 413 },
    );
  }

  const result = buildVisualizationGraph(payload.code);

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: 200 });
}
