"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Mark, mergeAttributes, Extension } from "@tiptap/core";
import type { JSONContent } from "@tiptap/react";

import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, Code2,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Undo2, Redo2, Download, ZoomIn, ZoomOut,
  RotateCcw, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from "lucide-react";

import { loadJob, updateJob } from "@/lib/jobStore";
import type { JobData } from "@/types/job";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BubbleMenuPos { visible: boolean; top: number; left: number; }
interface ConfidencePopover { open: boolean; original: string; word: string; x: number; y: number; }
interface SlashMenuItem { label: string; description: string; icon: React.ReactNode; action: (ed: ReturnType<typeof useEditor>) => void; }
interface SlashMenuState { open: boolean; x: number; y: number; query: string; selectedIndex: number; from: number; }

// ─── Confidence Mark Extension ─────────────────────────────────────────────

const ConfidenceMark = Mark.create({
  name: "confidence",
  addAttributes() {
    return {
      level:    { default: "low", parseHTML: (el) => el.getAttribute("data-confidence-level") },
      original: { default: "",    parseHTML: (el) => el.getAttribute("data-original") },
    };
  },
  parseHTML() { return [{ tag: "span[data-confidence-level]" }]; },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes({
      "data-confidence-level": HTMLAttributes.level,
      "data-original": HTMLAttributes.original,
      class: `ec-conf-word ec-conf-${HTMLAttributes.level}`,
    }), 0];
  },
});

// ─── Preprocess: convert [?:word] inline markers → confidence marks ────────
// The OCR backend emits text like "farmers [?:crore] all" — we strip the
// brackets and wrap the word in a confidence mark so it looks clean.

function preprocessDoc(node: any): any {
  if (!node || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map(preprocessDoc);

  const clone: any = { ...node };

  if (clone.type === "text" && typeof clone.text === "string") {
    // Pattern: [?:word] — capture the word inside
    const CONF_RE = /\[\?:([^\]]*)\]/g;
    if (!CONF_RE.test(clone.text)) return clone;

    // Split text into segments: plain text + confidence spans
    CONF_RE.lastIndex = 0;
    const segments: any[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = CONF_RE.exec(clone.text)) !== null) {
      if (match.index > lastIdx) {
        segments.push({ type: "text", text: clone.text.slice(lastIdx, match.index), marks: clone.marks ?? [] });
      }
      const word = match[1].trim() || "?";
      segments.push({
        type: "text",
        text: word,
        marks: [
          ...(clone.marks ?? []),
          { type: "confidence", attrs: { level: "low", original: match[0] } },
        ],
      });
      lastIdx = match.index + match[0].length;
    }

    if (lastIdx < clone.text.length) {
      segments.push({ type: "text", text: clone.text.slice(lastIdx), marks: clone.marks ?? [] });
    }

    // Return as array — caller must flatten (handled at content-array level)
    return segments.length === 1 ? segments[0] : segments;
  }

  if (Array.isArray(clone.content)) {
    // Flatten because a single text node may expand to multiple
    const processed = clone.content.map(preprocessDoc);
    clone.content = processed.flat();
  }

  return clone;
}





// ─── Slash Items ───────────────────────────────────────────────────────────

const SLASH_ITEMS: SlashMenuItem[] = [
  { label: "Heading 1",     description: "Large section heading",   icon: <Heading1 size={13} />,    action: (ed) => ed?.chain().focus().toggleHeading({ level: 1 }).run() },
  { label: "Heading 2",     description: "Medium section heading",  icon: <Heading2 size={13} />,    action: (ed) => ed?.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: "Heading 3",     description: "Small section heading",   icon: <Heading3 size={13} />,    action: (ed) => ed?.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: "Bullet List",   description: "Unordered bullet list",   icon: <List size={13} />,        action: (ed) => ed?.chain().focus().toggleBulletList().run() },
  { label: "Numbered List", description: "Ordered numbered list",   icon: <ListOrdered size={13} />, action: (ed) => ed?.chain().focus().toggleOrderedList().run() },
  { label: "Blockquote",    description: "Highlighted quote block", icon: <AlignLeft size={13} />,   action: (ed) => ed?.chain().focus().toggleBlockquote().run() },
  { label: "Code Block",    description: "Monospaced code block",   icon: <Code2 size={13} />,       action: (ed) => ed?.chain().focus().toggleCodeBlock().run() },
];

// ─── Toolbar button helper ─────────────────────────────────────────────────

function TbBtn({ active, onClick, title, children }: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={[
        "inline-flex items-center justify-center w-8 h-8 rounded-md border transition-all duration-100",
        "text-slate-500 cursor-pointer select-none",
        active
          ? "bg-indigo-50 border-indigo-200 text-indigo-600"
          : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function EditorClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [job, setJob] = useState<JobData | null>(null);
  const [fileName, setFileName] = useState("Converted_Document.docx");
  const [saving, setSaving] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  // Split pane
  const [splitPct, setSplitPct] = useState(50);
  const isDraggingDivider = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Image viewer
  const [imgZoom, setImgZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const imagePaneScrollRef = useRef<HTMLDivElement>(null);

  // Ghost overlay
  const [ghostOn, setGhostOn] = useState(false);

  // Floating bubble menu
  const [bubbleMenu, setBubbleMenu] = useState<BubbleMenuPos>({ visible: false, top: 0, left: 0 });
  const bubbleMenuRef = useRef<HTMLDivElement>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);

  // Confidence popover
  const [confPopover, setConfPopover] = useState<ConfidencePopover>({ open: false, original: "", word: "", x: 0, y: 0 });

  // Slash menu
  const [slashMenu, setSlashMenu] = useState<SlashMenuState>({ open: false, x: 0, y: 0, query: "", selectedIndex: 0, from: 0 });
  const slashMenuRef = useRef<HTMLDivElement>(null);

  const imageUrl = jobId ? `/api/job-image?jobId=${jobId}` : "";

  // ── Load job ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!jobId) { router.replace("/handwritten-to-doc/upload"); return; }
    const stored = loadJob();
    if (!stored || stored.jobId !== jobId) { router.replace("/handwritten-to-doc/upload"); return; }
    if (stored.state !== "paid") { router.replace(`/handwritten-to-doc/preview?jobId=${jobId}`); return; }
    if (!stored.contentJson) { router.replace(`/handwritten-to-doc/preview?jobId=${jobId}`); return; }
    setJob(stored);
  }, [jobId, router]);


  function TbBtn({ active, onClick, title, children }: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()} // ← add this
      onClick={onClick}
      title={title}
      className={[
        "inline-flex items-center justify-center w-8 h-8 rounded-md border transition-all duration-100",
        "text-slate-500 cursor-pointer select-none",
        active
          ? "bg-indigo-50 border-indigo-200 text-indigo-600"
          : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

  // ── Editor ────────────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      ConfidenceMark,
      Extension.create({
        name: "slashCommand",
        addKeyboardShortcuts() {
          return {
            "/": () => {
              const { from } = this.editor.state.selection;
              const coords = this.editor.view.coordsAtPos(from);
              const scrollEl = editorScrollRef.current;
              if (!scrollEl) return false;
              const rect = scrollEl.getBoundingClientRect();
              setSlashMenu({ open: true, x: coords.left - rect.left, y: coords.bottom - rect.top + 6, query: "", selectedIndex: 0, from });
              return false;
            },
          };
        },
      }),
    ],
    content: { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: { class: "tiptap outline-none min-h-full font-serif text-sm leading-relaxed px-12 py-10", spellcheck: "true" },
    },
    immediatelyRender: false,
    onUpdate({ editor: ed }) {
      const doc = ed.getJSON() as any;
      updateJob({ contentJson: doc });
      setJob((j) => (j ? { ...j, contentJson: doc } : j));
      setSlashMenu((prev) => {
        if (!prev.open) return prev;
        const { from } = ed.state.selection;
        if (from < prev.from) return { ...prev, open: false };
        const text = ed.state.doc.textBetween(prev.from, from, "");
        if (!text.startsWith("/")) return { ...prev, open: false };
        return { ...prev, query: text.slice(1).toLowerCase() };
      });
    },
  });

  // Load content once (preprocess [?:] markers)
  useEffect(() => {
    if (editor && job?.contentJson) {
      const cleaned = preprocessDoc(job.contentJson);
      editor.commands.setContent(cleaned, false);
    }
  }, [editor, job?.jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Custom bubble menu via selectionchange ─────────────────────────────
  useEffect(() => {
    const editorDom = editor?.view?.dom;
    const scrollEl = editorScrollRef.current;
    if (!editorDom || !scrollEl) return;

    const show = () => {
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { setBubbleMenu((p) => ({ ...p, visible: false })); return; }
        const range = sel.getRangeAt(0);
        if (!editorDom.contains(range.commonAncestorContainer)) { setBubbleMenu((p) => ({ ...p, visible: false })); return; }
        const rRect = range.getBoundingClientRect();
        const sRect = scrollEl.getBoundingClientRect();
        const W = 296;
        let left = rRect.left - sRect.left + rRect.width / 2 - W / 2;
        left = Math.max(4, Math.min(left, sRect.width - W - 4));
        const scrollTop = scrollEl.scrollTop;
        setBubbleMenu({ 
          visible: true, 
          top: rRect.top - sRect.top + scrollTop - 52, 
          left 
        });
      }, 10);
    };

    const hide = () => { const sel = window.getSelection(); if (!sel || sel.isCollapsed) setBubbleMenu((p) => ({ ...p, visible: false })); };

    document.addEventListener("mouseup", show);
    document.addEventListener("selectionchange", hide);
    return () => { document.removeEventListener("mouseup", show); document.removeEventListener("selectionchange", hide); };
  }, [editor]);

  // ── Confidence click ──────────────────────────────────────────────────────
  useEffect(() => {
    const dom = editor?.view.dom;
    if (!dom) return;
    const handler = (e: Event) => {
      const t = (e as MouseEvent).target as HTMLElement;
      if (t.classList.contains("ec-conf-word")) {
        const rect = t.getBoundingClientRect();
        const aRect = editorScrollRef.current?.getBoundingClientRect() ?? rect;
        setConfPopover({ open: true, word: t.textContent ?? "", original: t.getAttribute("data-original") ?? "", x: rect.left - aRect.left, y: rect.bottom - aRect.top + 8 });
      } else {
        setConfPopover((p) => ({ ...p, open: false }));
      }
    };
    dom.addEventListener("click", handler);
    return () => dom.removeEventListener("click", handler);
  }, [editor]);

  // ── Scroll sync ────────────────────────────────────────────────────────────
  // const handleEditorScroll = useCallback(() => {
  //   const el = editorScrollRef.current, im = imagePaneScrollRef.current;
  //   if (!el || !im) return;
  //   const pct = el.scrollTop / (el.scrollHeight - el.clientHeight || 1);
  //   im.scrollTop = pct * (im.scrollHeight - im.clientHeight);
  // }, []);

  // ── Divider drag ──────────────────────────────────────────────────────────
  const startDividerDrag = useCallback((e: React.MouseEvent) => { isDraggingDivider.current = true; e.preventDefault(); }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingDivider.current || !containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setSplitPct(Math.min(80, Math.max(20, ((e.clientX - r.left) / r.width) * 100)));
    };
    const onUp = () => { isDraggingDivider.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  // ── Image zoom & pan ───────────────────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => { e.preventDefault(); setImgZoom((z) => Math.min(4, Math.max(0.3, +(z - e.deltaY * 0.001).toFixed(3)))); }, []);
  const handlePanStart = useCallback((e: React.MouseEvent) => { if (e.button !== 0) return; isPanning.current = true; panStart.current = { x: e.clientX, y: e.clientY }; panOrigin.current = { ...pan }; }, [pan]);
  const handlePanMove = useCallback((e: React.MouseEvent) => { if (!isPanning.current) return; setPan({ x: panOrigin.current.x + (e.clientX - panStart.current.x), y: panOrigin.current.y + (e.clientY - panStart.current.y) }); }, []);
  const handlePanEnd = useCallback(() => { isPanning.current = false; }, []);
  const resetView = useCallback(() => { setImgZoom(1); setPan({ x: 0, y: 0 }); }, []);

  // ── isActive ──────────────────────────────────────────────────────────────
  const isActive = useCallback((name: string, attrs?: Record<string, unknown>) => {
    if (!editor) return false; try { return editor.isActive(name, attrs); } catch { return false; }
  }, [editor]);

  // ── Slash menu ─────────────────────────────────────────────────────────────
  const filteredSlash = slashMenu.query
    ? SLASH_ITEMS.filter((i) => i.label.toLowerCase().includes(slashMenu.query) || i.description.toLowerCase().includes(slashMenu.query))
    : SLASH_ITEMS;

  const applySlashItem = useCallback((item: SlashMenuItem) => {
    if (!editor) return;
    const { from } = editor.state.selection;
    editor.chain().focus().deleteRange({ from: slashMenu.from, to: from }).run();
    item.action(editor);
    setSlashMenu((p) => ({ ...p, open: false }));
  }, [editor, slashMenu.from]);

  useEffect(() => {
    if (!slashMenu.open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSlashMenu((p) => ({ ...p, open: false }));
      else if (e.key === "ArrowDown") { e.preventDefault(); setSlashMenu((p) => ({ ...p, selectedIndex: Math.min(p.selectedIndex + 1, filteredSlash.length - 1) })); }
      else if (e.key === "ArrowUp")   { e.preventDefault(); setSlashMenu((p) => ({ ...p, selectedIndex: Math.max(p.selectedIndex - 1, 0) })); }
      else if (e.key === "Enter")     { e.preventDefault(); const item = filteredSlash[slashMenu.selectedIndex]; if (item) applySlashItem(item); }
    };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  }, [slashMenu.open, slashMenu.selectedIndex, filteredSlash, applySlashItem]);

  useEffect(() => {
    if (!slashMenu.open) return;
    const h = (e: MouseEvent) => { if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node)) setSlashMenu((p) => ({ ...p, open: false })); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [slashMenu.open]);

  // ── Export ─────────────────────────────────────────────────────────────────
  async function handleExport() {
    try {
      setSaving(true); setStatusText(null);
      if (!job?.contentJson) throw new Error("No content");
      const res = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, contentJson: job.contentJson, templateSlug: "default" }),
      });
      if (!res.ok) throw new Error(await res.text() || "Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName.toLowerCase().endsWith(".docx") ? fileName : `${fileName}.docx`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      setStatusText("Downloaded ✓");
    } catch (err) {
      console.error(err); setStatusText("Export failed");
    } finally { setSaving(false); }
  }

  if (!job) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading editor…</p></div>;
  }

  // ────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ── Confidence word highlights ── */
        .ec-conf-word {
          background: rgba(251, 191, 36, 0.18);
          border-bottom: 2px solid rgba(245, 158, 11, 0.6);
          border-radius: 3px;
          padding: 0 2px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ec-conf-word:hover { background: rgba(251, 191, 36, 0.35); }

        /* ── Confidence popover (modern card style) ── */
        .ec-conf-popover {
          position: absolute; z-index: 60;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
          min-width: 210px; max-width: 260px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 30px rgba(0,0,0,0.12);
          pointer-events: none;
          animation: ec-fadeUp 0.15s ease;
        }
        .ec-conf-popover::before {
          content: ''; position: absolute; top: -5px; left: 18px;
          width: 9px; height: 9px; background: #fff;
          border-left: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0;
          transform: rotate(45deg); border-radius: 1px;
        }
        @keyframes ec-fadeUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Slash menu ── */
        .ec-slash-menu {
          position: absolute; z-index: 70;
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 12px; min-width: 240px; overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 16px 40px rgba(0,0,0,0.12);
          animation: ec-fadeUp 0.12s ease;
        }
        .ec-slash-item {
          display: flex; align-items: center; gap: 10px;
          padding: 7px 12px; cursor: pointer; transition: background 0.08s;
        }
        .ec-slash-item:hover, .ec-slash-item.selected { background: #f0f7ff; }
        .ec-slash-icon {
          width: 30px; height: 30px; border-radius: 7px;
          background: #f8fafc; border: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
          color: #64748b; flex-shrink: 0;
        }

        /* ── Ghost layer ── */
        .ec-ghost-layer {
          position: absolute; inset: 0; pointer-events: none;
          background-size: contain; background-repeat: no-repeat;
          background-position: top center;
          opacity: 0.18; mix-blend-mode: multiply; z-index: 0;
        }

        /* ── Floating bubble menu ── */
        .ec-bubble {
        position: absolute; z-index: 55;
        display: flex; align-items: center; gap: 1px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px; padding: 3px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06);
        animation: ec-fadeUp 0.1s ease; pointer-events: all;
      }
      .ec-bbl-btn {
        display: inline-flex; align-items: center; justify-content: center;
        width: 28px; height: 26px; border-radius: 5px;
        border: none; background: transparent;
        color: #64748b; cursor: pointer; transition: background 0.08s, color 0.08s;
        font-size: 12px;
      }
      .ec-bbl-btn:hover { background: #f1f5f9; color: #1e293b; }
      .ec-bbl-btn.active { background: #eff6ff; color: #3b82f6; }
      .ec-bbl-sep { width: 1px; height: 14px; background: #e2e8f0; margin: 0 2px; flex-shrink: 0; }

        /* ── Gutter / resizer ── */
        .ec-gutter {
          width: 10px; flex-shrink: 0;
          background: #e8edf3;
          cursor: col-resize;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
          position: relative;
        }
        .ec-gutter:hover, .ec-gutter:active { background: #c7d2e0; }
        .ec-gutter-dots {
          display: flex; flex-direction: column; gap: 3px; opacity: 0.45;
        }
        .ec-gutter-dot { width: 3px; height: 3px; border-radius: 50%; background: #475569; }

        /* ── Ghost FAB ── */
        .ec-ghost-fab {
          position: absolute; bottom: 20px; right: 14px; z-index: 30;
          width: 38px; height: 38px; border-radius: 50%;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ec-ghost-fab:hover { transform: scale(1.08); box-shadow: 0 4px 16px rgba(0,0,0,0.22); }

        /* ── Text align (tiptap sets style attr) ── */
        .tiptap [style*="text-align: left"]   { text-align: left; }
        .tiptap [style*="text-align: center"] { text-align: center; }
        .tiptap [style*="text-align: right"]  { text-align: right; }
        .tiptap [style*="text-align: justify"]{ text-align: justify; }

        /* ── Toolbar rows ── */
        .ec-toolbar-row1 {
          display: flex; align-items: center;
          height: 48px; padding: 0 16px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid #f0f2f5;
        }
        .ec-tb-sep { width: 1px; height: 20px; background: #e2e8f0; margin: 0 4px; flex-shrink: 0; }

        .ec-image-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.ec-image-scroll::-webkit-scrollbar {
  display: none;
}
        

      `}</style>

      <div className="h-screen flex flex-col" style={{ userSelect: "none" }}>

        {/* ══════════════════════════════════════════════
            ROW 1 — Brand + document name + system actions
        ══════════════════════════════════════════════ */}
        <div className="ec-toolbar-row1">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="font-semibold text-slate-800 text-sm tracking-tight select-none">Formyxa</span>
            <div className="w-px h-5 bg-slate-200" />
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="text-slate-600 text-sm font-medium outline-none bg-transparent hover:bg-slate-50 px-2 py-1 rounded-md transition-colors truncate"
              placeholder="Document name"
              style={{ userSelect: "text", maxWidth: 280 }}
            />
          </div>

          <div className="flex items-center gap-2">
            {statusText && <span className="text-xs text-slate-400 mr-1">{statusText}</span>}
            <button
              disabled={saving}
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 select-none"
            >
              <Download size={14} className="opacity-90" />
              {saving ? "Exporting…" : "Export .docx"}
            </button>
          </div>
        </div>



        {/* ══════════════════════════════════════════════
            SPLIT PANE WORKSPACE
        ══════════════════════════════════════════════ */}
        <div ref={containerRef} className="flex flex-1 overflow-hidden">

          {/* ────────────────────────────────
              LEFT — Original image
              Background: #F9FAFB (reference)
          ──────────────────────────────── */}
          <div
            style={{ width: `${splitPct}%`, minWidth: 0, background: "#F9FAFB" }}
            className="flex flex-col h-full"
          >
            {/* Left header */}
            <div
              className="flex items-center px-3 h-9 flex-shrink-0 select-none"
              style={{ borderBottom: "1px solid #e8edf3", background: "#F9FAFB" }}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original</span>
              <div className="ml-auto flex items-center gap-1">
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors" title="Zoom in" onClick={() => setImgZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}><ZoomIn size={13} /></button>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors" title="Zoom out" onClick={() => setImgZoom((z) => Math.max(0.3, +(z - 0.25).toFixed(2)))}><ZoomOut size={13} /></button>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors" title="Reset" onClick={resetView}><RotateCcw size={12} /></button>
                <span className="text-[10px] text-slate-400 tabular-nums w-9 text-center">{Math.round(imgZoom * 100)}%</span>
              </div>
            </div>

            {/* Image canvas + Ghost FAB */}
            <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
              <div
                ref={imagePaneScrollRef}
                className="w-full h-full overflow-auto flex items-start justify-center ec-image-scroll"
                style={{ cursor: isPanning.current ? "grabbing" : "grab" }}
                onWheel={handleWheel}
                onMouseDown={handlePanStart}
                onMouseMove={handlePanMove}
                onMouseUp={handlePanEnd}
                onMouseLeave={handlePanEnd}
              >
                <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${imgZoom})`, transformOrigin: "top center", marginTop: 24, userSelect: "none" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Handwritten original" className="max-w-full shadow-lg rounded" draggable={false} />
                </div>
              </div>

              {/* ── Ghost FAB — bottom-right of image pane ── */}
              <button
                className="ec-ghost-fab"
                title={ghostOn ? "Turn off ghost overlay" : "Ghost overlay: see handwriting behind editor text"}
                onClick={() => setGhostOn((g) => !g)}
                style={{
                  background: ghostOn ? "#f59e0b" : "white",
                  color: ghostOn ? "white" : "#64748b",
                }}
              >
                {ghostOn ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* ── Gutter (thick, draggable, with grip dots) ── */}
          <div className="ec-gutter" onMouseDown={startDividerDrag} title="Drag to resize panels">
            <div className="ec-gutter-dots">
              {[0,1,2,3,4].map((i) => <div key={i} className="ec-gutter-dot" />)}
            </div>
          </div>

          {/* ────────────────────────────────
              RIGHT — Editor
              Background: pure #FFFFFF (work)
          ──────────────────────────────── */}
          <div
            style={{ width: `${100 - splitPct}%`, minWidth: 0 }}
            className="flex flex-col h-full bg-white"
          >
            {/* Right pane: local toolbar above the document */}
            <div
              className="flex-shrink-0 select-none"
              style={{ borderBottom: "1px solid #eef0f3", background: "#fff" }}
            >
              {/* Label row */}
              <div className="flex items-center px-3 h-7" style={{ borderBottom: "1px solid #f4f6f8" }}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Converted Document</span>
              </div>

              {/* Contextual formatting row — lives above the doc */}
              <div className="flex items-center gap-1 px-2 py-1.5 flex-wrap">

                {/* Headings */}
                <TbBtn active={isActive("heading", { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1"><Heading1 size={13} /></TbBtn>
                <TbBtn active={isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2"><Heading2 size={13} /></TbBtn>
                <TbBtn active={isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3"><Heading3 size={13} /></TbBtn>

                <div className="ec-tb-sep" />

                {/* Inline */}
                <TbBtn active={isActive("bold")}      onClick={() => editor?.chain().focus().toggleBold().run()}      title="Bold"><Bold size={13} /></TbBtn>
                <TbBtn active={isActive("italic")}    onClick={() => editor?.chain().focus().toggleItalic().run()}    title="Italic"><Italic size={13} /></TbBtn>
                <TbBtn active={isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Underline"><UnderlineIcon size={13} /></TbBtn>
                <TbBtn active={isActive("strike")}    onClick={() => editor?.chain().focus().toggleStrike().run()}    title="Strikethrough"><Strikethrough size={13} /></TbBtn>

                <div className="ec-tb-sep" />

                {/* Alignment */}
                <TbBtn active={isActive({ textAlign: "left" })}    onClick={() => editor?.chain().focus().setTextAlign("left").run()}    title="Align left"><AlignLeft size={13} /></TbBtn>
                <TbBtn active={isActive({ textAlign: "center" })}  onClick={() => editor?.chain().focus().setTextAlign("center").run()}  title="Align center"><AlignCenter size={13} /></TbBtn>
                <TbBtn active={isActive({ textAlign: "right" })}   onClick={() => editor?.chain().focus().setTextAlign("right").run()}   title="Align right"><AlignRight size={13} /></TbBtn>
                <TbBtn active={isActive({ textAlign: "justify" })} onClick={() => editor?.chain().focus().setTextAlign("justify").run()} title="Justify"><AlignJustify size={13} /></TbBtn>

                <div className="ec-tb-sep" />

                {/* Lists */}
                <TbBtn active={isActive("bulletList")}  onClick={() => editor?.chain().focus().toggleBulletList().run()}  title="Bullet list"><List size={13} /></TbBtn>
                <TbBtn active={isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Numbered list"><ListOrdered size={13} /></TbBtn>

                <div className="ec-tb-sep" />

                {/* History */}
                <TbBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo"><Undo2 size={13} /></TbBtn>
                <TbBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo"><Redo2 size={13} /></TbBtn>

                {/* Ghost active indicator */}
                {ghostOn && (
                  <div className="ml-auto flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-semibold">
                    <Eye size={10} /> Ghost
                  </div>
                )}
              </div>
            </div>

            {/* Editor scroll area */}
            <div
              ref={editorScrollRef}
              className="flex-1 overflow-y-auto ec-editor-scroll px-6"
              style={{ userSelect: "text", background: "#fff" }}
            >
              {/* Ghost overlay */}
              {ghostOn && <div className="ec-ghost-layer" style={{ backgroundImage: `url(${imageUrl})` }} />}

              <div className="ec-page-wrap max-w-[760px] mx-auto min-h-full relative">

                {/* Floating bubble menu (appears on text selection) */}
                {bubbleMenu.visible && editor && (
                  <div
                    ref={bubbleMenuRef}
                    className="ec-bubble"
                    style={{ top: bubbleMenu.top, left: bubbleMenu.left }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <button
                      onMouseDown={(e) => e.preventDefault()} // ← add to each
                      className={`ec-bbl-btn ${isActive("bold") ? "active" : ""}`}
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      title="Bold"
                    >
                      <Bold size={13} />
                    </button>
                    <button className={`ec-bbl-btn ${isActive("italic") ? "active" : ""}`}    onClick={() => editor.chain().focus().toggleItalic().run()}    title="Italic"><Italic size={13} /></button>
                    <button className={`ec-bbl-btn ${isActive("underline") ? "active" : ""}`} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UnderlineIcon size={13} /></button>
                    <div className="ec-bbl-sep" />
                    <button className={`ec-bbl-btn ${isActive("heading",{level:1}) ? "active" : ""}`} onClick={() => editor.chain().focus().toggleHeading({level:1}).run()} title="H1"><Heading1 size={13} /></button>
                    <div className="ec-bbl-sep" />
                    <button className={`ec-bbl-btn ${isActive("bulletList") ? "active" : ""}`}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Bullets"><List size={13} /></button>
                    <button className={`ec-bbl-btn ${isActive("orderedList") ? "active" : ""}`} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered"><ListOrdered size={13} /></button>
                  </div>
                )}

                <EditorContent editor={editor} />

                {/* Confidence word popover — modern card */}
                {confPopover.open && (
                  <div className="ec-conf-popover" style={{ left: confPopover.x, top: confPopover.y }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#92400e", letterSpacing: "0.04em", textTransform: "uppercase" }}>Uncertain word</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#1e293b", marginBottom: 6 }}>
                      Transcribed as <strong style={{ color: "#0f172a" }}>"{confPopover.word}"</strong>
                    </div>
                    {confPopover.original && (
                      <div style={{ fontSize: 11, color: "#64748b", background: "#f8fafc", borderRadius: 6, padding: "4px 8px", border: "1px solid #e2e8f0" }}>
                        OCR source: <code style={{ color: "#7c3aed" }}>{confPopover.original}</code>
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8, lineHeight: 1.5 }}>
                      Click the word to accept it, or type to correct.
                    </div>
                  </div>
                )}

                {/* Slash command menu */}
                {slashMenu.open && filteredSlash.length > 0 && (
                  <div ref={slashMenuRef} className="ec-slash-menu" style={{ left: slashMenu.x, top: slashMenu.y }}>
                    <div style={{ padding: "7px 12px 5px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" }}>
                      Insert
                    </div>
                    {filteredSlash.map((item, i) => (
                      <div
                        key={item.label}
                        className={`ec-slash-item ${i === slashMenu.selectedIndex ? "selected" : ""}`}
                        onMouseDown={(e) => { e.preventDefault(); applySlashItem(item); }}
                        onMouseEnter={() => setSlashMenu((p) => ({ ...p, selectedIndex: i }))}
                      >
                        <div className="ec-slash-icon">{item.icon}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}