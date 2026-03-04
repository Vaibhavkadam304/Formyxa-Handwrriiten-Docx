"use client";
// ✅ FIXED: Content-Type header was commented out → req.json() was failing
// ✅ FIXED: job.file guard was blocking download (File can't survive localStorage JSON)
// ✅ FIXED: removed dead formData code that was never sent
// ✅ Digital PDF flow: NO LLM — PyMuPDF extracts text on backend → DOCX returned directly

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadJob } from "@/lib/jobStore";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Sparkles } from "lucide-react";

export default function FreePreviewPage() {
  const router = useRouter();
  const [filePath, setFilePath] = useState<string | null>(null);
  const [fileName,  setFileName]  = useState("Converted_Document");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    const stored = loadJob();

    if (!stored || stored.source !== "digital-pdf" || !stored.filePath) {
      router.replace("/handwritten-to-doc/upload");
      return;
    }

    setFilePath(stored.filePath);

    // Derive a nice filename from the stored path, e.g. "uploads/123_contract.pdf" → "contract"
    const base = stored.filePath.split("/").pop() ?? "document";
    setFileName(base.replace(/\.[^.]+$/, "").replace(/^\d+_/, ""));
  }, [router]);

  const handleDownload = async () => {
    if (!filePath) return;

    setLoading(true);
    setError(null);

    try {
      // ✅ Content-Type MUST be set so Next.js route can parse req.json()
      const res = await fetch("/api/export-digital-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "Export failed");
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);

      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${fileName}.docx`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed. Please try again.";
      console.error(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!filePath) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7ff]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border p-8 text-center space-y-6">

          <Sparkles className="h-10 w-10 mx-auto text-primary" />

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Your document is ready 🎉</h1>
            <p className="text-muted-foreground">
              This PDF already contains selectable text — converted instantly,
              no AI processing needed.
            </p>
          </div>

          {/* File name badge */}
          <div className="inline-flex items-center gap-2 rounded-lg bg-muted/50 border px-4 py-2 text-sm font-medium">
            <FileDown className="h-4 w-4 text-muted-foreground" />
            {fileName}.docx
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          <Button
            size="lg"
            className="w-full"
            disabled={loading}
            onClick={handleDownload}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing download…
              </>
            ) : (
              "Download Word file"
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => router.push("/handwritten-to-doc/upload")}
          >
            Convert another document
          </Button>

        </div>
      </main>

      <Footer />
    </div>
  );
}