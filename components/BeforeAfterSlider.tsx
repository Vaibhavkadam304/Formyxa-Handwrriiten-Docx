"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface Props {
  contentJson: any;
  originalImageUrl?: string; // served by /api/job-image?jobId=xxx
  jobId?: string;            // fallback if originalImageUrl not passed
  height?: number;           // container height in px (default 520)
}

// ─────────────────────────────────────────────────────────
// Helper – render TipTap JSON → HTML string
// ─────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────
export function BeforeAfterSlider({
  contentJson,
  originalImageUrl,
  jobId,
  height = 520,
}: Props) {
  const [position, setPosition] = useState(50); // 0–100 %
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const htmlContent  = contentJson ? renderHtml(contentJson) : "";

  // Derive image URL: prop > /api/job-image?jobId=xxx > null
  const imgSrc =
    originalImageUrl ||
    (jobId ? `/api/job-image?jobId=${jobId}` : null);

  // ── Drag logic ────────────────────────────────────────
  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - left) / width) * 100));
    setPosition(pct);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onTouchStart = useCallback(() => setDragging(true), []);

  useEffect(() => {
    if (!dragging) return;
    const onMove  = (e: MouseEvent) => updatePosition(e.clientX);
    const onTouch = (e: TouchEvent) => updatePosition(e.touches[0].clientX);
    const onUp    = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("touchmove", onTouch);
    window.addEventListener("touchend",  onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend",  onUp);
    };
  }, [dragging, updatePosition]);

  return (
    <div className="w-full rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-white">

      {/* ── Labels ─────────────────────────────────────── */}
      <div className="flex justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold tracking-wide text-slate-500 uppercase select-none">
        <span>Before — Original Scan</span>
        <span>After — Converted Document</span>
      </div>

      {/* ── Slider container ───────────────────────────── */}
      <div
        ref={containerRef}
        className="relative w-full select-none overflow-hidden"
        style={{ height }}
        onMouseDown={(e) => {
          // allow dragging from anywhere in the container
          updatePosition(e.clientX);
          setDragging(true);
        }}
      >

        {/* ══ RIGHT PANEL — converted document (full width, underneath) ══ */}
        <div
          className="absolute inset-0 overflow-y-auto bg-white"
          style={{ cursor: dragging ? "col-resize" : "default" }}
        >
          <div
            className="px-8 py-6 text-sm leading-relaxed text-slate-800 pointer-events-none"
            style={{ fontFamily: "'Times New Roman', serif", fontSize: 13 }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* ══ LEFT PANEL — original image (clipped to slider position) ══ */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${position}%` }}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt="Original scanned document"
              className="absolute top-0 left-0 h-full object-cover object-left"
              style={{ width: containerRef.current?.offsetWidth ?? "100%" }}
              draggable={false}
            />
          ) : (
            /* Fallback: grey "scan" placeholder */
            <div className="h-full w-full bg-slate-100 flex items-center justify-center">
              <p className="text-xs text-slate-400 rotate-[-30deg] text-center leading-loose">
                Original scan<br />not available
              </p>
            </div>
          )}

          {/* BEFORE badge */}
          <span className="absolute top-3 left-3 bg-slate-800/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            ORIGINAL SCAN
          </span>
        </div>

        {/* ══ DIVIDER HANDLE ══ */}
        <div
          className="absolute top-0 bottom-0 z-20 flex items-center justify-center"
          style={{
            left:      `${position}%`,
            transform: "translateX(-50%)",
            width:     28,
            cursor:    "col-resize",
          }}
          onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e); }}
          onTouchStart={(e) => { e.stopPropagation(); onTouchStart(); }}
        >
          {/* thin line */}
          <div className="absolute inset-y-0 left-1/2 w-0.5 bg-blue-500/80 -translate-x-1/2" />

          {/* pill */}
          <div className="relative z-10 flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 shadow-lg border-2 border-white">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-white fill-current">
              <path d="M5 3l-3 5 3 5V3zm6 0v10l3-5-3-5z" />
            </svg>
          </div>
        </div>

        {/* ══ AFTER badge (always visible on right side) ══ */}
        <div
          className="absolute top-3 z-10 pointer-events-none"
          style={{ left: `calc(${position}% + 18px)` }}
        >
          <span className="bg-emerald-600/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">
            CONVERTED
          </span>
        </div>

      </div>

      {/* ── Hint ───────────────────────────────────────── */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400 select-none">
        ← Drag to compare →
      </div>
    </div>
  );
}