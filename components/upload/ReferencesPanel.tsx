"use client"
import React, { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import {
  Upload, X, Loader2, ChevronDown, ChevronUp, Wand2,
  User, Zap, Sun, ImageIcon, Camera, Sparkles,
} from "lucide-react"

const CATEGORIES = [
  {
    key: "model",
    label: "Model Style",
    Icon: User,
    options: ["Female", "Male", "Child", "Plus-size", "Petite", "Elderly"],
  },
  {
    key: "pose",
    label: "Pose / Movement",
    Icon: Zap,
    options: ["Standing", "Walking", "Sitting", "Leaning", "Arms raised", "Candid"],
  },
  {
    key: "lighting",
    label: "Lighting Setup",
    Icon: Sun,
    options: ["Studio soft", "Natural daylight", "Golden hour", "Dramatic", "Neon moody", "Overcast"],
  },
  {
    key: "background",
    label: "Background Scene",
    Icon: ImageIcon,
    options: ["White studio", "Dark studio", "Outdoor nature", "Urban street", "Luxury interior", "Beach"],
  },
  {
    key: "camera",
    label: "Framing & Angle",
    Icon: Camera,
    options: ["Straight-on", "3/4 view", "Full body", "Close-up", "Overhead", "Low angle"],
  },
  {
    key: "vibe",
    label: "Brand Aesthetic",
    Icon: Sparkles,
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
    <div className="border border-hairline bg-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-3">
          <Wand2 className="h-4 w-4 text-ink" />
          <span className="micro-caps text-muted-foreground">
            Creative Moodboard
          </span>
          {activeCount > 0 && (
            <span className="bg-ink/10 text-ink text-[10px] font-bold px-2.5 py-1 rounded-full border border-ink/10">
              {activeCount}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-2">
          {CATEGORIES.map(({ key, label, Icon, options }) => {
            const selected = selections[key]
            const hasImage = !!images[key]
            const isActive = selected || hasImage
            const isExpanded = expandedCategory === key

            return (
              <div
                key={key}
                className={`border transition-all duration-300 overflow-hidden ${
                  isActive
                    ? "border-ink/20 bg-muted"
                    : "border-hairline"
                }`}
              >
                <div
                  onClick={() => setExpandedCategory(isExpanded ? null : key)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted transition-all text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-ink" : "text-muted-foreground"}`} />
                    <span className={`text-xs font-medium ${isActive ? "text-ink" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                    {isActive && (
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
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
                        className="p-1.5 hover:text-destructive text-muted-foreground transition-colors"
                        title="Clear selections"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 transition-all">
                    {hasImage ? (
                      <div className="relative aspect-video overflow-hidden bg-muted group border border-hairline">
                        <Image
                          src={images[key]!.imageUrl}
                          alt={`${label} reference`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="300px"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-scrim/20 transition-colors" />
                        <button
                          onClick={() => handleImageRemove(key)}
                          className="absolute top-2 right-2 p-1.5 bg-scrim/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 text-white text-[9px] font-bold uppercase tracking-widest bg-scrim/60 px-2.5 py-1 rounded-sm">Custom Asset</div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => onSelect(key, selected === opt ? null : opt)}
                            className={`px-3.5 py-1.5 rounded-sm text-xs font-medium transition-all border ${
                              selected === opt
                                ? "bg-ink text-background border-ink"
                                : "border-hairline text-muted-foreground hover:text-ink hover:border-ink bg-muted"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}

                        <label
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold border border-dashed transition-all flex items-center gap-1.5 ${
                            projectId
                              ? "border-hairline text-muted-foreground hover:text-ink hover:border-ink cursor-pointer"
                              : "border-hairline text-muted-foreground/40 cursor-not-allowed"
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
                          {uploading === key ? "Uploading..." : "Upload own"}
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          <p className="text-[9px] text-muted-foreground text-center pt-2 leading-relaxed">
            Configure preset attributes to style the model campaign shoot. All layers are completely optional.
          </p>
        </div>
      )}
    </div>
  )
}
