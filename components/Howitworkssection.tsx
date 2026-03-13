import { Upload, Brain, Sparkles, Download } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload your document",
    description: "JPG, PNG, or PDF files supported",
    detail: "Drag & drop or click to upload any scanned or photographed document.",
  },
  {
    step: "02",
    icon: Brain,
    title: "Text is extracted accurately",
    description: "Printed and handwritten text recognized",
    detail: "AI-powered OCR reads every word — even messy or cursive handwriting.",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Content is structured",
    description: "Layout, tables, and form fields preserved",
    detail: "Headings, tables, bullet points and fields are reconstructed automatically.",
  },
  {
    step: "04",
    icon: Download,
    title: "Download your Word file",
    description: "Works with Microsoft Word and Google Docs",
    detail: "Receive a clean .docx ready to edit, sign, or submit.",
  },
]

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-muted/20 py-24 md:py-32 border-y border-border overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center space-y-3 mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
            Simple process
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            How it works
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Four steps from messy scan to polished, editable Word document
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-6xl mx-auto">

          {/* Horizontal connector line — desktop only */}
          <div
            className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px"
            style={{
              background:
                "repeating-linear-gradient(to right, hsl(var(--border)) 0px, hsl(var(--border)) 6px, transparent 6px, transparent 14px)",
            }}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative flex flex-col items-center text-center group">

                {/* Step number + icon stack */}
                <div className="relative mb-6 z-10">
                  {/* Outer ring — subtle glow on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-primary/5 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300" />

                  <div className="relative w-[72px] h-[72px] rounded-2xl bg-card border border-border shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all duration-300 flex flex-col items-center justify-center gap-0.5">
                    <item.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      {item.step}
                    </span>
                  </div>

                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-sm">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 px-2">
                  <h3 className="text-[15px] font-semibold text-foreground leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.detail}
                  </p>
                </div>

                {/* Mobile connector arrow */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden mt-6 text-border">
                    <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
                      <path d="M8 0 L8 18 M3 13 L8 18 L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Bottom trust strip */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-[12px] text-muted-foreground">
            {[
              "No account required",
              "Files deleted after conversion",
              "Handles messy handwriting",
              "Works with Word & Google Docs",
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-primary/50 inline-block" />
                {t}
              </span>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}