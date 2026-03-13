// app/api/job-image/route.ts
// Serves the original uploaded file (image or PDF first-page) for the BeforeAfterSlider.

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.HANDW_API_BASE || "http://localhost:8000";
const API_KEY  = process.env.HANDW_API_KEY  || "";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "missing jobId" }, { status: 400 });
  }

  // 1. Fetch the job from the backend to get filePath
  const statusRes = await fetch(`${BACKEND}/api/job-status?jobId=${jobId}`, {
    headers: { "x-api-key": API_KEY },
  });

  if (!statusRes.ok) {
    return NextResponse.json({ error: "job not found" }, { status: 404 });
  }

  const job      = await statusRes.json();
  const filePath = job?.filePath as string | undefined;

  if (!filePath) {
    return NextResponse.json({ error: "no file on job" }, { status: 404 });
  }

  // 2. Ask the backend to stream the raw file
  //    We expose a tiny /api/job-file?path=... endpoint on FastAPI (see below).
  //    This keeps file access server-side and never exposes the real path to the browser.
  const fileRes = await fetch(
    `${BACKEND}/api/job-file?path=${encodeURIComponent(filePath)}`,
    { headers: { "x-api-key": API_KEY } }
  );

  if (!fileRes.ok) {
    return NextResponse.json({ error: "file not found" }, { status: 404 });
  }

  const contentType = fileRes.headers.get("content-type") || "image/png";
  const buffer      = await fileRes.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":  contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}