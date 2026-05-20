"use client"
import React, { useCallback, useState, useEffect } from "react"
import UploadCard from "./UploadCard"
import { Upload, Cloud, ArrowRight, Globe, Save, FileText, X, Plus, Loader2, Image as ImageIcon, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import JSZip from "jszip"
import Link from "next/link"

type FileEntry = {
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

import { ReferenceSelections } from "@/components/upload/ReferencesPanel"

interface UploadAreaProps {
  projectId: string | null
  outputsRequested: number
  prompt: string
  referenceSelections?: ReferenceSelections
  onProjectReady?: (projectId: string) => void
}

interface Outfit {
  id: string
  imageUrl: string
  category?: string
}

export default function UploadArea({ projectId, outputsRequested, prompt, referenceSelections, onProjectReady }: UploadAreaProps) {
  const [items, setItems] = useState<FileEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Drive Import state
  const [showDriveInput, setShowDriveInput] = useState(false)
  const [driveUrl, setDriveUrl] = useState("")
  const [driveLoading, setDriveLoading] = useState(false)
  const [driveError, setDriveError] = useState<string | null>(null)

  // Advanced Prompt Editable Layer state
  const [showPromptPreview, setShowPromptPreview] = useState(false)
  const [customPrompt, setCustomPrompt] = useState<string>("")
  const [refiningPrompt, setRefiningPrompt] = useState(false)
  const [showGalleryPrompt, setShowGalleryPrompt] = useState(false)

  // Load existing outfits when projectId changes
  useEffect(() => {
    if (!projectId) return

    const fetchOutfits = async () => {
      try {
        const res = await fetch(`/api/outfits?projectId=${projectId}`)
        if (res.ok) {
          const data = await res.json()
          const existingItems: FileEntry[] = (data.data || []).map((outfit: Outfit) => ({
            id: outfit.id,
            file: new Blob([]), // Dummy blob for existing items
            name: outfit.imageUrl.split("/").pop() || "outfit.jpg",
            size: 0,
            preview: outfit.imageUrl,
            progress: 100,
            status: "uploaded" as const,
            tags: ["Existing", outfit.category].filter(Boolean),
            dbId: outfit.id,
          }))
          setItems(existingItems)
        }
      } catch (err) {
        console.error("Failed to fetch outfits:", err)
      }
    }

    fetchOutfits()
  }, [projectId])

  const getCompiledPrompt = useCallback(() => {
    if (customPrompt) return customPrompt

    const outfitLock = `[OUTFIT PRESERVATION — CRITICAL]
The uploaded garment image is the ABSOLUTE reference for the clothing item.
You MUST reproduce the outfit with pixel-perfect fidelity:
• Same design, silhouette, and garment structure
• Same color scheme, color blocking, and gradient transitions
• Same fabric texture, weight, and material appearance
• Same pattern, print, motif, and repeat
• Same stitching, seam lines, and edge finishing
• Same cuts, darts, and tailoring details
• Same collar, neckline, and lapel shape
• Same sleeve style, length, cuff, and opening
• Same button placement, zipper position, and fastener type
• Same pockets, flaps, and hardware details
• Same lining, interlining, and visible inner fabric
• Same embroidery, embellishment, appliqué, and trim
• Same logo placement (do NOT add, remove, or alter any branding)
DO NOT redesign, simplify, or reinterpret any aspect of the garment.`

    const refsBlock = `[REFERENCE INTERPRETATION]
Apply the following creative references to the scene — NOT to the garment:
• Model type / body: ${referenceSelections?.model || 'professional fashion model, proportionate build'}
• Pose & body language: ${referenceSelections?.pose || 'natural, confident fashion editorial pose'}
• Lighting setup: ${referenceSelections?.lighting || 'professional studio lighting with soft shadows'}
• Background / environment: ${referenceSelections?.background || 'clean seamless studio backdrop'}
• Camera angle & framing: ${referenceSelections?.camera || 'straight-on medium shot, 4:5 aspect ratio'}
• Brand aesthetic / vibe: ${referenceSelections?.vibe || 'high-end commercial fashion photography'}
The references control the scene, model presentation, and atmosphere ONLY.`

    const creative = `[CREATIVE DIRECTION]
${prompt || 'High-end commercial fashion editorial. Clean, professional, aspirational.'}`

    const negative = `[NEGATIVE INSTRUCTIONS — STRICTLY PROHIBITED]
• DO NOT change the garment's color, pattern, texture, or fabric
• DO NOT redesign, simplify, or add details to the outfit
• DO NOT hallucinate extra logos, badges, or brand marks
• DO NOT alter stitching, cuts, sleeves, collar, or hem
• DO NOT change button count, zipper style, or hardware
• DO NOT apply AI-style smoothing that removes fabric texture
• DO NOT generate nudity, inappropriate content, or fantasy styling
• DO NOT blend the outfit into the background
• DO NOT crop the garment — show the full outfit`

    const output = `[OUTPUT INSTRUCTIONS]
• Format: high-resolution commercial fashion photograph
• Realism: photorealistic, NOT illustrated or stylized
• Aspect ratio: 4:5 (portrait, standard e-commerce / Instagram format)
• Quality: sharp detail, correct exposure, no motion blur
• Usage: product e-commerce and brand editorial campaigns
• Show the complete garment from collar to hem — no cropping`

    return `${outfitLock}\n\n${refsBlock}\n\n${creative}\n\n${negative}\n\n${output}`
  }, [customPrompt, prompt, referenceSelections])

  // Initialize a default project if none provided
  useEffect(() => {
    if (projectId) {
      return
    }

    let active = true
    const initProject = async () => {
      try {
        const res = await fetch("/api/projects")
        if (!res.ok) {
          return
        }
        const projects = await res.json()
        if (Array.isArray(projects) && projects.length > 0) {
          if (active) {
            onProjectReady?.(projects[0].id)
          }
        } else {
          const createRes = await fetch("/api/projects", {
            method: "POST",
            body: JSON.stringify({ projectName: "Default Project" }),
            headers: { "Content-Type": "application/json" }
          })
          if (!createRes.ok) {
            return
          }
          const newProject = await createRes.json()
          if (active) {
            onProjectReady?.(newProject.id)
          }
        }
      } catch (err) {
        console.error("Failed to init project:", err)
      }
    }
    
    initProject()
    return () => { active = false }
  }, [onProjectReady, projectId])

  const processFiles = useCallback(async (files: File[]) => {
    if (!projectId) return

    const newEntries: FileEntry[] = []

    for (const file of files) {
      if (file.type === "application/zip" || file.name.endsWith(".zip")) {
        try {
          const zip = await JSZip.loadAsync(file)
          const zipFiles = Object.values(zip.files).filter(f => !f.dir && f.name.match(/\.(jpg|jpeg|png|webp)$/i))
          
          for (const zf of zipFiles) {
            const blob = await zf.async("blob")
            newEntries.push({
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              file: blob,
              name: zf.name.split('/').pop() || zf.name,
              size: blob.size,
              preview: URL.createObjectURL(blob),
              progress: 0,
              status: "queued",
              tags: ["ZIP Extracted"],
            })
          }
        } catch (err) {
          console.error("Error unzipping:", err)
        }
      } else if (file.type.startsWith("image/")) {
        newEntries.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          file: file,
          name: file.name,
          size: file.size,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: "queued",
          tags: [],
        })
      }
    }

    setItems((s) => [...newEntries, ...s])

    // Start real uploads for new entries
    newEntries.forEach(async (entry) => {
      try {
        setItems((s) => s.map((it) => (it.id === entry.id ? { ...it, status: "uploading" } : it)))
        
        const formData = new FormData()
        formData.append("projectId", projectId)
        formData.append("files", entry.file, entry.name)
        formData.append("category", entry.tags.includes("ZIP Extracted") ? "ZIP" : "Direct")

        const res = await fetch("/api/outfits", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) throw new Error("Upload failed")
        
        const data = await res.json()
        const uploadedOutfit = data.data[0]

        setItems((s) => s.map((it) => (it.id === entry.id ? { 
          ...it, 
          status: "uploaded", 
          progress: 100,
          dbId: uploadedOutfit.id,
          tags: [...entry.tags, "Outfit", "Cloud"] 
        } : it)))
      } catch (err) {
        console.error("Upload error:", err)
        setItems((s) => s.map((it) => (it.id === entry.id ? { ...it, status: "error" } : it)))
      }
    })
  }, [projectId])

  const handleDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!driveUrl || !projectId) return

    setDriveLoading(true)
    setDriveError(null)

    try {
      const res = await fetch("/api/drive-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driveUrl, projectId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setDriveError(data.error || "Import failed. Make sure the Drive folder is publicly shared.")
        return
      }

      // Feed imported outfits into the upload queue as already-uploaded items
      const newEntries: FileEntry[] = (data.data ?? []).map((outfit: { id: string; imageUrl: string }) => ({
        id: `drive-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file: new Blob([]),
        name: outfit.imageUrl.split("/").pop() || "drive-image.jpg",
        size: 0,
        preview: outfit.imageUrl,
        progress: 100,
        status: "uploaded" as const,
        tags: ["Drive Import", "Cloud"],
        dbId: outfit.id,
      }))

      setItems((s) => [...newEntries, ...s])
      setDriveUrl("")
      setShowDriveInput(false)
    } catch (err) {
      setDriveError(err instanceof Error ? err.message : "Unexpected error during Drive import")
    } finally {
      setDriveLoading(false)
    }
  }

  const removeItem = useCallback((id: string) => {
    setItems((s) => s.filter((it) => it.id !== id))
  }, [])

  const startGeneration = useCallback(async () => {
    const toProcess = items.filter(it => it.status === "uploaded" && it.dbId)
    
    for (const it of toProcess) {
      try {
        setItems((s) => s.map((x) => (x.id === it.id ? { ...x, status: "processing", progress: 0 } : x)))
        
        const res = await fetch("/api/generate", {
          method: "POST",
          body: JSON.stringify({
            outfitId: it.dbId,
            prompt: customPrompt || prompt || "High-end commercial fashion photography",
            outputsRequested: outputsRequested,
            referenceSelections: referenceSelections || {},
          }),
          headers: { "Content-Type": "application/json" }
        })

        if (!res.ok) throw new Error("Generation request failed")
        const { jobId } = await res.json()

        // Real-time polling for job status
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/generate/status/${jobId}`)
            if (!statusRes.ok) return

            const statusData = await statusRes.json()
            
            setItems((s) => s.map((x) => {
              if (x.id === it.id) {
                // Map API status to UI status
                let uiStatus: FileEntry["status"] = "processing"
                if (statusData.status === "completed") uiStatus = "done"
                if (statusData.status === "failed") uiStatus = "error"
                if (statusData.status === "queued") uiStatus = "queued"
                
                return { 
                  ...x, 
                  status: uiStatus, 
                  progress: statusData.progress 
                }
              }
              return x
            }))

            if (statusData.status === "Completed") {
              clearInterval(pollInterval)
              setShowGalleryPrompt(true)
            } else if (statusData.status === "Failed") {
              clearInterval(pollInterval)
            }
          } catch (pollErr) {
            console.error("Polling error:", pollErr)
          }
        }, 2000)

      } catch (err) {
        console.error("Generation error:", err)
        setItems((s) => s.map((x) => (x.id === it.id ? { ...x, status: "error" } : x)))
      }
    }
  }, [items, outputsRequested, prompt, referenceSelections, customPrompt])

  const handleStartGenerationClick = useCallback(async () => {
    if (customPrompt) {
      startGeneration()
      return
    }

    try {
      setRefiningPrompt(true)
      const res = await fetch("/api/generate/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || "High-end commercial fashion photography",
          referenceSelections: referenceSelections || {}
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.refinedPrompt) {
          setCustomPrompt(data.refinedPrompt)
          setShowPromptPreview(true)
        } else {
          setCustomPrompt(getCompiledPrompt())
          setShowPromptPreview(true)
        }
      } else {
        setCustomPrompt(getCompiledPrompt())
        setShowPromptPreview(true)
      }
    } catch (err) {
      console.error("Failed to refine prompt:", err)
      setCustomPrompt(getCompiledPrompt())
      setShowPromptPreview(true)
    } finally {
      setRefiningPrompt(false)
    }
  }, [prompt, referenceSelections, customPrompt, startGeneration, getCompiledPrompt])

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          const files = Array.from(e.dataTransfer.files)
          processFiles(files)
        }}
        className={`relative flex-1 min-h-[400px] rounded-[2.5rem] border-2 border-dashed transition-all duration-500 overflow-hidden flex flex-col items-center justify-center p-12 ${
          isDragging
            ? "border-primary bg-primary/[0.02] scale-[0.99]"
            : "border-black/5 dark:border-white/5 bg-gradient-to-b from-white dark:from-white/[0.02] to-slate-50 dark:to-transparent shadow-elevated"
        }`}
      >
        <AnimatePresence>
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col items-center text-center max-w-md">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full" />
                <div className="relative h-24 w-24 rounded-3xl bg-white dark:bg-white/[0.05] border border-black/5 dark:border-white/10 shadow-xl flex items-center justify-center group">
                  <Cloud className="h-10 w-10 text-primary transition-transform duration-500 group-hover:scale-110" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">Upload your garments</h3>
              <p className="text-muted-foreground/60 mb-8 leading-relaxed">
                Drop your flat-lay or mannequin shots here. <br />
                We&apos;ll transform them into professional editorial photography.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <label className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold cursor-pointer hover:opacity-90 transition-all active:scale-95 shadow-glow">
                  <Upload className="h-4 w-4" />
                  Select Files
                  <input type="file" className="hidden" multiple accept="image/*,.zip" onChange={(e) => e.target.files && processFiles(Array.from(e.target.files))} />
                </label>
                <button 
                  onClick={() => setShowDriveInput(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-white/[0.05] border border-black/5 dark:border-white/10 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-all active:scale-95"
                >
                  <Globe className="h-4 w-4" />
                  Import from URL
                </button>
              </div>
                </div>
              </motion.div>
            ) : (
              <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto p-4 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <UploadCard key={item.id} item={item} onRemove={() => removeItem(item.id)} />
                ))}
              </AnimatePresence>
              
              {/* Add More Card */}
              <label className="aspect-[3/4] rounded-3xl border-2 border-dashed border-black/5 dark:border-white/5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-black/[0.01] dark:hover:bg-white/[0.01] hover:border-primary/20 transition-all group">
                <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-muted-foreground/60">Add more</span>
                <input type="file" className="hidden" multiple accept="image/*,.zip" onChange={(e) => e.target.files && processFiles(Array.from(e.target.files))} />
              </label>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-[12px] font-medium text-muted-foreground/80">Ready for generation</span>
          </div>
          <div className="text-[12px] text-muted-foreground/40 font-mono">
            {items.length} assets selected
          </div>
        </div>

        <button 
          onClick={handleStartGenerationClick}
          disabled={items.length === 0 || refiningPrompt}
          className="group flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-glow-primary hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
        >
          {refiningPrompt ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Optimizing Pipeline...
            </>
          ) : (
            <>
              Generate Creative Content
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>

      {/* Advanced Prompt Preview & Editable Layer Modal */}
      <AnimatePresence>
        {showPromptPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 dark:bg-[#070811]/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
            >
              <div className="relative w-full max-w-4xl rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0B0D16] p-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Decorative subtle ambient lighting */}
              <div className="absolute top-[-30%] left-[-30%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/5 dark:border-white/5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Orchestration Logic</h2>
                    <p className="text-[13px] text-muted-foreground/60 mt-1">Review the synthesized AI instructions before campaign execution.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPromptPreview(false)}
                  className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all duration-300 text-muted-foreground/40 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Editable Area */}
              <div className="flex-1 overflow-y-auto mb-8 relative z-10 space-y-6 pr-2 custom-scrollbar">
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 text-[13px] text-primary/80 leading-relaxed font-medium">
                  💡 <strong>Synthesis Protocol:</strong> The orchestrator uses a <strong>5-layer logic system</strong> to ensure pixel-perfect garment fidelity. Avoid modifying the <code>[OUTFIT PRESERVATION]</code> block for technical accuracy.
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] px-1">Active Synthesis Logic</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full min-h-[400px] p-6 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-[2rem] text-[13.5px] font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/10 text-foreground/90 resize-none transition-all"
                    placeholder="Enter custom orchestration instructions..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5 relative z-10">
                <button
                  onClick={() => {
                    setCustomPrompt("") // resets to getCompiledPrompt fallback
                    setShowPromptPreview(false)
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                >
                  Reset to Default
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPromptPreview(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-bold border border-black/5 dark:border-white/10 hover:bg-secondary text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowPromptPreview(false)
                      startGeneration()
                    }}
                    className="flex items-center gap-1.5 bg-primary hover:opacity-90 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-glow active:scale-95"
                  >
                    <Save className="h-4 w-4" /> Confirm & Generate 🚀
                  </button>
                </div>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Google Drive Import Modal */}
      <AnimatePresence>
        {showDriveInput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 dark:bg-[#070811]/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
            >
              <div className="relative w-full max-w-lg rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0B0D16] p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-[-30%] left-[-30%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/5 dark:border-white/5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Cloud Import</h2>
                    <p className="text-[13px] text-muted-foreground/60 mt-1">Connect your Google Drive assets.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDriveInput(false)}
                  className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all duration-300 text-muted-foreground/40 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleDriveSubmit} className="space-y-6 relative z-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] px-1">Drive Folder URL</label>
                  <input
                    type="url"
                    required
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full p-4 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 text-foreground transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground/50 leading-relaxed px-1">
                    Ensure the folder is set to <strong>&quot;Anyone with the link&quot;</strong> to allow the AI orchestrator to access assets.
                  </p>
                </div>

                {driveError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[12px] text-rose-500 font-medium">
                    {driveError}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDriveInput(false)}
                    className="flex-1 py-4 rounded-2xl text-sm font-bold border border-black/5 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={driveLoading || !driveUrl}
                    className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-bold shadow-glow hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {driveLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Synchronizing...
                      </>
                    ) : (
                      <>
                        <Cloud className="h-4 w-4" />
                        Import Assets
                      </>
                    )}
                  </button>
                </div>
              </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Gallery Notification */}
      <AnimatePresence>
        {showGalleryPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[60] min-w-[320px]">
            <div className="bg-white dark:bg-[#0B0D16] border border-emerald-500/20 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
              
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-bold text-foreground mb-1">Campaign Assets Ready</h4>
                  <p className="text-[12px] text-muted-foreground/60 leading-relaxed mb-4">
                    The AI orchestrator has successfully generated your editorial photography.
                  </p>
                  <div className="flex items-center gap-2">
                    <Link 
                      href="/gallery"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-[12px] font-bold shadow-glow-primary hover:opacity-90 transition-all active:scale-95"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Enter Gallery
                    </Link>
                    <button 
                      onClick={() => setShowGalleryPrompt(false)}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-white/[0.05] text-muted-foreground/60 rounded-xl text-[12px] font-bold hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
