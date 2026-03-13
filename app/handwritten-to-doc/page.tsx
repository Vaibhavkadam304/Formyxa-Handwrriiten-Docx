"use client"

import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion } from "framer-motion"
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
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-semibold tracking-tight text-balance leading-tight">
                Turn Handwritten & Scanned Documents into Perfect Word Files in Seconds.
              </h1>

              <p className="text-base md:text-lg text-muted-foreground leading-snug max-w-lg">
                AI-powered OCR that converts messy handwritten or scanned documents into fully editable Word files while preserving original formatting.
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

              <p className="text-sm text-muted-foreground">
                No signup required • Files deleted automatically • Handles messy handwriting
              </p>
            </div>

            {/* ── ANIMATED HERO VISUAL ── */}
            <div className="relative flex items-center justify-center lg:justify-end min-h-[450px]">
              <div className="relative w-full max-w-[500px]">

                {/* 1. BEFORE card — slides left */}
                <motion.div
                  initial={{ x: 0, opacity: 1 }}
                  animate={{ x: -100 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
                  className="relative z-10 w-[240px] rounded-2xl border border-primary/30 bg-white p-4 shadow-md"
                >
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Handwritten Scan
                  </div>
                  <div className="relative aspect-[3/4] rounded-xl bg-white overflow-hidden border">
                    <Image
                      src="/images/legal-doc1.png"
                      alt="Scanned document"
                      fill
                      priority
                      className="object-contain opacity-60 grayscale"
                    />
                  </div>
                </motion.div>

                {/* 2. AFTER card — pops out with spring */}
                <motion.div
                  initial={{ x: 0, opacity: 0, scale: 0.8 }}
                  animate={{ x: 140, opacity: 1, scale: 1 }}
                  transition={{
                    delay: 1.2,
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="absolute top-4 left-0 z-20 w-[260px] rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-primary/20"
                >
                  <div className="mb-3 text-[10px] font-medium uppercase tracking-wider text-primary/80">
                    Clean Word Document
                  </div>
                  <div className="relative aspect-[3/4] rounded-xl bg-white overflow-hidden shadow-inner border border-slate-100">
                    <div className="absolute top-0 left-0 right-0 h-8 bg-blue-50/50 border-b flex items-center px-3 text-[9px] text-blue-600 font-medium">
                      Microsoft Word • .docx
                    </div>
                    <Image
                      src="/images/legal-doc1.png"
                      alt="Editable Word document"
                      fill
                      priority
                      className="object-contain pt-8"
                    />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-blue-600 text-white text-[8px] font-bold">
                      RESULT
                    </div>
                  </div>
                  <p className="mt-4 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <FileCheck className="h-3 w-3" /> Ready for official use
                  </p>
                </motion.div>

                {/* 3. Connecting line — fades in last */}
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 80, opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  className="absolute top-1/2 left-[200px] h-[2px] bg-gradient-to-r from-primary/50 to-transparent hidden md:block"
                />
              </div>
            </div>
            {/* ── END ANIMATED HERO VISUAL ── */}

          </div>
        </section>

        <div className="flex justify-center py-10">
          <div className="h-px w-24 bg-border/60" />
        </div>

        {/* Before / After showcase */}
        <section className="pt-14 md:pt-20 pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    
            {/* Header */}
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">
                From handwritten input to publication-ready documents
              </h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                Clean, structured Word files — formatted for official use
              </p>
            </div>
    
            {/* Cards row */}
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto items-start">
    
              {/* ── BEFORE: Simulated handwritten paper ── */}
              <div className="relative">
                {/* Label */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Handwritten original
                  </span>
                </div>
    
                <div
                  className="relative rounded-xl overflow-hidden border border-border/60 shadow-sm"
                  style={{
                    background: "#fdfaf4",
                    /* subtle warm paper tint */
                  }}
                >
                  {/* Ruled lines */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(transparent, transparent 31px, #c8d8e840 31px, #c8d8e840 32px)",
                      backgroundPositionY: "40px",
                    }}
                  />
    
                  {/* Red margin line */}
                  <div
                    className="absolute top-0 bottom-0 left-[52px] w-px pointer-events-none"
                    style={{ background: "#e8a0a040" }}
                  />
    
                  {/* Paper content */}
                  <div
                    className="relative px-8 pt-7 pb-8 pl-16"
                    style={{ fontFamily: "'Caveat', cursive", minHeight: "380px" }}
                  >
                    {/* Hole punches */}
                    <div className="absolute left-4 top-12 w-4 h-4 rounded-full border-2 border-border/50 bg-background/80" />
                    <div className="absolute left-4 top-1/2 w-4 h-4 rounded-full border-2 border-border/50 bg-background/80" />
                    <div className="absolute left-4 bottom-16 w-4 h-4 rounded-full border-2 border-border/50 bg-background/80" />
    
                    {/* Handwritten content */}
                    <div className="space-y-1">
    
                      {/* Title — slightly slanted, heavy */}
                      <p
                        className="text-[22px] font-bold text-slate-700 mb-4"
                        style={{ transform: "rotate(-0.8deg)", lineHeight: 1.3 }}
                      >
                        Job Application Form
                      </p>
    
                      {/* Fields */}
                      {[
                        { label: "Full Name:", value: "Emily Johnson", rotate: "-0.4deg" },
                        { label: "Phone:", value: "(555) 123-4567", rotate: "0.3deg" },
                        { label: "Position:", value: "Office Assistant", rotate: "-0.6deg" },
                        { label: "Date:", value: "March 3, 2025", rotate: "0.5deg" },
                      ].map((f) => (
                        <p
                          key={f.label}
                          className="text-[17px] text-slate-600 leading-[32px]"
                          style={{ transform: `rotate(${f.rotate})` }}
                        >
                          <span className="text-slate-400 text-[15px]">{f.label}</span>{" "}
                          <span className="text-slate-700 font-semibold">{f.value}</span>
                        </p>
                      ))}
    
                      {/* Divider scribble */}
                      <div className="my-3">
                        <svg width="180" height="8" viewBox="0 0 180 8" fill="none">
                          <path
                            d="M0 4 Q20 1 40 5 Q60 8 80 3 Q100 0 120 5 Q140 8 160 3 Q170 1 180 4"
                            stroke="#94a3b8"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
    
                      <p
                        className="text-[16px] font-bold text-slate-600 mt-1 uppercase tracking-wide"
                        style={{ transform: "rotate(-0.3deg)", fontSize: "15px" }}
                      >
                        Employment History:
                      </p>
    
                      {/* Rough table */}
                      <div
                        className="mt-2 border border-slate-300/70 rounded"
                        style={{ fontFamily: "'Caveat', cursive" }}
                      >
                        {/* Header row */}
                        <div className="grid grid-cols-3 border-b border-slate-300/70 bg-slate-50/60">
                          {["Date Range", "Employer", "Position"].map((h) => (
                            <div
                              key={h}
                              className="px-2 py-1.5 text-[13px] font-semibold text-slate-500"
                              style={{ transform: "rotate(-0.2deg)" }}
                            >
                              {h}
                            </div>
                          ))}
                        </div>
                        {/* Data row */}
                        <div className="grid grid-cols-3">
                          {["05/2020–08/2022", "ABC Company", "Receptionist"].map((v, i) => (
                            <div
                              key={i}
                              className="px-2 py-2 text-[15px] text-slate-700 border-r border-slate-200/60 last:border-r-0"
                              style={{ transform: `rotate(${i % 2 === 0 ? "0.4deg" : "-0.3deg"})` }}
                            >
                              {v}
                            </div>
                          ))}
                        </div>
                      </div>
    
                      {/* Signature line */}
                      <div className="mt-6 flex items-end gap-3">
                        <span className="text-[14px] text-slate-400">Signature:</span>
                        <svg width="90" height="28" viewBox="0 0 90 28" fill="none">
                          <path
                            d="M5 22 C15 5, 25 8, 30 14 C35 20, 38 8, 45 12 C52 16, 55 6, 65 10 C72 13, 78 8, 85 14"
                            stroke="#475569"
                            strokeWidth="1.8"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
    
                  {/* Subtle paper-worn bottom edge */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(200,190,170,0.15), transparent)",
                    }}
                  />
                </div>
    
                <p className="mt-3 text-[12px] text-muted-foreground text-center">
                  Hard to read · No digital copy · Can&apos;t be shared or edited
                </p>
              </div>
    
              {/* ── AFTER: Clean Word doc ── */}
              <div className="relative">
                {/* Label */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary/60" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-primary/80">
                    Converted Word document
                  </span>
                </div>
    
                <div className="rounded-xl overflow-hidden border border-border bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
    
                  {/* Word toolbar chrome */}
                  <div className="bg-[#2b579a] px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white/20 rounded-sm flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">W</span>
                      </div>
                      <span className="text-white/80 text-[10px] font-medium">
                        JobApplication_Emily_Johnson.docx
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    </div>
                  </div>
    
                  {/* Ribbon strip */}
                  <div className="bg-[#f3f2f1] border-b border-[#e1dfdd] px-4 py-1 flex gap-3">
                    {["Home", "Insert", "Layout", "Review"].map((t) => (
                      <span key={t} className="text-[10px] text-[#605e5c]">{t}</span>
                    ))}
                  </div>
    
                  {/* Document page */}
                  <div className="bg-[#f8f9fa] p-4">
                    <div className="bg-white shadow-sm border border-[#e8e8e8] px-8 py-7 space-y-5">
    
                      {/* Doc title */}
                      <div>
                        <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">
                          Job Application
                        </h3>
                        <div className="mt-1 h-[2px] w-full bg-slate-200" />
                      </div>
    
                      {/* Fields grid */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12px]">
                        {[
                          { label: "Full Name", value: "Emily Johnson" },
                          { label: "Phone", value: "(555) 123-4567" },
                          { label: "Position Applied For", value: "Office Assistant", full: true },
                          { label: "Date", value: "March 3, 2025" },
                        ].map((f) => (
                          <p
                            key={f.label}
                            className={f.full ? "col-span-2" : ""}
                          >
                            <span className="font-semibold text-slate-700">{f.label}: </span>
                            <span className="text-slate-600">{f.value}</span>
                          </p>
                        ))}
                      </div>
    
                      {/* Divider */}
                      <div className="h-px bg-slate-200" />
    
                      {/* Employment table */}
                      <div>
                        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Employment History
                        </p>
                        <table className="w-full text-[11px] border border-slate-200 rounded overflow-hidden">
                          <thead className="bg-slate-50 text-slate-500 uppercase">
                            <tr>
                              {["Date Range", "Employer", "Position"].map((h) => (
                                <th key={h} className="px-3 py-1.5 text-left font-medium tracking-wide border-b border-slate-200">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="text-slate-600">
                            <tr>
                              <td className="px-3 py-2 border-r border-slate-100">05/2020 – 08/2022</td>
                              <td className="px-3 py-2 border-r border-slate-100">ABC Company</td>
                              <td className="px-3 py-2">Receptionist</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
    
                      {/* Signature block */}
                      <div className="pt-2 flex items-end gap-6">
                        <div>
                          <div className="w-28 border-b border-slate-400 mb-1" />
                          <p className="text-[10px] text-slate-400">Signature</p>
                        </div>
                        <div>
                          <div className="w-20 border-b border-slate-400 mb-1" />
                          <p className="text-[10px] text-slate-400">Date</p>
                        </div>
                      </div>
    
                    </div>
                  </div>
    
                </div>
    
                {/* Trust line */}
                <p className="mt-3 text-[12px] text-muted-foreground text-center">
                  Fully editable · Formatting preserved · Ready for official use
                </p>
              </div>
    
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="bg-muted/20 py-24 md:py-32 border-y border-border"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
                How it works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A simple, reliable process for converting handwritten documents into
                clean, editable Word files
              </p>
            </div>

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
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Step {item.step}
                  </span>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who uses this */}
        <section className="bg-muted/20 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">
                Who uses this?
              </h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                Used for forms, applications, and official records across industries
              </p>
            </div>

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
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <useCase.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
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
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">
                  Start converting your documents
                </h2>
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