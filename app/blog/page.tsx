import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { FileText, Search, Scale, ArrowRight, Clock, Calendar } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog | Formyxa – Document Intelligence Guides",
  description:
    "Learn how to convert handwriting to Word docs, compare OCR tools, and digitize legal documents with Formyxa.",
}

const posts = [
  {
    slug: "convert-handwritten-to-word",
    icon: FileText,
    tag: "How-To Guide",
    title: "How to Convert Handwritten Notes to a Word Document",
    excerpt:
      "Stop retyping pages by hand. Learn how AI-powered OCR can turn any handwritten note, form, or scan into a fully editable Word document in seconds.",
    readTime: "8 min read",
    date: "March 14, 2026",
    color: "bg-blue-50 text-blue-600",
  },
  {
    slug: "best-handwriting-ocr",
    icon: Search,
    tag: "Tool Comparison",
    title: "Best Handwriting OCR Tools Compared in 2026",
    excerpt:
      "We tested 12 of the most popular handwriting recognition tools so you don't have to. Here's what actually works — and what to avoid.",
    readTime: "14 min read",
    date: "March 10, 2026",
    color: "bg-violet-50 text-violet-600",
  },
  {
    slug: "digitize-legal-documents",
    icon: Scale,
    tag: "Legal & Compliance",
    title: "How to Digitize Legal Documents Without Losing Integrity",
    excerpt:
      "A practical guide to converting paper legal records into searchable, secure, and court-admissible digital files — without compromising accuracy.",
    readTime: "11 min read",
    date: "March 5, 2026",
    color: "bg-amber-50 text-amber-600",
  },
]

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">

        {/* Page header */}
        <div className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Formyxa Blog
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Document Intelligence Guides
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Practical guides on converting handwriting, comparing OCR tools, and digitizing documents for work and compliance.
            </p>
          </div>
        </div>

        {/* Post list */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="space-y-6">
            {posts.map((post) => {
              const Icon = post.icon
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex items-start gap-5 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <div className={`mt-0.5 flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg ${post.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      {post.tag}
                    </p>
                    <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {post.date}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}