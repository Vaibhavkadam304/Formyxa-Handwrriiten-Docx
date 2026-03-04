"use client";

import { Editor, EditorContent } from "@tiptap/react";
import type {
  BrandProfile,
  SignatoryProfile,
  DocLayoutStyle,
} from "@/types/doc-layout";

interface DocumentPageShellProps {
  editor: Editor;
  layout: DocLayoutStyle;
  brand?: BrandProfile;
  signatory?: SignatoryProfile;
  title?: string;
  zoom: number;
}

export const dummyBrand: BrandProfile = {
  companyName: "ABC Company Pvt. Ltd.",
  logoUrl: "https://dummyimage.com/120x60/ffffff/000000&text=LOGO",
  addressLine1: "123 Business Street",
  addressLine2: "Bangalore, Karnataka, India",
  phone: "+91 90000 00000",
  email: "hr@abccompany.com",
  primaryColor: "#2563EB",
  secondaryColor: "#DBEAFE",
};

export function DocumentPageShell({
  editor,
  layout,
  brand,
  signatory,
  title,
  zoom,
}: DocumentPageShellProps) {
  const pageWidth = layout.pageWidthPx ?? 794;
  const minPageHeight = layout.minPageHeightPx ?? 1123;

  return (
    <div
      className="bg-white mx-auto flex flex-col"
      style={{
        minHeight: minPageHeight,
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
      }}
    >
      {/* BODY – actual TipTap editor */}
      <div className="px-14 py-8 flex-1">
        <EditorContent editor={editor} className="tiptap" />
      </div>
    </div>
  );
}