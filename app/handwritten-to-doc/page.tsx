import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  ArrowRight,
  FileText,
  Upload,
  Brain,
  Download,
  GraduationCap,
  Users,
  Briefcase,
  Sparkles,
  FileCheck,
  Zap,
} from "lucide-react"
import { Card } from "@/components/ui/card"

export default function HandwrittenToDocPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-12 md:pt-14 md:pb-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-6">
              {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                Powered by AI Vision & OCR
              </div> */}

              <h1 className="text-3xl md:text-4xl lg:text-6xl font-semibold tracking-tight text-balance leading-tight">
                "Stop Retyping. Turn Messy Legal & Professional Scans into Perfect Word Docs in Seconds.
              </h1>

              <p className="text-base md:text-lg text-muted-foreground leading-snug max-w-lg">
               Keep the "fully editable and ready for official use" line—that’s a high-trust signal.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-1">
                <Button
                    size="lg"
                    asChild
                    className="
                      text-base font-medium
                      px-7 py-5
                      h-auto
                      shadow-sm
                      hover:shadow-md
                      transition-all
                    "
                  >
                    <Link href="/handwritten-to-doc/upload">
                      Upload your document
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base font-medium px-8 py-6 h-auto bg-card border-2"
                  asChild
                >
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">No signup required • Files deleted automatically • Handles messy handwriting</p>
            </div>

           <div className="relative">
              <div className="relative grid grid-cols-2 gap-10 items-center">

                  {/* BEFORE */}
                  <div className="relative rounded-2xl border border-primary/30 bg-white p-4 shadow-md">
                    <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Handwritten or scanned document
                    </div>

                    <div className="relative aspect-[3/4] rounded-xl bg-white overflow-hidden border">
                      <Image
                        src="/images/legal-doc1.png"
                        alt="Scanned document"
                        fill
                        priority
                        className="object-contain "
                      />
                    </div>
                  </div>

                  {/* ARROW (FLOW CUE) */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/40 text-3xl select-none">
                    →
                  </div>

                  {/* AFTER */}
                  <div className="relative rounded-2xl bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-primary/10">

                    {/* Label (quiet, confident) */}
                    <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-primary/80">
                      Clean, editable Word document
                    </div>

                    {/* Document shell */}
                    <div className="relative aspect-[3/4] rounded-xl bg-white overflow-hidden shadow-inner">

                      {/* Word chrome */}
                      <div className="absolute top-0 left-0 right-0 h-9 bg-muted/30 border-b flex items-center px-3 text-[10px] text-muted-foreground">
                        Microsoft Word • .docx
                      </div>

                      {/* Document preview */}
                      <Image
                        src="/images/legal-doc1.png"
                        alt="Editable Word document"
                        fill
                        priority
                        className="object-contain pt-9"
                      />

                      {/* Result indicator (replaces AFTER pill) */}
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold tracking-wide">
                        RESULT
                      </div>
                    </div>

                    {/* Trust micro-copy */}
                    <p className="mt-4 text-xs text-muted-foreground">
                      Fully editable · Formatting preserved · Ready for official use
                    </p>

                    {/* Ultra-subtle edge highlight */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-primary/10" />
                  </div>


                </div>

            </div>
          </div>
        </section>

        <div className="flex justify-center py-10">
          <div className="h-px w-24 bg-border/60" />
        </div>

        <section className="pt-14 md:pt-20 pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="text-center space-y-4 mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">
                From handwritten input to publication-ready documents
              </h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                Clean, structured Word files — formatted for official use
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

              {/* BEFORE */}
              <Card className="overflow-hidden shadow-sm border border-border/60 bg-muted/40">
                <div className="aspect-[4/3] bg-muted/30 flex items-center justify-center p-8">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src="/images/handwritten-before1.png"
                      alt="Handwritten notes"
                      fill
                      className="object-cover grayscale-[30%] contrast-90"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground text-center">
                    Difficult to read and share digitally
                  </p>
                </div>
              </Card>

              {/* AFTER */}
              <Card className="overflow-hidden shadow-lg border border-border bg-white relative">
                <span className="absolute top-4 right-4 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Converted Word document
                </span>
                <div className="aspect-[4/3] bg-card border-b border-border p-8">
                  <div className="space-y-6 text-left bg-white rounded-md border border-border/60 p-6 h-full">

                    <div className="font-bold text-base text-foreground">
                      Job Application
                    </div>

                    <div className="text-sm space-y-2">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">Full Name:</span>{" "}
                          Emily Johnson
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Phone:</span>{" "}
                          (555) 123-4567
                        </p>
                        <p className="col-span-2">
                          <span className="font-medium text-foreground">
                            Position Applied For:
                          </span>{" "}
                          Office Assistant
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="text-sm space-y-2">
                      <p className="font-medium text-foreground uppercase tracking-wide">
                        Employment History
                      </p>

                      <div className="border border-border rounded-md overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-muted/30 text-muted-foreground">
                            <tr>
                              <th className="px-2 py-1 text-left text-[11px] font-medium uppercase tracking-wide">Date Range</th>
                              <th className="px-2 py-1 text-left text-[11px] font-medium uppercase tracking-wide">Employer</th>
                              <th className="px-2 py-1 text-left text-[11px] font-medium uppercase tracking-wide">Position</th>
                            </tr>
                          </thead>
                          <tbody className="text-muted-foreground">
                            <tr>
                              <td className="px-2 py-1">05/2020 – 08/2022</td>
                              <td className="px-2 py-1">ABC Company</td>
                              <td className="px-2 py-1">Receptionist</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground pt-2">
                      Converted from handwritten form • Fully editable in Word or Google Docs
                    </p>

                  </div>
                </div>

                <div className="p-6 bg-primary/5">
                  <p className="text-xs text-muted-foreground text-center">
                    Fully editable. Formatting preserved.
                  </p>
                </div>
              </Card>

            </div>
          </div>
        </section>


     <section
        id="how-it-works"
        className="bg-muted/20 py-24 md:py-32 border-y border-border"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, reliable process for converting handwritten documents into
              clean, editable Word files
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload your document",
                description: "JPG, PNG, or PDF files supported",
              },
              {
                step: "02",
                icon: Brain,
                title: "Text is extracted accurately",
                description: "Printed and handwritten text recognized",
              },
              {
                step: "03",
                icon: Sparkles,
                title: "Content is structured",
                description: "Layout, tables, and form fields preserved",
              },
              {
                step: "04",
                icon: Download,
                title: "Download an editable Word file",
                description: "Works with Microsoft Word and Google Docs",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="
                  rounded-xl
                  border border-border
                  bg-white
                  p-8
                  space-y-5
                  shadow-sm
                  hover:shadow-md
                  transition-shadow
                "
              >
                {/* Step label */}
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Step {item.step}
                </span>

                {/* Icon */}
               <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>




       <section className="bg-muted/20 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">
                Who uses this?
              </h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                Used for forms, applications, and official records across industries
              </p>
            </div>

            {/* Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Briefcase,
                  title: "HR & Administration",
                  description:
                    "Convert handwritten applications, onboarding forms, internal records, and compliance paperwork into clean, editable Word documents.",
                },
                {
                  icon: GraduationCap,
                  title: "Institutions & Records Teams",
                  description:
                    "Digitize handwritten or scanned forms, questionnaires, and official documents while preserving structure, tables, and accuracy.",
                },
                {
                  icon: Users,
                  title: "Professionals & Individuals",
                  description:
                    "Prepare clean documents from handwritten notes, meeting records, and personal paperwork for easy editing and submission.",
                },
              ].map((useCase) => (
                <div
                  key={useCase.title}
                  className="rounded-lg border border-border/60 bg-white p-7 space-y-4 transition-shadow hover:shadow-md"
                >
                  {/* Icon */}
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <useCase.icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <h3 className="text-base font-semibold text-foreground">
                    {useCase.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>


        <section className="bg-muted/30 py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="max-w-3xl mx-auto">
              <div
                className="
                  rounded-xl
                  border border-border/60
                  bg-white
                  px-10 py-12 md:px-14 md:py-16
                  text-center
                  space-y-6
                  shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                "
              >
                {/* Heading */}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">
                  Start converting your documents
                </h2>

                {/* CTA */}
                <Button
                  size="lg"
                  asChild
                  className="
                    px-10 py-6 h-auto
                    text-base font-medium
                    shadow-md hover:shadow-lg
                    transition-all
                  "
                >
                  <Link href="/handwritten-to-doc/upload">
                    Upload document
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                {/* Trust line */}
                <p className="text-xs text-muted-foreground">
                  No signup • Files deleted automatically • Secure processing
                </p>
              </div>
            </div>

          </div>
        </section>



      </main>
      <Footer />
    </div>
  )
}
