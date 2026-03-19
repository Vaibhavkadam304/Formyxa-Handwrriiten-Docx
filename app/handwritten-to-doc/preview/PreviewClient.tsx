"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { loadJob, updateJob } from "@/lib/jobStore";
import type { JobData } from "@/types/job";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";

// ── Render TipTap JSON → safe HTML string ─────────────────────────────────────
function renderHtml(doc: any): string {
  try {
    return generateHTML(doc, [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
    ]);
  } catch {
    return "<p>Preview unavailable</p>";
  }
}

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [job, setJob] = useState<JobData | null>(null);
  const isPaid = job?.state === "paid";

  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [pendingType, setPendingType] = useState<"docx" | "pdf" | null>(null);
  const [state, setState] =
    useState<"preview" | "exporting" | "complete" | "error">("preview");

  const [paymentGateway, setPaymentGateway] =
    useState<"razorpay" | "paypal" | null>(null);
  const [razorpayOptions, setRazorpayOptions] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);

  function countWordsFromTipTap(doc: any): number {
    if (!doc?.content) return 0;
    let text = "";
    const walk = (node: any) => {
      if (!node) return;
      if (node.type === "text" && typeof node.text === "string") text += " " + node.text;
      if (Array.isArray(node.content)) node.content.forEach(walk);
    };
    walk(doc);
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  /* ================= LOAD JOB ================= */
  useEffect(() => {
    if (!jobId) { router.replace("/handwritten-to-doc/upload"); return; }

    const storedJob = loadJob();
    if (!storedJob || storedJob.jobId !== jobId) {
      router.replace("/handwritten-to-doc/upload"); return;
    }
    if (!["ready", "paid"].includes(storedJob.state)) {
      router.replace("/handwritten-to-doc/upload"); return;
    }

    const previewRaw = typeof window !== "undefined"
      ? sessionStorage.getItem("handwritten_preview_doc")
      : null;

    if (previewRaw) {
      try {
        const mergedDoc = JSON.parse(previewRaw);
        sessionStorage.removeItem("handwritten_preview_doc");
        const wordCount = countWordsFromTipTap(mergedDoc);
        try { updateJob({ contentJson: mergedDoc, wordCount }); } catch { /* quota */ }
        setJob({ ...storedJob, contentJson: mergedDoc, wordCount });
        return;
      } catch (e) {
        console.error("❌ Failed to parse preview doc from sessionStorage:", e);
        sessionStorage.removeItem("handwritten_preview_doc");
      }
    }

    if (storedJob.contentJson) {
      const wordCount = countWordsFromTipTap(storedJob.contentJson);
      updateJob({ wordCount });
      setJob({ ...storedJob, wordCount });
      return;
    }

    (async () => {
      try {
        const contentJson = await fetchResult(jobId);
        updateJob({ contentJson });
        const fresh = loadJob();
        if (fresh?.contentJson) setJob(fresh);
      } catch (err) {
        console.error("❌ Failed to load result:", err);
        router.replace("/handwritten-to-doc/upload");
      }
    })();
  }, [jobId, router]);

  /* ================= PAYPAL RETURN ================= */
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;
    async function capturePayPal() {
      try {
        const res = await fetch("/api/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: token }),
        });
        if (!res.ok) throw new Error(await res.text());
        updateJob({ state: "paid" });
        const freshJob = loadJob();
        if (freshJob?.contentJson) setJob(freshJob);
        window.history.replaceState({}, "", `/handwritten-to-doc/preview?jobId=${jobId}`);
      } catch (err) {
        console.error("❌ PayPal capture failed:", err);
      }
    }
    capturePayPal();
  }, [jobId, searchParams]);

  /* ================= DOWNLOAD ================= */
  const handleDownload = async (type: "docx" | "pdf" = "docx") => {
    if (!job?.contentJson) return;
    try {
      setState("exporting");
      const endpoint = type === "pdf" ? "/api/export-pdf" : "/api/export-docx";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: "Converted_Document",
          contentJson: job.contentJson,
          templateSlug: "default",
          designKey: undefined,
          brand: null,
          signatory: null,
        }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "pdf" ? "Converted_Document.pdf" : "Converted_Document.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setState("complete");
    } catch (err) {
      console.error("❌ export failed:", err);
      setState("error");
    }
  };

  /* ================= PAYMENT ================= */
  const handlePaidDownload = async (type: "docx" | "pdf") => {
    if (!job) { router.replace("/handwritten-to-doc/upload"); return; }
    if (isPaid) return;

    const res = await fetch("/api/checkout/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.jobId }),
    });
    if (!res.ok) { alert("Unable to start payment"); return; }

    const data = await res.json();
    setPaymentGateway(data.gateway);
    setPendingType(type);
    setShowPayConfirm(true);

    if (data.gateway === "paypal") {
      (window as any).__PAYPAL_URL__ = data.approveUrl;
      return;
    }
    if (data.gateway === "razorpay") {
      setRazorpayOptions({
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        order_id: data.order.id,
        name: "Handwritten → DOC",
        description: "One-time document conversion",
        handler: () => {
          if (!job) return;
          updateJob({ state: "paid" });
          setJob({ ...job, state: "paid" });
        },
      });
    }
  };

  async function fetchResult(jobId: string) {
    const res = await fetch(`/api/job-status?jobId=${jobId}`);
    if (!res.ok) throw new Error("Result not ready");
    const data = await res.json();
    if (!data.contentJson) throw new Error("Result not ready");
    return data.contentJson;
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading preview…</p>
      </div>
    );
  }

  const previewHtml = job.contentJson ? renderHtml(job.contentJson) : "";
  const wordCount = job.wordCount ?? countWordsFromTipTap(job.contentJson);
  const pageCount = Math.max(1, Math.ceil(wordCount / 250));

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {/* Scoped styles */}
      <style>{`
        .doc-preview-body { font-family: 'Times New Roman', Georgia, serif; font-size: 13px; line-height: 1.7; color: #1e293b; }
        .doc-preview-body h1 { font-size: 18px; font-weight: 700; margin: 0 0 10px; }
        .doc-preview-body h2 { font-size: 15px; font-weight: 600; margin: 14px 0 6px; }
        .doc-preview-body h3 { font-size: 13px; font-weight: 600; margin: 10px 0 4px; }
        .doc-preview-body p  { margin: 0 0 8px; }
        .doc-preview-body ul { list-style: disc; padding-left: 20px; margin: 6px 0; }
        .doc-preview-body ol { list-style: decimal; padding-left: 20px; margin: 6px 0; }
        .doc-preview-body li { margin: 2px 0; }
        .doc-preview-body strong { font-weight: 600; }
        .doc-preview-body blockquote { border-left: 3px solid #e2e8f0; padding-left: 12px; margin: 8px 0; color: #64748b; }
        .doc-preview-body code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-family: monospace; font-size: 12px; }
        .doc-preview-body hr { border: none; border-top: 1px solid #e2e8f0; margin: 12px 0; }

        /* Pulsing dot */
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }

       /* Apply ONLY to your preview container */
        .doc-scroll::-webkit-scrollbar { width: 3px; }
          .doc-scroll::-webkit-scrollbar-track { background: transparent; }
          .doc-scroll::-webkit-scrollbar-thumb {
            background: rgba(100,116,139,0.25);
            border-radius: 10px;
          }
      `}</style>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 bg-slate-50">
          <section className="mx-auto max-w-7xl px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

              {/* ── LEFT — document area ──────────────────────────────── */}
              <div className="lg:col-span-8 flex flex-col gap-4">

                {/* Unpaid: before/after slider */}
                {!isPaid && job.contentJson && (
                  <BeforeAfterSlider
                    contentJson={job.contentJson}
                    jobId={job.jobId}
                    height={560}
                  />
                )}

                {/* Paid: clean HTML document preview */}
                {isPaid && previewHtml && (
                  <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Converted Document</span>
                      <div className="flex gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
                      </div>
                    </div>
                    {/* <div className="overflow-y-auto custom-scroll" style={{ maxHeight: 560 }}> */}
                    <div
                        className="overflow-y-auto"
                        style={{
                          maxHeight: 560,
                          scrollbarWidth: "thin",
                          scrollbarColor: "rgba(100,116,139,0.25) transparent",
                        }}
                      >
                      <div className="mx-auto my-6 bg-white shadow-md border border-slate-100" style={{ maxWidth: 620, padding: "40px 56px", minHeight: 400 }}>
                        <div
                          className="doc-preview-body"
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT — sticky sidebar ───────────────────────────── */}
              <div className="lg:col-span-4">
                <div className="sticky top-6 space-y-4">

                  {/* ── 1. Status pill (pulsing) ── */}
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
                    <span className="pulse-dot inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-emerald-700">Document ready</span>
                  </div>

                  {/* ── 2. PRIMARY ACTION ── */}
                  <div className="rounded-xl border bg-white p-6 shadow-sm">
                    {!isPaid ? (
                      <>
                        {/* Price above button */}
                        <div className="flex items-baseline justify-between mb-4">
                          <span className="text-sm text-slate-500">One-time unlock</span>
                          <span className="text-xl font-bold text-slate-900">
                            {/* Gateway isn't known yet, show generic */}
                            ₹59 <span className="text-xs font-normal text-slate-400">/ doc</span>
                          </span>
                        </div>

                        {/* CTA with lock icon */}
                        <button
                          onClick={() => handlePaidDownload("docx")}
                          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
                        >
                          {/* Lock SVG */}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-90">
                            <path fillRule="evenodd" d="M8 1a3 3 0 0 0-3 3v1H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1V4a3 3 0 0 0-3-3Zm0 1.5A1.5 1.5 0 0 1 9.5 4v1h-3V4A1.5 1.5 0 0 1 8 2.5ZM8 8a1 1 0 0 1 .75 1.664l.305 1.527a.25.25 0 0 1-.245.309h-1.62a.25.25 0 0 1-.245-.309l.305-1.527A1 1 0 0 1 8 8Z" clipRule="evenodd" />
                          </svg>
                          Unlock Document
                        </button>

                        {/* Social proof row */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                          {/* Avatar stack */}
                          <div className="flex -space-x-2">
                            {["bg-blue-300","bg-purple-300","bg-pink-300","bg-yellow-300","bg-green-300"].map((c, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded-full border-2 border-white ${c}`}
                              />
                            ))}
                          </div>

                          {/* Text */}
                          <span className="whitespace-nowrap">
                            <span className="font-semibold text-slate-700">
                              500+ legal professionals
                            </span>{" "}
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              ✔ Verified
                            </span>{" "}
                            this month
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={() => handleDownload("docx")}
                          disabled={state === "exporting"}
                          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
                        >
                          {state === "exporting" ? "Downloading…" : state === "complete" ? "Downloaded ✓" : "Download DOCX"}
                        </button>
                        <button
                          onClick={() => router.push(`/handwritten-to-doc/editor?jobId=${job.jobId}`)}
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                          Open with Advanced Editor
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── 3. BENEFITS (unpaid only) ── */}
                  {!isPaid && (
                    <div className="rounded-xl border bg-white p-5">
                      <h4 className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">Included</h4>
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Editable Word document</li>
                        <li className="flex items-center gap-2"><span className="text-green-600">✓</span> No watermark</li>
                        <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Instant download</li>
                      </ul>
                    </div>
                  )}

                  {/* ── 4. DOCUMENT STATS ── */}
                  <div className="rounded-xl border bg-white p-5">
                    <h4 className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">Document details</h4>
                    <ul className="space-y-2 text-xs text-slate-500">
                      <li className="flex items-center justify-between">
                        <span>Words</span>
                        <span className="font-bold text-sm text-slate-800">{wordCount}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Pages</span>
                        <span className="font-bold text-sm text-slate-800">{pageCount}</span>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          </section>

          {/* ── PAYMENT MODAL ─────────────────────────────────────────── */}
          {showPayConfirm && pendingType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-[20px] bg-white border border-slate-200 overflow-hidden shadow-xl">

                {/* Icon + title */}
                <div className="px-7 pt-7 pb-5 text-center border-b border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3.5">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 2a4 4 0 0 0-4 4v2H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1V6a4 4 0 0 0-4-4Zm0 1.5A2.5 2.5 0 0 1 12.5 6v2h-5V6A2.5 2.5 0 0 1 10 3.5Z" fill="#2563eb"/>
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-slate-900">Unlock your document</p>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">One-time payment — no subscription</p>
                </div>

                {/* Price */}
                <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-500">Total payable</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[26px] font-semibold tracking-tight text-slate-900">
                      {paymentGateway === "paypal" ? "$5" : "₹59"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {paymentGateway === "paypal" ? "USD" : "INR"}
                    </span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="px-7 py-4 border-b border-slate-100 flex flex-col gap-2.5">
                  {["Editable Word document (DOCX)", "No watermark", "Instant download"].map(item => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div className="w-[18px] h-[18px] rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l2.5 2.5L9 1" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-7 py-5 flex flex-col gap-2.5">
                  <button
                    disabled={isPaying}
                    onClick={() => {
                      if (isPaying) return;
                      setIsPaying(true);
                      setShowPayConfirm(false);
                      if (paymentGateway === "paypal") { window.location.href = (window as any).__PAYPAL_URL__; return; }
                      if (paymentGateway === "razorpay" && razorpayOptions) {
                        const rzp = new (window as any).Razorpay({
                          ...razorpayOptions,
                          handler: (r: any) => { setIsPaying(false); razorpayOptions.handler(r); },
                          modal: { ondismiss: () => setIsPaying(false) },
                        });
                        rzp.open();
                      }
                    }}
                    className={`w-full rounded-[10px] py-3 text-sm font-semibold text-white transition-all ${
                      isPaying ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
                    }`}
                  >
                    {isPaying ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                        </svg>
                        Processing…
                      </span>
                    ) : (
                      <>Pay {paymentGateway === "paypal" ? "$5" : "₹59"} &amp; download</>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="#94a3b8">
                      <path d="M8 1a3 3 0 0 0-3 3v1.5h-.5A1.5 1.5 0 0 0 3 7v7A1.5 1.5 0 0 0 4.5 15.5h7A1.5 1.5 0 0 0 13 14V7a1.5 1.5 0 0 0-1.5-1.5H11V4a3 3 0 0 0-3-3Z"/>
                    </svg>
                    <span className="text-[11.5px] text-slate-400">
                      Secured by {paymentGateway === "paypal" ? "PayPal" : "Razorpay"}
                    </span>
                  </div>

                  <button
                    onClick={() => { setIsPaying(false); setShowPayConfirm(false); setPendingType(null); }}
                    className="w-full text-[13px] text-slate-400 hover:text-slate-600 transition py-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}