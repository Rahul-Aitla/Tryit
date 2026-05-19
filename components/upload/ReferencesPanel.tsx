"use client"
import React, { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import {
  Upload, X, Loader2, ChevronDown, ChevronUp, Wand2,
  User, Zap, Sun, ImageIcon, Camera, Sparkles,
} from "lucide-react"

// ─── Preset options per category ─────────────────────────────────────────────

const CATEGORIES = [
  {
    key: "model",
    label: "Model Style",
    Icon: User,
    activeChipClass: "bg-primary text-white border-primary shadow-glow",
    inactiveChipClass: "hover:text-primary hover:border-primary/30 text-muted-foreground/60 border-black/5 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02]",
    options: ["Female", "Male", "Child", "Plus-size", "Petite", "Elderly"],
  },
  {
    key: "pose",
    label: "Pose / Movement",
    Icon: Zap,
    activeChipClass: "bg-primary text-white border-primary shadow-glow",
    inactiveChipClass: "hover:text-primary hover:border-primary/30 text-muted-foreground/60 border-black/5 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02]",
    options: ["Standing", "Walking", "Sitting", "Leaning", "Arms raised", "Candid"],
  },
  {
    key: "lighting",
    label: "Lighting Setup",
    Icon: Sun,
    activeChipClass: "bg-primary text-white border-primary shadow-glow",
    inactiveChipClass: "hover:text-primary hover:border-primary/30 text-muted-foreground/60 border-black/5 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02]",
    options: ["Studio soft", "Natural daylight", "Golden hour", "Dramatic", "Neon moody", "Overcast"],
  },
  {
    key: "background",
    label: "Background Scene",
    Icon: ImageIcon,
    activeChipClass: "bg-primary text-white border-primary shadow-glow",
    inactiveChipClass: "hover:text-primary hover:border-primary/30 text-muted-foreground/60 border-black/5 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02]",
    options: ["White studio", "Dark studio", "Outdoor nature", "Urban street", "Luxury interior", "Beach"],
  },
  {
    key: "camera",
    label: "Framing & Angle",
    Icon: Camera,
    activeChipClass: "bg-primary text-white border-primary shadow-glow",
    inactiveChipClass: "hover:text-primary hover:border-primary/30 text-muted-foreground/60 border-black/5 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02]",
    options: ["Straight-on", "3/4 view", "Full body", "Close-up", "Overhead", "Low angle"],
  },
  {
    key: "vibe",
    label: "Brand Aesthetic",
    Icon: Sparkles,
    activeChipClass: "bg-primary text-white border-primary shadow-glow",
    inactiveChipClass: "hover:text-primary hover:border-primary/30 text-muted-foreground/60 border-black/5 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02]",
    options: ["Luxury editorial", "Minimalist", "Streetwear", "Sporty", "Vintage", "Bohemian"],
  }
] as const

type RefKey = typeof CATEGORIES[number]["key"]

interface ReferenceImage {
  id: string
  referenceType: RefKey
  imageUrl: string
}

export interface ReferenceSelections {
  model?: string
  pose?: string
  lighting?: string
  background?: string
  camera?: string
  vibe?: string
}

interface ReferencesPanelProps {
  projectId: string | null
  selections: ReferenceSelections
  onSelect: (key: RefKey, value: string | null) => void
}

export default function ReferencesPanel({ projectId, selections, onSelect }: ReferencesPanelProps) {
  const [open, setOpen] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState<RefKey | null>("model")
  const [images, setImages] = useState<Partial<Record<RefKey, ReferenceImage>>>({})
  const [uploading, setUploading] = useState<RefKey | null>(null)

  // Load existing uploaded reference images for this project
  useEffect(() => {
    if (!projectId) return
    fetch(`/api/references?projectId=${projectId}`)
      .then(r => r.json())
      .then((data: ReferenceImage[]) => {
        if (!data || !Array.isArray(data)) return
        const map: Partial<Record<RefKey, ReferenceImage>> = {}
        for (const ref of data) map[ref.referenceType as RefKey] = ref
        setImages(map)
      })
      .catch(() => {})
  }, [projectId])

  const handleImageUpload = useCallback(async (key: RefKey, file: File) => {
    if (!projectId) return
    setUploading(key)
    try {
      const fd = new FormData()
      fd.append("projectId", projectId)
      fd.append("referenceType", key)
      fd.append("file", file)
      const res = await fetch("/api/references", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Upload failed")
      const ref: ReferenceImage = await res.json()
      setImages(prev => ({ ...prev, [key]: ref }))
      onSelect(key, null)
    } catch (err) {
      console.error("Reference upload error:", err)
    } finally {
      setUploading(null)
    }
  }, [projectId, onSelect])

  const handleImageRemove = useCallback(async (key: RefKey) => {
    const img = images[key]
    if (!img) return
    try {
      await fetch(`/api/references?id=${img.id}`, { method: "DELETE" })
      setImages(prev => { const n = { ...prev }; delete n[key]; return n })
    } catch {}
  }, [images])

  const activeCount = Object.values(selections).filter(Boolean).length + Object.keys(images).length

  return (
    <div className="rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/80 dark:bg-white/[0.01] backdrop-blur-xl overflow-hidden shadow-soft">
      {/* Outer Panel Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Wand2 className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Creative Moodboard
          </span>
          {activeCount > 0 && (
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/10">
              {activeCount}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground/40" /> : <ChevronDown className="h-4 w-4 text-muted-foreground/40" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-2">
          {CATEGORIES.map(({ key, label, Icon, options, activeChipClass, inactiveChipClass }) => {
            const selected = selections[key]
            const hasImage = !!images[key]
            const isActive = selected || hasImage
            const isExpanded = expandedCategory === key

            return (
              <div
                key={key}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isActive 
                    ? "border-primary/20 bg-primary/[0.02] shadow-sm" 
                    : "border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]"
                }`}
              >
                {/* Accordion Folder Trigger Header */}
                <div
                  onClick={() => setExpandedCategory(isExpanded ? null : key)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground/40"}`} />
                    <span className={`text-[12px] font-semibold ${isActive ? "text-primary" : "text-muted-foreground/70"}`}>
                      {label}
                    </span>
                    {isActive && (
                      <span className="text-[10px] text-primary/50 font-medium truncate max-w-[120px]">
                        — {hasImage ? "Custom Image" : selected}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (hasImage) handleImageRemove(key)
                          else onSelect(key, null)
                        }}
                        className="p-1.5 hover:text-rose-500 text-muted-foreground/30 transition-colors"
                        title="Clear selections"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <ChevronDown className={`h-4 w-4 text-muted-foreground/20 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Collapsible Content Area */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 transition-all">
                    {hasImage ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-white/[0.03] group border border-black/5 dark:border-white/5 shadow-soft">
                        <Image
                          src={images[key]!.imageUrl}
                          alt="${label} reference"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="300px"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <button
                          onClick={() => handleImageRemove(key)}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 text-white text-[9px] font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">Custom Asset</div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => onSelect(key, selected === opt ? null : opt)}
                            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
                              selected === opt ? activeChipClass : inactiveChipClass
                            }`}
                          >
                            {opt}
                          </button>
                        ))}

                        {/* Upload custom image */}
                        <label
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold border border-dashed transition-all flex items-center gap-1.5 ${
                            projectId
                              ? "border-border/50 text-muted-foreground hover:border-violet-400/50 hover:text-foreground cursor-pointer"
                              : "border-border/20 text-muted-foreground/40 cursor-not-allowed"
                          }`}
                          title="Upload a custom reference image"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={!projectId || uploading === key}
                            onChange={e => {
                              const f = e.target.files?.[0]
                              if (f) handleImageUpload(key, f)
                              e.currentTarget.value = ""
                            }}
                          />
                          {uploading === key
                            ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            : <Upload className="h-2.5 w-2.5" />
                          }
                          {uploading === key ? "Uploading…" : "Upload own"}
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          <p className="text-[9px] text-muted-foreground/60 text-center pt-2 leading-relaxed">
            Configure preset attributes to style the model campaign shoot. All layers are completely optional.
          </p>
        </div>
      )}
    </div>
  )
}
