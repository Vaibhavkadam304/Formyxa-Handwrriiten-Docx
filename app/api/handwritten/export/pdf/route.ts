// app/api/handwritten/export/pdf/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const pythonUrl =
    process.env.PY_EXPORT_PDF_URL || "https://formyxa-backend.onrender.com/export/pdf";

  try {
    const body = await req.json();

    const response = await fetch(pythonUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("PDF export service error:", text);
      return new NextResponse(text, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");

    const disposition =
      response.headers.get("Content-Disposition") ||
      'attachment; filename="Converted_Document.pdf"';
    headers.set("Content-Disposition", disposition);

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("PDF export proxy error:", err);
    return new NextResponse(
      JSON.stringify({ error: err.message || "PDF export failed" }),
      { status: 500 }
    );
  }
}
