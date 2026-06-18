"use client"
import React from "react"
import { X, Sparkles, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

interface UploadCardProps {
  item: {
    id: string
    file: File | Blob
    name: string
    size: number
    preview: string
    progress: number
    status: "queued" | "uploading" | "uploaded" | "processing" | "done" | "error"
    tags: string[]
    dbId?: string
  }
  onRemove: () => void
}

const STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  uploading: "Uploading to Cloud...",
  uploaded: "Ready to Generate",
  processing: "Generating AI images...",
  done: "Generation complete",
  error: "Error",
}

const getProcessingSubtitle = (progress: number) => {
  if (progress < 25) return `Ingesting ZIP & sizing garments... (${progress}%)`
  if (progress < 50) return `Analyzing outline cuts with Vision Model... (${progress}%)`
  if (progress < 75) return `Synthesizing pose & lighting campaign shoot... (${progress}%)`
  if (progress < 95) return `Strict stitch locking & QA rendering... (${progress}%)`
  return `Baking texture maps & saving asset to cloud... (${progress}%)`
}

export default function UploadCard({ item, onRemove }: UploadCardProps) {
  const isDone = item.status === "done"
  const isError = item.status === "error"
  const isUploading = item.status === "uploading"
  const isProcessing = item.status === "processing"
  const isReady = item.status === "uploaded"
  const isActive = isUploading || isProcessing

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className={`group relative flex flex-col overflow-hidden border transition-all duration-500 bg-card ${
        isDone
          ? "border-ink"
          : isError
          ? "border-destructive"
          : isReady
          ? "border-ink"
          : isProcessing
          ? "border-ink"
          : "border-hairline"
      }`}>
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
          <Image
            src={item.preview}
            alt={item.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 25vw"
            className={`object-cover transition-transform duration-1000 group-hover:scale-105 ${
              isActive ? "opacity-40 grayscale blur-[2px]" : ""
            }`}
          />

          <div className="absolute top-3 right-3 flex items-center gap-2">
            {!isActive && (
              <button
                onClick={onRemove}
                className="h-8 w-8 rounded-full bg-scrim/60 text-white flex items-center justify-center hover:bg-destructive transition-colors duration-300"
                title="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-muted/80">
              <div className="relative h-12 w-12 mb-4">
                <div className="absolute inset-0 border-2 border-muted-foreground/20 rounded-full" />
                <div className="absolute inset-0 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="micro-caps text-ink">
                {isProcessing ? "Synthesizing" : "Uploading"}
              </p>
            </div>
          )}

          {isDone && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/10 transition-all duration-500 group-hover:bg-ink/20">
              <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center mb-4 transform transition-transform duration-500 group-hover:scale-110">
                <Sparkles className="h-6 w-6 text-ink" />
              </div>
              <Link
                href="/gallery"
                className="px-4 py-2 bg-background/90 rounded-full text-[10px] font-bold uppercase tracking-widest text-ink border border-hairline flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                View in Gallery
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          <div className="min-w-0">
            <div className="font-semibold text-sm text-foreground truncate">{item.name}</div>
            <div className={`text-[10px] font-medium tracking-wide mt-1 ${
              isDone ? "text-ink" :
              isError ? "text-destructive" :
              isReady ? "text-ink" :
              isProcessing ? "text-muted-foreground" :
              "text-muted-foreground"
            }`}>
              {isProcessing
                ? getProcessingSubtitle(item.progress)
                : `${Math.round(item.size / 1024)} KB · ${STATUS_LABELS[item.status] || item.status}`
              }
            </div>
          </div>

          {(isActive || isDone || isError) && (
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-hairline">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={`h-full rounded-full ${
                  isError
                    ? "bg-destructive"
                    : isDone
                    ? "bg-ink"
                    : "bg-ink"
                }`} />
              </motion.div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {item.tags?.slice(0, 2).map((t: string) => (
              <span
                key={t}
                className="rounded-sm bg-muted px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground border border-hairline"
              >
                {t}
              </span>
            ))}
            {isDone && (
              <span className="rounded-sm bg-ink/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-ink border border-ink/20">
                Verified
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
