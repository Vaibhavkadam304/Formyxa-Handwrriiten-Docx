import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const HANDW_API_BASE = process.env.HANDW_API_BASE!;
const HANDW_API_KEY  = process.env.HANDW_API_KEY!;

// ── Render cold-start poller ─────────────────────────────────────────────────
// Render free/starter instances sleep after inactivity. A single wake-up fetch
// fails with ConnectTimeoutError because the OS TCP connect itself times out
// (Node/undici default: 10 s) before AbortSignal fires.
// We poll the /docs health endpoint up to MAX_WAIT_MS, waiting POLL_INTERVAL_MS
// between attempts, so the server has time to fully start before we upload.
async function waitForBackend(
  maxWaitMs = 90_000,
  pollIntervalMs = 5_000
): Promise<void> {
  const deadline = Date.now() + maxWaitMs;
  let attempt = 0;
  while (Date.now() < deadline) {
    attempt++;
    try {
      // 12 s per attempt — longer than the 10 s undici connect timeout so
      // we always get at least one full TCP-connect attempt per poll cycle.
      const res = await fetch(`${HANDW_API_BASE}/docs`, {
        signal: AbortSignal.timeout(12_000),
      });
      if (res.ok || res.status < 500) {
        console.log(`✅ Backend awake after ${attempt} attempt(s)`);
        return; // server is up
      }
    } catch {
      // connect timeout or network error — server still waking up
    }
    console.log(`⏳ Backend not ready (attempt ${attempt}), retrying in ${pollIntervalMs / 1000}s…`);
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
  throw new Error(
    "Backend did not become available in time. The server may be starting up — please try again in a moment."
  );
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // ── Type check ──────────────────────────────────────────────────────────
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Please upload PDF, JPG, PNG, or GIF files only." },
        { status: 415 }
      );
    }

    // ── Size check ───────────────────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File "${file.name}" exceeds the 10 MB limit.` },
        { status: 413 }
      );
    }

    // ── Read buffer ──────────────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());

    // ── Wake up backend (handles Render cold starts) ─────────────────────────
    // Skip polling for local dev — localhost is always up
    if (!HANDW_API_BASE.includes("localhost") && !HANDW_API_BASE.includes("127.0.0.1")) {
      await waitForBackend();
    }

    // ── Forward to Python backend ────────────────────────────────────────────
    const backendForm = new FormData();
    backendForm.append(
      "file",
      new Blob([buffer], { type: file.type }),
      file.name
    );

    const uploadRes = await fetch(`${HANDW_API_BASE}/api/upload`, {
      method: "POST",
      headers: { "x-api-key": HANDW_API_KEY },
      body: backendForm,
      signal: AbortSignal.timeout(120_000), // 2 min — server is awake now
    });

    if (!uploadRes.ok) {
      const txt = await uploadRes.text();
      throw new Error(`Backend upload failed: ${txt}`);
    }

    const backendData = await uploadRes.json();
    const { filePath } = backendData;

    if (!filePath) {
      throw new Error("Backend did not return filePath");
    }

    // ── PDF type detection ───────────────────────────────────────────────────
    let pdfType: "digital" | "scanned" = "scanned";

    if (file.type === "application/pdf") {
      const detectForm = new FormData();
      detectForm.append(
        "file",
        new Blob([buffer], { type: "application/pdf" }),
        file.name
      );

      const detectRes = await fetch(`${HANDW_API_BASE}/api/detect-pdf-type`, {
        method: "POST",
        headers: { "x-api-key": HANDW_API_KEY },
        body: detectForm,
      });

      if (!detectRes.ok) {
        throw new Error("PDF type detection failed");
      }

      const detectData = await detectRes.json();
      pdfType = detectData.type; // "digital" | "scanned"
    }

    console.log(`📄 [${file.name}] PDF type: ${pdfType}`);

    // ── Response ─────────────────────────────────────────────────────────────
    if (pdfType === "digital") {
      return NextResponse.json({
        mode: "digital",
        filePath,
      });
    }

    return NextResponse.json({
      mode: "scanned",
      jobId: crypto.randomUUID(),
      filePath,
    });

  } catch (err: any) {
    console.error("🔥 upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}