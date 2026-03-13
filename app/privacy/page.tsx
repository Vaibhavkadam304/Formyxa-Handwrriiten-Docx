import Header from "@/components/header"
import Footer from "@/components/footer"
import { Shield } from "lucide-react"

const sections = [
  {
    number: "1",
    title: "Information We Process",
    content: [
      "We process only the information required to perform document conversion. This may include uploaded images or PDF files and the text extracted during processing.",
      "User accounts are not required to use this service.",
    ],
  },
  {
    number: "2",
    title: "How Your Data Is Used",
    content: [
      "Uploaded documents are used solely to convert handwritten or scanned content into editable Word files, and to display a temporary preview for verification.",
      "We do not sell user data, share documents with third parties, or use uploaded files to train AI models.",
    ],
  },
  {
    number: "3",
    title: "File Storage & Retention",
    content: [
      "Files are processed temporarily and automatically deleted after conversion. No long-term document storage is performed.",
    ],
  },
  {
    number: "4",
    title: "Security",
    content: [
      "We use secure processing environments and industry-standard safeguards to protect uploaded documents during conversion.",
    ],
  },
  {
    number: "5",
    title: "Third-Party Services",
    content: [
      "We may use third-party infrastructure providers strictly to perform document processing. These providers are not permitted to store or reuse your data.",
    ],
  },
  {
    number: "6",
    title: "Cookies & Analytics",
    content: [
      "Handwritten → DOC does not use tracking cookies for advertising purposes. Limited analytics may be used to improve site reliability and performance.",
    ],
  },
  {
    number: "7",
    title: "Your Rights",
    content: [
      "You retain full ownership of your documents at all times. If you have questions regarding privacy or data handling, please contact us at the address below.",
    ],
    contact: "support@yourdomain.com",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">

        {/* Page header */}
        <div className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 flex items-start gap-5">
            <div className="mt-1 flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Privacy Policy
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
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
                  key={s.number}
                  href={`#section-${s.number}`}
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
                  key={s.number}
                  id={`section-${s.number}`}
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
                    {s.content.map((para, j) => (
                      <p key={j} className="text-sm text-muted-foreground leading-relaxed">
                        {para}
                      </p>
                    ))}
                    {s.contact && (
                      <a
                        href={`mailto:${s.contact}`}
                        className="inline-block mt-1 text-sm font-medium text-primary hover:underline"
                      >
                        {s.contact}
                      </a>
                    )}
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