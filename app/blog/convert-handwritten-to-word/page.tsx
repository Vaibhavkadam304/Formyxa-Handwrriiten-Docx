import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { FileText, ArrowLeft, Clock, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "How to Convert Handwritten Notes to a Word Document | Formyxa Blog",
  description:
    "Stop retyping pages by hand. Learn how AI-powered OCR can turn any handwritten note, form, or scan into a fully editable Word document in seconds.",
}

const sections = [
  {
    id: "why",
    number: "1",
    title: "Why converting handwriting still matters",
    content: [
      "Despite living in a digital-first world, handwritten documents are still everywhere — meeting notes, medical forms, class notes, legal affidavits, onboarding paperwork. Organizations receive and generate millions of handwritten pages each year.",
      "Manually retyping these documents wastes time, introduces errors, and creates bottlenecks. Modern AI-powered OCR (Optical Character Recognition) tools have made it possible to automate this process reliably — even for messy handwriting.",
    ],
  },
  {
    id: "options",
    number: "2",
    title: "Your options for conversion",
    intro: "There are several approaches to converting handwriting to a Word document:",
    bullets: [
      "AI-powered tools like Formyxa — upload an image or PDF and get a structured .docx file back",
      "Google Docs built-in OCR — works for printed text, limited for true handwriting",
      "Microsoft OneNote — can digitize some handwriting but output quality varies",
      "Adobe Acrobat — good for printed scans, weak on cursive or irregular handwriting",
    ],
    content: [
      "For structured documents like forms, applications, and records — where layout preservation matters — a purpose-built tool like Formyxa gives the best results.",
    ],
  },
  {
    id: "using-formyxa",
    number: "3",
    title: "How to do it with Formyxa",
    intro: "The process takes under 60 seconds:",
    bullets: [
      "Upload your handwritten image or PDF (JPG, PNG, PDF supported)",
      "Formyxa's AI processes the document and extracts all text",
      "Preview the extracted content in a structured editor",
      "Download a clean, formatted .docx file ready for Word or Google Docs",
    ],
    content: [
      "Formyxa is optimized for structured documents — it preserves headings, form fields, tables, and multi-column layouts. This makes it ideal for administrative, legal, and HR paperwork.",
    ],
  },
  {
    id: "tips",
    number: "4",
    title: "Tips for best results",
    bullets: [
      "Scan at 300 DPI or higher — phone camera photos work too, just ensure good lighting",
      "Flatten the page before scanning — curved edges reduce accuracy",
      "Avoid heavy shadows across the text",
      "For multi-page documents, upload as a single PDF rather than separate images",
      "If handwriting is very stylized or cursive, review the preview before downloading",
    ],
  },
  {
    id: "after",
    number: "5",
    title: "What to do after conversion",
    content: [
      "The downloaded .docx file opens directly in Microsoft Word, Google Docs, or LibreOffice. From there, you can apply your organization's template, correct any minor OCR errors, add signatures, and distribute.",
      "For documents that need an audit trail or version history, consider uploading the final file to SharePoint, Google Drive, or a document management system right after conversion.",
    ],
  },
]

export default function ConvertHandwrittenToWordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">

        {/* Breadcrumb */}
        <div className="border-b border-border bg-muted/20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Blog
            </Link>
            <span>/</span>
            <span className="text-foreground truncate">How to Convert Handwritten Notes to a Word Document</span>
          </div>
        </div>

        {/* Page header */}
        <div className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 flex items-start gap-5">
            <div className="mt-1 flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                How-To Guide
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground leading-tight">
                How to Convert Handwritten Notes to a Word Document
              </h1>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 8 min read</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> March 14, 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid lg:grid-cols-[220px_1fr] gap-12 items-start">

            {/* Sticky sidebar nav */}
            <nav className="hidden lg:block sticky top-8 space-y-1">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3">
                Contents
              </p>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#section-${s.id}`}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <span className="text-[11px] font-mono text-muted-foreground/50 w-4">{s.number}</span>
                  {s.title}
                </a>
              ))}
              <div className="mt-6 rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-semibold text-foreground mb-1">Try it now</p>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Upload your handwritten doc and get a Word file in seconds.
                </p>
                <Button size="sm" className="w-full text-xs h-8" asChild>
                  <Link href="/handwritten-to-doc/upload">Get Started</Link>
                </Button>
              </div>
            </nav>

            {/* Sections */}
            <div className="space-y-10 min-w-0">
              {sections.map((s, i) => (
                <section key={s.id} id={`section-${s.id}`} className="scroll-mt-8">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-[11px] font-mono text-muted-foreground/50 select-none">
                      {s.number.padStart(2, "0")}
                    </span>
                    <h2 className="text-lg font-semibold text-foreground">{s.title}</h2>
                  </div>
                  <div className="pl-7 space-y-3">
                    {"intro" in s && s.intro && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.intro}</p>
                    )}
                    {"bullets" in s && s.bullets && (
                      <ul className="space-y-2">
                        {s.bullets.map((item, j) => (
                          <li key={j} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                            <span className="mt-[6px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/40" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {"content" in s && s.content?.map((para, j) => (
                      <p key={j} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
                    ))}
                  </div>
                  {i < sections.length - 1 && <div className="mt-10 border-b border-border/50" />}
                </section>
              ))}

              {/* Bottom CTA */}
              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Ready to convert your documents?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload a handwritten image or PDF and get a Word file in under a minute.</p>
                </div>
                <Button size="sm" className="shrink-0 flex items-center gap-1.5" asChild>
                  <Link href="/handwritten-to-doc/upload">Try Formyxa Free <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </div>

              {/* Related posts */}
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Related Articles
                </p>
                <div className="space-y-3">
                  <Link href="/blog/best-handwriting-ocr" className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-all">
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">Best Handwriting OCR Tools Compared in 2026</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </Link>
                  <Link href="/blog/digitize-legal-documents" className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-all">
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">How to Digitize Legal Documents Without Losing Integrity</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}