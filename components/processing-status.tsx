"use client"

import {
  Loader2,
  CheckCircle2,
  FileSearch,
  Sparkles,
  FileCheck,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import type { ProcessingState } from "@/types/document"

interface ProcessingStatusProps {
  state: ProcessingState
}

export default function ProcessingStatus({ state }: ProcessingStatusProps) {
  const steps = [
    { key: "uploading", label: "Extracting handwritten content", icon: FileSearch },
    { key: "processing", label: "Analyzing document structure", icon: Sparkles },
    { key: "exporting", label: "Preparing editable document", icon: FileCheck },
  ]

  const getCurrentStep = () => {
    if (state === "uploading") return 0
    if (state === "processing") return 1
    if (state === "exporting") return 2
    if (state === "complete") return 3
    return 0
  }

  const currentStep = getCurrentStep()

  return (
    <Card className="p-8 shadow-xl border border-border bg-background/80 backdrop-blur-sm">
      <div className="space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight">
            {state === "complete"
              ? "Document Ready"
              : "Processing Your Document"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {state === "complete"
              ? "Your document is ready for review and download"
              : "Our AI is converting your file into a clean, editable format"}
          </p>
        </div>

        {/* Steps */}
        <div className="relative space-y-6">
          {/* vertical line */}
          <div className="absolute left-5 top-0 h-full w-px bg-border" />

          {steps.map((step, index) => {
            const Icon = step.icon
            const isComplete = index < currentStep
            const isActive = index === currentStep

            return (
              <div key={step.key} className="relative flex items-start gap-4">
                
                {/* Icon circle */}
                <div
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all
                  ${
                    isComplete
                      ? "bg-primary/10 text-primary"
                      : isActive
                      ? "bg-primary text-white shadow-lg scale-105"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isActive ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <p
                    className={`font-medium transition ${
                      isActive || isComplete
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>

                  {/* subtle status text */}
                  {isActive && (
                    <p className="text-xs text-primary mt-1 animate-pulse">
                      Processing...
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Completion */}
        {state === "complete" && (
          <div className="flex items-center justify-center gap-2 text-primary text-sm font-medium">
            <CheckCircle2 className="h-5 w-5" />
            All steps completed successfully
          </div>
        )}
      </div>
    </Card>
  )
}