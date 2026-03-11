export const runtime = "nodejs";

const HANDW_API_BASE = process.env.HANDW_API_BASE!;
const HANDW_API_KEY = process.env.HANDW_API_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return new Response(
      JSON.stringify({ error: "jobId missing" }),
      { status: 400 }
    );
  }

  const res = await fetch(
    `${HANDW_API_BASE}/api/job-status?jobId=${jobId}`,
    {
        headers: {
        "x-api-key": HANDW_API_KEY,
        },
        cache: "no-store",
    }
    );

  const text = await res.text();

  // Normalize Python backend state names so the frontend always gets consistent values:
  // Python:   "ready"  → Frontend: "ready"   (was being confused with "completed")
  // Python:   "error"  → Frontend: "error"   (was being confused with "failed")
  // No rename needed — just pass through, but we ensure state is always present.
  let body = text;
  try {
    const parsed = JSON.parse(text);
    // Map old-style status checks to the canonical `state` field
    if (parsed.state && !parsed.status) {
      parsed.status = parsed.state; // expose as both fields for compatibility
      body = JSON.stringify(parsed);
    }
  } catch {
    // not JSON, pass through as-is
  }

  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}