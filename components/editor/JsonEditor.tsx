"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Node, Mark, Extension } from "@tiptap/core";

import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

import { ResizableImage } from "./ResizableImage";

import type { BrandProfile, SignatoryProfile } from "@/types/doc-layout";
import { getLayoutForTemplateSlug } from "@/lib/docLayout";
import { DocumentPageShell } from "./DocumentPageShell";
import { LineHeight } from "@/components/editor/extensions/LineHeight";

type EditorViewMode = "document" | "blog";

type JsonEditorProps = {
  initialDoc: any;
  fileName?: string;
  onFileNameChange?: (name: string) => void;
  onDocChange?: (doc: any) => void;
  onExport?: (doc: any, fileName: string) => Promise<void>;
  onSave?: (doc: any, fileName: string) => Promise<void>;
  initialMode?: EditorViewMode;

  templateSlug?: string;
  designKey?: string;
  brand?: BrandProfile;
  signatory?: SignatoryProfile;

  /** NEW */
  chrome?: "full" | "canvas";
  zoom?: number; // controlled zoom
  onZoomChange?: (z: number) => void;
  onEditorReady?: (editor: any) => void;
  editable?: boolean;
};

// ---------------------------------------------------------------------
const DEFAULT_DOC = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function stripEmptyTextNodes(node: any): any {
  if (!node || typeof node !== "object") return node;

  if (Array.isArray(node)) {
    const processed = node.map(stripEmptyTextNodes).filter((child) => child != null);
    return processed;
  }

  const clone: any = { ...node };

  if (clone.type === "text") {
    const text = clone.text;
    if (typeof text !== "string" || text.length === 0) return null;
    return clone;
  }

  if (Array.isArray(clone.content)) {
    clone.content = clone.content.map(stripEmptyTextNodes).filter((child: any) => child != null);
  }

  if (Array.isArray(clone.marks)) {
    clone.marks = clone.marks.map(stripEmptyTextNodes).filter((m: any) => m != null);
  }

  return clone;
}

function normalizeDoc(doc: any): any {
  if (!doc) return DEFAULT_DOC;

  if (typeof doc === "string") {
    try {
      doc = JSON.parse(doc);
    } catch {
      return DEFAULT_DOC;
    }
  }

  if (typeof doc !== "object") return DEFAULT_DOC;

  if ((doc as any).type !== "doc") {
    doc = { type: "doc", content: Array.isArray((doc as any).content) ? (doc as any).content : [] };
  }

  if (!Array.isArray((doc as any).content)) (doc as any).content = [];

  const cleaned = stripEmptyTextNodes(doc);
  if (!cleaned || typeof cleaned !== "object") return DEFAULT_DOC;
  if (!Array.isArray((cleaned as any).content)) (cleaned as any).content = [];
  return cleaned;
}

// ---------------------------------------------------------------------
// Page Break node
// ---------------------------------------------------------------------
const PageBreak = Node.create({
  name: "pageBreak",
  group: "block",
  atom: true,

  parseHTML() {
    return [{ tag: "hr[data-page-break]" }];
  },

  renderHTML() {
    return ["hr", { "data-page-break": "true", class: "border-t border-dashed my-6" }];
  },
});

// ---------------------------------------------------------------------
// Font Size mark
// ---------------------------------------------------------------------
const FontSizeMark = Mark.create({
  name: "fontSize",

  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize || null,
        renderHTML: (attrs: { size?: string | null }) => (attrs.size ? { style: `font-size: ${attrs.size}` } : {}),
      },
    };
  },

  parseHTML() {
    return [{ style: "font-size" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
});

// ---------------------------------------------------------------------
// Underline mark
// ---------------------------------------------------------------------
const UnderlineMark = Mark.create({
  name: "underline",

  parseHTML() {
    return [{ tag: "u" }, { style: "text-decoration" }];
  },

  renderHTML({ HTMLAttributes }) {
    const style = (HTMLAttributes as any)?.style || "";
    const nextStyle = style.includes("text-decoration")
      ? style
      : [style, "text-decoration: underline;"].filter(Boolean).join(" ");
    return ["span", { ...HTMLAttributes, style: nextStyle }, 0];
  },

  addCommands() {
    return {
      toggleUnderline:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    } as any;
  },
});

// ---------------------------------------------------------------------
// Better list behavior
// ---------------------------------------------------------------------
const BetterListEnter = Extension.create({
  name: "betterListEnter",

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;
        const parent = $from.parent;

        const inList = editor.isActive("bulletList") || editor.isActive("orderedList");
        const isEmptyParagraph = parent.type.name === "paragraph" && parent.textContent.trim().length === 0;

        if (inList && isEmptyParagraph) return editor.commands.liftListItem("listItem");
        return false;
      },
    };
  },
});

// ---------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------
export function JsonEditor({
  initialDoc,
  fileName,
  onFileNameChange,
  onDocChange,
  onExport,
  onSave,
  initialMode,
  templateSlug,
  designKey,
  brand,
  signatory,

  chrome = "full",
  zoom: zoomProp,
  onZoomChange,
  onEditorReady,
  editable = true,
}: JsonEditorProps) {
  const safeInitialDoc = useMemo(() => normalizeDoc(initialDoc), [initialDoc]);
  const isCanvas = chrome === "canvas";

  const [localFileName, setLocalFileName] = useState(fileName);
  const [docJson, setDocJson] = useState<any>(safeInitialDoc);

  const [localZoom, setLocalZoom] = useState(1);
  const zoom = zoomProp ?? localZoom;

  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<EditorViewMode>(initialMode ?? "document");

  const layout = useMemo(() => getLayoutForTemplateSlug(templateSlug, designKey), [templateSlug, designKey]);
  const hasInitializedRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      BetterListEnter,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight,
      LineHeight,

      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,

      ResizableImage.configure({ inline: false, allowBase64: false }),

      FontSizeMark,
      UnderlineMark,
      PageBreak,
    ],
    content: DEFAULT_DOC,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!onDocChange) return;

      const json = editor.getJSON();
      setDocJson(json);
      onDocChange(json);
    },
  });

  useEffect(() => {
    if (editor) onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) return;
    if (!safeInitialDoc) return;
    if (hasInitializedRef.current) return;

    try {
      editor.commands.setContent(safeInitialDoc as any, false);
      setDocJson(safeInitialDoc);
      hasInitializedRef.current = true;
    } catch {
      // ignore
    }
  }, [editor, safeInitialDoc]);

  useEffect(() => setLocalFileName(fileName), [fileName]);

  const toolbarDisabled = !editor || saving || exporting;

  const resetTemplate = () => {
    if (!editor) return;
    editor.commands.setContent(safeInitialDoc);
    setDocJson(safeInitialDoc);
    onDocChange(safeInitialDoc);
  };

  const handleExportClick = async () => {
    if (!docJson) return;
    try {
      setExporting(true);
      await onExport(docJson, localFileName || fileName);
    } finally {
      setExporting(false);
    }
  };

  const handleSaveClick = async () => {
    if (!onSave || !docJson) return;
    try {
      setSaving(true);
      await onSave(docJson, localFileName || fileName);
    } finally {
      setSaving(false);
    }
  };

  const handleZoomChange = (value: number) => {
    if (zoomProp != null) onZoomChange?.(value);
    else setLocalZoom(value);
  };

  const handleFileNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setLocalFileName(next);
    onFileNameChange(next);
  };

  const effectiveMode: EditorViewMode = isCanvas ? "document" : viewMode;

  // -------------------- CANVAS (Figma-style) --------------------
  if (isCanvas) {
    return (
      <div className="w-full py-8 px-4">
        <div id="formyxa-doc-top" />
        <div className="max-w-[8.5in] mx-auto">
          {layout.shellVariant === "page" ? (
            editor ? (
              <DocumentPageShell
                editor={editor}
                layout={layout}
                brand={brand}
                signatory={signatory}
                title={fileName}
                zoom={zoom}
              />
            ) : (
              <div
                className="bg-white p-16 min-h-[11in] flex items-center justify-center"
                style={{ zoom }}
              >
                <p className="text-sm text-slate-400">Loading…</p>
              </div>
            )
          ) : (
            <div
              className="bg-white p-16 min-h-[11in]"
              style={{ zoom }}
            >
              {editor ? <EditorContent editor={editor} className="tiptap" /> : <p className="text-sm text-slate-400">Loading…</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------- FULL (old standalone) --------------------
  return (
    <div className="flex flex-col h-full">
      <header className="border-b bg-white flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-3">
          {onFileNameChange && (
            <input
              className="border-0 bg-transparent text-sm font-medium px-0 py-1 focus:outline-none focus:ring-0"
              value={localFileName}
              onChange={handleFileNameInputChange}
            />
          )}
          <button
            type="button"
            onClick={resetTemplate}
            disabled={toolbarDisabled}
            className="px-2.5 py-1 text-[11px] rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-50"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-full bg-slate-100 p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode("document")}
              className={`px-3 py-0.5 rounded-full font-medium ${
                viewMode === "document" ? "bg-white shadow-sm text-slate-900" : "text-slate-600"
              }`}
            >
              Document
            </button>
            <button
              type="button"
              onClick={() => setViewMode("blog")}
              className={`px-3 py-0.5 rounded-full font-medium ${
                viewMode === "blog" ? "bg-white shadow-sm text-slate-900" : "text-slate-600"
              }`}
            >
              Blog
            </button>
          </div>

          {onSave && (
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={toolbarDisabled}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-primary text-[13px] font-medium text-primary bg-white hover:bg-primary/10 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          )}

          <button
            type="button"
            onClick={handleExportClick}
            disabled={!editor || exporting}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded bg-primary/15 text-primary text-sm font-medium shadow-sm hover:bg-primary/25 disabled:opacity-50 transition-colors"
          >
            {exporting ? "Exporting…" : "Export DOCX"}
          </button>
        </div>
      </header>

      {effectiveMode === "document" ? (
        <main
          className="flex-1 flex justify-center items-start overflow-auto pl-2 pr-4 bg-slate-50"
          style={{ paddingBottom: "40vh" }}
        >
          <div className="py-6">
            {layout.shellVariant === "page" ? (
              editor ? (
                <DocumentPageShell
                  editor={editor}
                  layout={layout}
                  brand={brand}
                  signatory={signatory}
                  title={fileName}
                  zoom={zoom}
                />
              ) : (
                <div className="bg-white mx-auto w-[794px] min-h-[1123px] flex items-center justify-center">
                  <p className="text-sm text-slate-400">Loading…</p>
                </div>
              )
            ) : (
              <div
                className="bg-white mx-auto w-[794px] min-h-[1123px] px-14 py-10 flex flex-col"
                style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
              >
                {editor ? <EditorContent editor={editor} className="tiptap" /> : <p className="text-sm text-slate-400">Loading…</p>}
              </div>
            )}
          </div>
        </main>
      ) : (
        <main className="flex-1 flex overflow-hidden bg-slate-50">
          <div className="flex-1 overflow-auto py-6 px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white px-8 py-8">
                {editor ? <EditorContent editor={editor} className="tiptap" /> : <p className="text-sm text-slate-400">Loading…</p>}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}