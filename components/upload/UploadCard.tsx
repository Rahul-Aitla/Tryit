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
      <div className={`group relative flex flex-col rounded-[2rem] overflow-hidden border transition-all duration-500 bg-white dark:bg-white/[0.02] ${
        isDone 
          ? "border-emerald-500/20 shadow-[0_10px_40px_rgba(16,185,129,0.06)]"
          : isError
          ? "border-rose-500/20 shadow-[0_10px_40px_rgba(239,68,68,0.06)]"
          : isReady
          ? "border-primary/20 shadow-elevated"
          : isProcessing
          ? "border-primary shadow-glow-primary"
          : "border-black/5 dark:border-white/5 shadow-soft hover:shadow-elevated hover:border-black/10 dark:hover:border-white/10"
      }`}>
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-white/[0.03]">
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
        
        {/* Overlay Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {!isActive && (
            <button
              onClick={onRemove}
              className="h-8 w-8 rounded-full bg-black/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-rose-500 transition-colors duration-300 shadow-lg"
              title="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white/40 dark:bg-black/40 backdrop-blur-sm">
            <div className="relative h-12 w-12 mb-4">
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary text-center">
              {isProcessing ? "Synthesizing" : "Uploading"}
            </p>
          </div>
        )}

        {isDone && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/10 backdrop-blur-[2px] transition-all duration-500 group-hover:bg-emerald-500/20">
            <div className="h-12 w-12 rounded-full bg-white dark:bg-emerald-500 flex items-center justify-center shadow-xl mb-4 transform transition-transform duration-500 group-hover:scale-110">
              <Sparkles className="h-6 w-6 text-emerald-500 dark:text-white" />
            </div>
            <Link 
              href="/gallery"
              className="px-4 py-2 bg-white dark:bg-black/80 backdrop-blur-md rounded-xl text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              View in Gallery
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="p-5 space-y-3">
        <div className="min-w-0">
          <div className="font-semibold text-sm text-foreground/90 truncate">{item.name}</div>
          <div className={`text-[10px] font-medium tracking-wide mt-1 ${
            isDone ? "text-emerald-500" :
            isError ? "text-rose-500" :
            isReady ? "text-primary" :
            isProcessing ? "text-indigo-500" :
            "text-muted-foreground/50"
          }`}>
            {isProcessing 
              ? getProcessingSubtitle(item.progress) 
              : `${Math.round(item.size / 1024)} KB · ${STATUS_LABELS[item.status] || item.status}`
            }
          </div>
        </div>

        {/* Progress Bar */}
        {(isActive || isDone || isError) && (
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.05]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={`h-full rounded-full ${
                isError 
                  ? "bg-rose-500" 
                  : isDone 
                  ? "bg-emerald-500"
                  : "bg-primary"
              }`} />
            </motion.div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {item.tags?.slice(0, 2).map((t: string) => (
            <span
              key={t}
              className="rounded-lg bg-slate-100 dark:bg-white/[0.03] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 border border-black/[0.03] dark:border-white/5"
            >
              {t}
            </span>
          ))}
          {isDone && (
            <span className="rounded-lg bg-emerald-50/50 dark:bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
              Verified
            </span>
          )}
        </div>
      </div>
      </div>
    </motion.div>
  )
}
