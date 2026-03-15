import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  FileText,
  ArrowRightLeft,
  FileSearch,
  Sparkles,
  FileCheck,
  Brain,
  Layout,
  Shield,
} from "lucide-react"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  redirect("/handwritten-to-doc")

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
    </div>
  )
}
