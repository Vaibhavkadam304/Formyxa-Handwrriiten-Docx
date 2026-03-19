"use client"

import type React from "react"
import { useCallback, useState, useRef } from "react"
import { Upload, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const MAX_FILES = 5
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "application/pdf"]

interface UploadAreaProps {
  onFileUpload: (files: File[], strictMode: boolean) => void
  selectedFiles?: File[]
  uploading?: boolean
  onConvert?: () => void
}

export default function UploadArea({
  onFileUpload,
  selectedFiles = [],
  uploading = false,
  onConvert,
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [strictMode, setStrictMode] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const validateAndEmit = useCallback(
    (incoming: File[]) => {
      setError(null)
      const valid = incoming.filter((f) => ALLOWED_TYPES.includes(f.type))

      if (valid.length !== incoming.length) {
        setError("Some files were skipped — only JPG, PNG, GIF, and PDF are allowed.")
      }

      // Merge with already-selected files, deduplicate by name, cap at MAX_FILES
      const merged = [...selectedFiles, ...valid].reduce<File[]>((acc, f) => {
        if (!acc.find((x) => x.name === f.name && x.size === f.size)) acc.push(f)
        return acc
      }, [])

      if (merged.length > MAX_FILES) {
        setError(`You can upload a maximum of ${MAX_FILES} files at a time.`)
        onFileUpload(merged.slice(0, MAX_FILES), strictMode)
        return
      }

      onFileUpload(merged, strictMode)
    },
    [selectedFiles, onFileUpload, strictMode]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      validateAndEmit(Array.from(e.dataTransfer.files))
    },
    [validateAndEmit]
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    validateAndEmit(files)
    // Reset so same file can be re-selected if removed
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index)
    setError(null)
    onFileUpload(updated, strictMode)
  }

  const canAddMore = selectedFiles.length < MAX_FILES

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Upload a handwritten or scanned document
        </h2>
        <p className="text-muted-foreground text-lg">
          Convert it into a clean, editable Word document in seconds.
        </p>
      </div>

      {/* Upload Card */}
      <Card
        className={`relative border-2 border-dashed transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center px-8 pt-12 pb-6 text-center">
          {/* Icon */}
          <div className="mb-5 rounded-full bg-primary/10 p-5 shadow-inner">
            <Upload className="h-8 w-8 text-primary" />
          </div>

          {/* Instructions */}
          <p className="text-lg font-semibold">
            Drop your files here, or{" "}
            <span
              className="underline cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              browse
            </span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Supports JPG, PNG, GIF, PDF &bull; Max {MAX_FILES} files &bull; 10 MB each
          </p>

          {/* Error */}
          {error && (
            <p className="mt-3 text-sm font-medium text-destructive">{error}</p>
          )}

          {/* Strict Mode */}
          <div className="mt-6 w-full max-w-md rounded-lg border border-border p-4 bg-muted/30 hover:bg-muted/50 transition text-left">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => {
                  setStrictMode(e.target.checked)
                  if (selectedFiles.length > 0) onFileUpload(selectedFiles, e.target.checked)
                }}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Strict accuracy mode</p>
                <p className="text-sm text-muted-foreground">
                  Best for government forms, applications, and official documents.
                </p>
              </div>
            </label>
          </div>

          {/* File list */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 w-full max-w-md space-y-2">
              <p className="text-xs text-muted-foreground text-left font-medium uppercase tracking-wide">
                {selectedFiles.length} / {MAX_FILES} files selected
              </p>
              {selectedFiles.map((file, i) => (
                <div
                  key={`${file.name}-${file.size}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm shadow-sm hover:bg-muted/30 transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="shrink-0 text-muted-foreground text-xs">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Add more + Convert */}
              <div className="flex gap-2 pt-2">
                {canAddMore && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    + Add more
                  </Button>
                )}
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={uploading}
                  onClick={(e) => {
                    e.preventDefault()
                    onConvert?.()
                  }}
                >
                  {uploading
                    ? "Converting…"
                    : `Convert ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} to Word`}
                </Button>
              </div>
            </div>
          )}

          {/* Empty state CTA */}
          {selectedFiles.length === 0 && (
            <Button
              size="lg"
              className="mt-8 h-11 px-6 text-base font-semibold shadow-md hover:shadow-lg transition-all"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Files
            </Button>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            No signup required • Files auto-deleted for privacy
          </p>
        </div>

        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          className="sr-only"
          accept="image/jpeg,image/png,image/gif,.pdf,application/pdf"
          multiple
          onChange={handleFileSelect}
        />
      </Card>
    </div>
  )
}