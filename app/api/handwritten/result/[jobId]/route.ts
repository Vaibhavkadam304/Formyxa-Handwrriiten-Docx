import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


const HANDW_API_BASE = process.env.HANDW_API_BASE!;
const HANDW_API_KEY = process.env.HANDW_API_KEY!;


export async function GET(
  req: Request,
  context: { params: { jobId: string } }
) {
  const { jobId } = context.params;

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing jobId" },
      { status: 400 }
    );
  }

  // const BACKEND_URL = "http://127.0.0.1:8000";

  let res: Response;
  try {
   res = await fetch(
  `${HANDW_API_BASE}/api/job-status?jobId=${jobId}`,
      {
        cache: "no-store",
        headers: {
          "x-api-key": HANDW_API_KEY,
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 503 }
    );
  }

  if (!res.ok) {
    if (res.status === 404) {
      return NextResponse.json(
        { status: "queued" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Backend error" },
      { status: 502 }
    );
  }

  const data = await res.json();

  // Python backend uses `state` field (not `status`) with values:
  // "uploaded" → "queued" → "processing" → "ready" | "error"
  const jobState = data.state;

  if (jobState === "uploaded" || jobState === "queued" || jobState === "processing") {
    return NextResponse.json({ ...data, status: jobState }, { status: 200 });
  }

  if (jobState === "error") {
    return NextResponse.json({ ...data, status: "failed" }, { status: 500 });
  }

  if (jobState === "ready") {
    // contentJson is stored directly on the job (not under data.document)
    if (!data.contentJson || data.contentJson.type !== "doc") {
      return NextResponse.json(
        { error: "Invalid document returned", data },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "completed",
        state: "ready",
        contentJson: data.contentJson,
      },
      { status: 200 }
    );
  }

  // free-ready = digital PDF fast path
  if (jobState === "free-ready") {
    return NextResponse.json({ ...data, status: "free-ready" }, { status: 200 });
  }

  return NextResponse.json(
    { error: "Unknown job state", state: jobState, data },
    { status: 500 }
  );
}