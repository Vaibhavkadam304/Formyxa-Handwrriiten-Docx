"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Mark } from "@tiptap/core";

// ─── Inline mark extensions (mirrors JsonEditor) ─────────────────────────────
const UnderlineMark = Mark.create({
  name: "underline",
  parseHTML() { return [{ tag: "u" }, { style: "text-decoration" }]; },
  renderHTML() { return ["u", 0]; },
});

const FontSizeMark = Mark.create({
  name: "fontSize",
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (el: HTMLElement) => el.style.fontSize || null,
        renderHTML: (attrs: { size?: string | null }) =>
          attrs.size ? { style: `font-size: ${attrs.size}` } : {},
      },
    };
  },
  parseHTML() { return [{ style: "font-size" }]; },
  renderHTML({ HTMLAttributes }) { return ["span", HTMLAttributes, 0]; },
});

// ─── Types ──────────────────────────────────────────────────────────────────
interface BeforeAfterSliderProps {
  /** TipTap JSON doc – the "After" (clean text) side */
  contentJson: any;
  /** Optional URL of the original scan – shown on the "Before" side */
  originalImageUrl?: string;
}

// ─── Helper — now uses same extensions as JsonEditor ─────────────────────────
function tiptapToHtml(doc: any): string {
  try {
    return generateHTML(doc, [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      UnderlineMark,
      FontSizeMark,
    ]);
  } catch {
    return "<p>Unable to render preview.</p>";
  }
}

// ─── Simulated scan overlay (used when no real image is supplied) ─────────────
function FakeScannedDoc({ html }: { html: string }) {
  return (
    <div
      className="relative w-full h-full overflow-auto bg-amber-50/60"
      style={{ fontFamily: "'Patrick Hand', cursive, serif" }}
    >
      {/* noise / scan texture */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
          mixBlendMode: "multiply",
        }}
      />
      {/* ruled-line effect */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-10"
        style={{
          backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, #6b9bd2 31px, #6b9bd2 32px)",
          backgroundSize: "100% 32px",
        }}
      />
      {/* skewed, slightly blurry "handwritten" text */}
      <div
        className="relative z-20 p-8 text-slate-700 text-sm leading-8"
        style={{
          filter: "blur(0.4px)",
          transform: "rotate(-0.3deg)",
          color: "#2d3a5a",
          opacity: 0.82,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {/* "ORIGINAL SCAN" badge */}
      <div className="absolute top-4 right-4 z-30 bg-amber-400/80 text-amber-900 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded">
        Original scan
      </div>
    </div>
  );
}

// ─── Clean "After" panel ──────────────────────────────────────────────────────
function CleanDoc({ html }: { html: string }) {
  return (
    <div className="relative w-full h-full overflow-auto bg-white">
      <div
        className="p-8 text-slate-800 text-sm leading-7 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {/* "CONVERTED" badge */}
      <div className="absolute top-4 right-4 z-30 bg-emerald-500/90 text-white text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded">
        Converted
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function BeforeAfterSlider({ contentJson, originalImageUrl }: BeforeAfterSliderProps) {
  const html = tiptapToHtml(contentJson);
  const containerRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50); // percent
  const dragging = useRef(false);

  const onMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100));
    setSplit(pct);
  }, []);

  const onMouseDown = () => { dragging.current = true; };
  const onMouseMove = (e: MouseEvent) => { if (dragging.current) onMove(e.clientX); };
  const onMouseUp   = () => { dragging.current = false; };

  const onTouchMove  = (e: TouchEvent) => { onMove(e.touches[0].clientX); };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend",  onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onMouseUp);
    };
  }, [onMouseMove, onTouchMove]);

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex justify-between text-[11px] font-semibold tracking-wide uppercase text-slate-400 px-1 select-none">
        <span>Before</span>
        <span>After</span>
      </div>

      {/* Slider container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm select-none"
        style={{ height: "520px" }}
      >
        {/* BEFORE (left) — full width, clipped on right */}
        <div className="absolute inset-0 overflow-hidden">
          {originalImageUrl ? (
            <img
              src={originalImageUrl}
              alt="Original scan"
              className="w-full h-full object-cover object-top"
              style={{ filter: "sepia(20%) contrast(90%)" }}
            />
          ) : (
            <FakeScannedDoc html={html} />
          )}
        </div>

        {/* AFTER (right) — clipped to the right portion */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${split}%)` }}
        >
          <CleanDoc html={html} />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 z-30 flex items-center justify-center"
          style={{ left: `calc(${split}% - 1px)`, width: "2px", background: "white" }}
        />

        {/* Drag handle */}
        <div
          className="absolute top-1/2 z-40 flex items-center justify-center -translate-y-1/2 cursor-ew-resize"
          style={{
            left: `calc(${split}% - 18px)`,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
            border: "2px solid #e2e8f0",
          }}
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
        >
          {/* ← → icon */}
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path d="M1 5h14M5 1L1 5l4 4M11 1l4 4-4 4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* PREVIEW watermark overlay (before-side only) */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        >
          <span
            className="text-4xl font-black tracking-[0.25em] text-slate-400/20 uppercase"
            style={{ transform: "rotate(-25deg)" }}
          >
            PREVIEW
          </span>
        </div>
      </div>

      {/* Drag hint */}
      <p className="text-center text-[11px] text-slate-400 select-none">
        ← Drag to compare →
      </p>
    </div>
  );
}