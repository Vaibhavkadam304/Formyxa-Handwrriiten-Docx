"use client";
// ✅ FIX 1: startedRef tracks jobId string — each queued job starts correctly
// ✅ FIX 2: guard in separate effect ([jobId] only) — never re-runs mid-job
// ✅ FIX 3: polling effect only depends on [jobId] — router via ref
// ✅ FIX 4: merged doc stored in sessionStorage (not localStorage) to avoid
//           QuotaExceededError that was crashing the callback before router.replace

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Header from "@/components/header";
import Footer from "@/components/footer";
import ProcessingStatus from "@/components/processing-status";
import { getJob, updateJob, saveJob } from "@/lib/jobStore";

type JobState = "queued" | "processing" | "ready" | "error";
type QueuedJob = { jobId: string; filePath: string };

// ── sessionStorage queue helpers ─────────────────────────────────────────────

function dequeueNextJob(): QueuedJob | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("handwritten_job_queue");
    if (!raw) return null;
    const queue: QueuedJob[] = JSON.parse(raw);
    if (queue.length === 0) return null;
    const [next, ...rest] = queue;
    sessionStorage.setItem("handwritten_job_queue", JSON.stringify(rest));
    return next;
  } catch {
    return null;
  }
}

// ── Accumulated docs helpers ──────────────────────────────────────────────────
// NOTE: we use sessionStorage for accumulated docs — it has no practical size
// limit for this use case, whereas localStorage can throw QuotaExceededError
// when storing 3+ merged TipTap documents (200–600 KB each).

function pushCompletedDoc(doc: any): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem("handwritten_completed_docs");
    const docs: any[] = raw ? JSON.parse(raw) : [];
    docs.push(doc);
    sessionStorage.setItem("handwritten_completed_docs", JSON.stringify(docs));
  } catch (e) {
    console.error("❌ pushCompletedDoc failed:", e);
  }
}

function popAllCompletedDocs(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem("handwritten_completed_docs");
    sessionStorage.removeItem("handwritten_completed_docs");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getQueueLength(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = sessionStorage.getItem("handwritten_job_queue");
    return raw ? (JSON.parse(raw) as any[]).length : 0;
  } catch { return 0; }
}

function getCompletedCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = sessionStorage.getItem("handwritten_completed_docs");
    return raw ? (JSON.parse(raw) as any[]).length : 0;
  } catch { return 0; }
}

/**
 * Merge multiple TipTap docs into one, separated by horizontalRule page dividers.
 */
function mergeTipTapDocs(docs: any[]): any {
  if (docs.length === 0) return { type: "doc", content: [] };
  if (docs.length === 1) return docs[0];

  const merged: any[] = [];
  docs.forEach((doc, i) => {
    merged.push(...(doc?.content ?? []));
    if (i < docs.length - 1) {
      merged.push({ type: "horizontalRule" });
    }
  });
  return { type: "doc", content: merged };
}

/**
 * Store the final merged doc in sessionStorage so PreviewClient can read it.
 * We deliberately AVOID putting it in localStorage to prevent QuotaExceededError —
 * three merged documents can easily be 300–900 KB which exceeds the typical
 * ~5 MB localStorage budget once existing keys are accounted for.
 */
function saveMergedDocForPreview(doc: any): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("handwritten_preview_doc", JSON.stringify(doc));
  } catch (e) {
    console.error("❌ saveMergedDocForPreview failed:", e);
    // Last resort: try localStorage anyway (single-file path already does this)
    try {
      updateJob({ contentJson: doc });
    } catch { /* ignore */ }
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ProcessPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const jobId        = searchParams.get("jobId");

  // Router via ref so the polling effect never needs it as a dependency
  const routerRef = useRef(router);
  useEffect(() => { routerRef.current = router; }, [router]);

  // Tracks which jobId was last started — prevents double-start on re-renders
  const startedJobRef = useRef<string | null>(null);
  const intervalRef   = useRef<NodeJS.Timeout | null>(null);

  const [jobState, setJobState]       = useState<JobState>("processing");
  const [currentFile, setCurrentFile] = useState(1);
  const [totalFiles, setTotalFiles]   = useState(1);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);

  // ── EFFECT 1: one-shot guard ─────────────────────────────────────────────
  // Runs only when jobId changes. Never triggered by state updates or router
  // reference changes, so it can never redirect an already-running job.
  useEffect(() => {
    if (!jobId) {
      routerRef.current.replace("/handwritten-to-doc/upload");
      return;
    }
    const job = getJob();
    if (!job || job.jobId !== jobId || !job.filePath) {
      routerRef.current.replace("/handwritten-to-doc/upload");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  // ── EFFECT 2: OCR start + polling ────────────────────────────────────────
  useEffect(() => {
    if (!jobId) return;

    const job = getJob();
    if (!job || job.jobId !== jobId) return;

    // Update progress counters
    const completed = getCompletedCount();
    const queued    = getQueueLength();
    setCurrentFile(completed + 1);
    setTotalFiles(completed + queued + 1);

    // Start OCR only once per jobId
    if (startedJobRef.current !== jobId) {
      startedJobRef.current = jobId;

      (async () => {
        try {
          const res = await fetch("/api/handwritten/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId, filePath: job.filePath }),
          });

          if (!res.ok) {
            console.error("❌ Failed to start OCR:", await res.text());
            updateJob({ state: "error" });
            setJobState("error");
            return;
          }

          updateJob({ state: "processing" });
          setJobState("processing");
        } catch (err) {
          console.error("❌ OCR start error:", err);
          updateJob({ state: "error" });
          setJobState("error");
        }
      })();
    }

    // Clear any stale interval before setting up a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Poll every 2s
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/job-status?jobId=${jobId}`);
        if (!res.ok) return;

        const data = await res.json() as { state?: string; status?: string; contentJson?: any; detail?: string };
        // Python uses "state". "uploaded"/"queued" are interim — display as processing.
        const rawState = (data.state ?? data.status ?? "") as JobState;
        console.log("[process] poll state=" + rawState);
        const displayState: JobState =
          (rawState === "uploaded" || rawState === "queued") ? "processing" : rawState || "processing";
        updateJob({ state: displayState as any });
        setJobState(displayState);

        if (rawState === "ready" && data.contentJson) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;

          // Accumulate this doc in sessionStorage
          pushCompletedDoc(data.contentJson);

          const nextJob = dequeueNextJob();

          if (nextJob) {
            // More files → start the next job
            saveJob({
              jobId:     nextJob.jobId,
              createdAt: Date.now(),
              filePath:  nextJob.filePath,
              strict:    job.strict ?? true,
              state:     "processing",
              source:    "scanned",
            });
            routerRef.current.replace(
              `/handwritten-to-doc/process?jobId=${nextJob.jobId}`
            );
          } else {
            // ✅ All jobs done
            const allDocs   = popAllCompletedDocs();
            const mergedDoc = mergeTipTapDocs(allDocs);
            saveMergedDocForPreview(mergedDoc);
            updateJob({ state: "ready" });
            routerRef.current.replace(
              `/handwritten-to-doc/preview?jobId=${jobId}`
            );
          }
        } else if (rawState === "error") {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          sessionStorage.removeItem("handwritten_completed_docs");
          sessionStorage.removeItem("handwritten_preview_doc");
          setErrorMsg(
            data.detail ??
            "OCR failed on the server. Check Python logs for: " +
            "missing GOOGLE_VISION_API_KEY / OPENROUTER_API_KEY, or file not found."
          );
        }
      } catch (err) {
        console.error("❌ Polling error:", err);
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobId]);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted/30 px-4">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-8 space-y-5 border border-red-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <h2 className="text-xl font-semibold text-red-600">Processing Failed</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{errorMsg}</p>
            <details className="text-xs text-slate-400 border rounded p-2">
              <summary className="cursor-pointer select-none">Debug info</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">jobId: {jobId}</pre>
            </details>
            <button
              onClick={() => routerRef.current.replace("/handwritten-to-doc/upload")}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <ProcessingStatus state={jobState} />
          {totalFiles > 1 && (
            <p className="text-sm text-slate-500 mt-2">
              Processing page {currentFile} of {totalFiles}…
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}