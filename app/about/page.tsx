import Header from "@/components/header"
import Footer from "@/components/footer"
import { Info } from "lucide-react"

const sections = [
  {
    id: "overview",
    number: "1",
    title: "Overview",
    content: [
      "Handwritten → DOC helps individuals and organizations convert handwritten and scanned documents into clean, structured, and fully editable Word files.",
      "The platform is designed for accuracy-first document conversion — especially for forms, applications, records, and official paperwork where wording, structure, and layout matter.",
    ],
  },
  {
    id: "why",
    number: "2",
    title: "Why It Exists",
    content: [
      "Many important documents still exist on paper, including employment applications, government forms, onboarding paperwork, questionnaires, and handwritten submissions.",
      "Traditional OCR tools often struggle with handwriting, tables, and real-world scans. Handwritten → DOC was built specifically to address these challenges with a workflow optimized for structured documents rather than free-form notes.",
    ],
  },
  {
    id: "how-it-works",
    number: "3",
    title: "How It Works",
    intro:
      "The system combines optical character recognition (OCR) with layout-aware AI processing to:",
    bullets: [
      "Extract handwritten or printed text from images and PDFs",
      "Preserve document structure such as headings, tables, and form fields",
      "Generate Word documents that are easy to edit, review, and submit",
    ],
  },
  {
    id: "focus",
    number: "4",
    title: "What We Focus On",
    bullets: [
      "Accuracy over paraphrasing",
      "Structure over free-form text cleanup",
      "Forms and records over casual note-taking",
      "Compatibility with Microsoft Word and Google Docs",
    ],
    content: [
      "The preview shown is for verification only. Final editing is performed in Microsoft Word or Google Docs.",
    ],
  },
  {
    id: "who",
    number: "5",
    title: "Who Uses It",
    bullets: [
      "HR and administrative teams",
      "Institutions and records offices",
      "Professionals handling applications and paperwork",
      "Individuals converting personal documents",
    ],
  },
  {
    id: "privacy",
    number: "6",
    title: "Data & Privacy",
    content: [
      "Files are processed securely and deleted automatically after conversion. Documents are not stored or reused for training.",
    ],
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">

        {/* Page header */}
        <div className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 flex items-start gap-5">
            <div className="mt-1 flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                About Handwritten → DOC
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Accuracy-first document conversion for forms, records, and official paperwork
              </p>
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
                  <span className="text-[11px] font-mono text-muted-foreground/50 w-4">
                    {s.number}
                  </span>
                  {s.title}
                </a>
              ))}
            </nav>

            {/* Sections */}
            <div className="space-y-10 min-w-0">
              {sections.map((s, i) => (
                <section
                  key={s.id}
                  id={`section-${s.id}`}
                  className="scroll-mt-8"
                >
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-[11px] font-mono text-muted-foreground/50 select-none">
                      {s.number.padStart(2, "0")}
                    </span>
                    <h2 className="text-lg font-semibold text-foreground">
                      {s.title}
                    </h2>
                  </div>

                  <div className="pl-7 space-y-3">
                    {"intro" in s && s.intro && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {s.intro}
                      </p>
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
                      <p key={j} className="text-sm text-muted-foreground leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>

                  {i < sections.length - 1 && (
                    <div className="mt-10 border-b border-border/50" />
                  )}
                </section>
              ))}
            </div>

          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}