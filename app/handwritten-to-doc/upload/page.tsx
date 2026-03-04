"use client";
// ✅ FIXED: removed duplicate /api/handwritten/process call (ProcessClient handles it)
// ✅ FIXED: saveJob no longer overwrites itself — first job saved, rest queued in sessionStorage

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/header";
import Footer from "@/components/footer";
import UploadArea from "@/components/upload-area";
import { Info, Shield } from "lucide-react";
import { saveJob } from "@/lib/jobStore";

// ─── Simple queue for remaining files when uploading 2-5 at once ─────────────
// ProcessClient reads this after a job completes and automatically starts the next
function saveJobQueue(jobs: { jobId: string; filePath: string }[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("handwritten_job_queue", JSON.stringify(jobs));
}

export default function UploadPage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [strictMode, setStrictMode]       = useState(true);
  const [uploading, setUploading]         = useState(false);

  // Called by UploadArea whenever the file list or strictMode changes
  const handleFileUpload = (files: File[], strict: boolean) => {
    setSelectedFiles(files);
    setStrictMode(strict);
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const startTime = Date.now();

    try {
      // ── 1. Upload ALL files in parallel ──────────────────────────────────
      const results = await Promise.all(
        selectedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/handwritten/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({})) as Record<string, unknown>;
            throw new Error(
              typeof body?.error === "string"
                ? body.error
                : `Failed to upload "${file.name}"`
            );
          }

          const data = await res.json() as {
            mode: "digital" | "scanned";
            filePath: string;
            jobId?: string;
          };

          return { file, ...data };
        })
      );

      // ── 2. Single digital PDF → free-preview (original flow unchanged) ──
      if (results.length === 1 && results[0].mode === "digital") {
        const { file, filePath } = results[0];
        saveJob({
          jobId:     "digital-preview",
          createdAt: startTime,
          filePath,
          file,
          strict:    strictMode,
          state:     "free-ready",
          source:    "digital-pdf",
        });
        setUploading(false);
        router.push("/handwritten-to-doc/free-preview");
        return;
      }

      // ── 3. Scanned (single or batch) ─────────────────────────────────────
      const scannedJobs = results.map((r) => ({
        ...r,
        jobId: r.jobId ?? crypto.randomUUID(),
      }));

      // jobStore only holds ONE job at a time (single localStorage key).
      // Save the FIRST job so ProcessClient can pick it up immediately.
      const first = scannedJobs[0];
      saveJob({
        jobId:     first.jobId,
        createdAt: startTime,
        filePath:  first.filePath,
        file:      first.file,
        strict:    strictMode,
        state:     "processing",
        source:    first.mode === "digital" ? "digital-pdf" : "scanned",
      });

      // Queue remaining files in sessionStorage.
      // ProcessClient will dequeue and start the next file after each job is done.
      if (scannedJobs.length > 1) {
        saveJobQueue(
          scannedJobs.slice(1).map(({ jobId, filePath }) => ({ jobId, filePath }))
        );
      } else {
        sessionStorage.removeItem("handwritten_job_queue");
      }

      setUploading(false);

      // ⚠️  DO NOT call /api/handwritten/process here.
      //     ProcessClient.tsx already calls it on mount.
      //     Calling it here too would start OCR twice → broken job state.
      router.push(`/handwritten-to-doc/process?jobId=${first.jobId}`);

    } catch (err: unknown) {
      console.error(err);
      setUploading(false);
      alert(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <section className="mx-auto max-w-3xl px-4 py-12 space-y-6">
          <UploadArea
            onFileUpload={handleFileUpload}
            selectedFiles={selectedFiles}
            uploading={uploading}
            onConvert={handleConvert}
          />
          <InfoBlock />
        </section>
      </main>
      <Footer />
    </div>
  );
}

function InfoBlock() {
  return (
    <>
      <div className="flex gap-3 bg-muted rounded-lg p-4 border">
        <Info className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Upload up to 5 files at once. Preview before you commit — no credits deducted yet.
        </p>
      </div>
      <div className="flex gap-3 bg-muted/50 rounded-lg p-4 border">
        <Shield className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Files are processed securely and deleted automatically.
        </p>
      </div>
    </>
  );
}