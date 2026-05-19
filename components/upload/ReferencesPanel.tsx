"use client"
import React, { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import {
  Upload, X, Loader2, ChevronDown, ChevronUp, Wand2,
  User, Zap, Sun, Image as ImageIcon, Camera, Sparkles,
} from "lucide-react"

// ─── Preset options per category ─────────────────────────────────────────────

const CATEGORIES = [
  {
    key: "model",
    label: "Model",
    Icon: User,
    options: ["Female", "Male", "Child", "Plus-size", "Petite", "Elderly"],
  },
  {
    key: "pose",
    label: "Pose",
    Icon: Zap,
    options: ["Standing", "Walking", "Sitting", "Leaning", "Arms raised", "Candid"],
  },
  {
    key: "lighting",
    label: "Lighting",
    Icon: Sun,
    options: ["Studio soft", "Natural daylight", "Golden hour", "Dramatic", "Neon moody", "Overcast"],
  },
  {
    key: "background",
    label: "Background",
    Icon: ImageIcon,
    options: ["White studio", "Dark studio", "Outdoor nature", "Urban street", "Luxury interior", "Beach"],
  },
  {
    key: "camera",
    label: "Camera",
    Icon: Camera,
    options: ["Straight-on", "3/4 view", "Full body", "Close-up", "Overhead", "Low angle"],
  },
  {
    key: "vibe",
    label: "Vibe",
    Icon: Sparkles,
    options: ["Luxury editorial", "Minimalist", "Streetwear", "Sporty", "Vintage", "Bohemian"],
  },
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
  const [images, setImages] = useState<Partial<Record<RefKey, ReferenceImage>>>({})
  const [uploading, setUploading] = useState<RefKey | null>(null)

  // Load existing uploaded reference images for this project
  useEffect(() => {
    if (!projectId) return
    fetch(`/api/references?projectId=${projectId}`)
      .then(r => r.json())
      .then((data: ReferenceImage[]) => {
        if (!Array.isArray(data)) return
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
      // When a custom image is uploaded, clear the text selection for that key
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
    <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wand2 className="h-3.5 w-3.5 text-violet-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Creative References
          </span>
          {activeCount > 0 && (
            <span className="bg-violet-500/20 text-violet-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {activeCount} set
            </span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {CATEGORIES.map(({ key, label, Icon, options }) => {
            const selected = selections[key]
            const hasImage = !!images[key]
            const isActive = selected || hasImage

            return (
              <div key={key} className={`rounded-xl border transition-colors ${isActive ? "border-violet-500/30 bg-violet-500/5" : "border-border/30 bg-secondary/20"}`}>
                {/* Category label */}
                <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-violet-400" : "text-muted-foreground"}`} />
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? "text-violet-400" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                    {isActive && (
                      <span className="text-[10px] text-violet-300 font-medium truncate max-w-[80px]">
                        — {hasImage ? "custom image" : selected}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <button
                      onClick={() => {
                        if (hasImage) handleImageRemove(key)
                        else onSelect(key, null)
                      }}
                      className="p-0.5 hover:text-rose-400 text-muted-foreground/60 transition-colors"
                      title="Clear"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* If a custom image is uploaded — show it */}
                {hasImage ? (
                  <div className="px-3 pb-3">
                    <div className="relative h-20 rounded-lg overflow-hidden bg-muted group">
                      <Image
                        src={images[key]!.imageUrl}
                        alt={`${label} reference`}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      <button
                        onClick={() => handleImageRemove(key)}
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                      <div className="absolute bottom-1 left-2 text-white text-[9px] font-bold uppercase tracking-widest opacity-70">Custom</div>
                    </div>
                  </div>
                ) : (
                  /* Preset chips + Upload own */
                  <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                    {options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => onSelect(key, selected === opt ? null : opt)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                          selected === opt
                            ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                            : "bg-card/50 border-border/50 text-muted-foreground hover:border-violet-400/50 hover:text-foreground"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}

                    {/* Upload custom image */}
                    <label
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border border-dashed transition-all flex items-center gap-1 ${
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
            )
          })}

          <p className="text-[10px] text-muted-foreground/60 text-center pt-1">
            All references are optional. Add custom direction in the text box below.
          </p>
        </div>
      )}
    </div>
  )
}
