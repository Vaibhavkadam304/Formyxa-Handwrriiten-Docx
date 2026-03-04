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