"use client"
import React from "react"
import { X, CheckCircle2, Loader2, AlertCircle, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

interface UploadCardProps {
  item: {
    id: string
    file: File | Blob
    name: string    // always use item.name — not item.file.name (Blob has no .name)
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
      className={`group relative flex items-center gap-4 rounded-2xl border bg-card/50 p-3 backdrop-blur-sm transition-all hover:shadow-xl hover:shadow-violet-500/5 ${
        isDone 
          ? "border-emerald-500/30 bg-emerald-500/5"
          : isError
          ? "border-rose-500/30 bg-rose-500/5"
          : isReady
          ? "border-violet-500/30 bg-violet-500/5"
          : "border-border/50 hover:bg-card"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted/50 ring-1 ring-border/50">
        <Image
          src={item.preview}
          alt={item.name}
          fill
          unoptimized
          sizes="96px"
          className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
            isActive ? "opacity-50 grayscale" : ""
          }`}
        />
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {isDone && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
            <Sparkles className="h-6 w-6 text-emerald-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col min-w-0 gap-1.5">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{item.name}</div>
            <div className={`text-[10px] font-medium uppercase tracking-wider ${
              isDone ? "text-emerald-400" :
              isError ? "text-rose-400" :
              isReady ? "text-violet-400" :
              "text-muted-foreground"
            }`}>
              {Math.round(item.size / 1024)} KB · {STATUS_LABELS[item.status] || item.status}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            {isError && <AlertCircle className="h-4 w-4 text-destructive" />}
            {/* Only allow remove if not actively uploading/processing */}
            {!isActive && (
              <button
                onClick={onRemove}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                title="Remove from queue"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${item.progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`h-full rounded-full ${
              isError 
                ? "bg-destructive" 
                : isDone 
                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                : "bg-gradient-to-r from-violet-600 to-indigo-600"
            }`}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {item.tags?.map((t: string) => (
            <span
              key={t}
              className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground border border-border/50"
            >
              {t}
            </span>
          ))}
          {isDone && (
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
              ✓ Check Gallery
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
