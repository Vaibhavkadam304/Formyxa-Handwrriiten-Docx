export const runtime = "nodejs";

export async function GET() {
  try {
    const res = await fetch(`${process.env.HANDW_API_BASE}/docs`, {
      signal: AbortSignal.timeout(10000),
    });
    return Response.json({ ok: res.ok });
  } catch {
    return Response.json({ ok: false });
  }
}