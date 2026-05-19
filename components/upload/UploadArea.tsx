"use client"
import React, { useCallback, useState } from "react"
import UploadCard from "./UploadCard"
import { Upload, Cloud, Zap, ArrowRight, Sparkles, FolderUp, Globe, Link as LinkIcon, Eye, Save, FileText, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import JSZip from "jszip"

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
  outputsRequested: number
  prompt: string
  referenceSelections?: ReferenceSelections
  onProjectReady?: (projectId: string) => void
}

export default function UploadArea({ outputsRequested, prompt, referenceSelections, onProjectReady }: UploadAreaProps) {
  const [items, setItems] = useState<FileEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [driveUrl, setDriveUrl] = useState("")
  const [showDriveInput, setShowDriveInput] = useState(false)
  const [driveLoading, setDriveLoading] = useState(false)
  const [driveError, setDriveError] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  // Advanced Prompt Editable Layer state
  const [showPromptPreview, setShowPromptPreview] = useState(false)
  const [customPrompt, setCustomPrompt] = useState<string>("")
  const [refiningPrompt, setRefiningPrompt] = useState(false)

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

  const handleRetry = useCallback(() => {
    window.location.reload()
  }, [])

  // Initialize a default project for the assignment
  React.useEffect(() => {
    let active = true
    const initProject = async () => {
      try {
        const res = await fetch("/api/projects")
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          if (active) setInitError(errData.details || `Server returned ${res.status}`)
          return
        }
        const projects = await res.json()
        if (Array.isArray(projects) && projects.length > 0) {
          if (active) {
            setProjectId(projects[0].id)
            onProjectReady?.(projects[0].id)
          }
        } else {
          const createRes = await fetch("/api/projects", {
            method: "POST",
            body: JSON.stringify({ projectName: "Default Project" }),
            headers: { "Content-Type": "application/json" }
          })
          if (!createRes.ok) {
            const errData = await createRes.json().catch(() => ({}))
            if (active) setInitError(errData.details || `Failed to create default project`)
            return
          }
          const newProject = await createRes.json()
          if (active) {
            setProjectId(newProject.id)
            onProjectReady?.(newProject.id)
          }
        }
        if (active) setInitError(null)
      } catch (err) {
        console.error("Failed to init project:", err)
        if (active) setInitError(err instanceof Error ? err.message : "Unknown initialization error")
      } finally {
        if (active) setIsInitializing(false)
      }
    }
    
    initProject()
    return () => { active = false }
  }, [onProjectReady])

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

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return
    processFiles(Array.from(files))
  }, [processFiles])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    e.currentTarget.value = ""
  }, [addFiles])

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
        setItems((s) => s.map((x) => (x.id === it.id ? { ...x, status: "processing", progress: 5 } : x)))
        
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

        // Animate progress while the background worker processes
        let p = 5
        const interval = setInterval(() => {
          p = Math.min(95, p + 2)
          setItems((s) => s.map((x) => (x.id === it.id ? { ...x, progress: p } : x)))
          if (p >= 95) {
            clearInterval(interval)
            setItems((s) => s.map((x) => (x.id === it.id ? { ...x, status: "done", progress: 100 } : x)))
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

  const uploadedCount = items.filter(it => it.status === "uploaded").length
  const processingCount = items.filter(it => it.status === "processing").length
  const doneCount = items.filter(it => it.status === "done").length

  return (
    <div className="space-y-8">
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative overflow-hidden rounded-[2rem] border-2 border-dashed transition-all duration-300 ${
          isDragging 
            ? "border-violet-500 bg-violet-500/5 shadow-2xl shadow-violet-500/10 scale-[0.99]" 
            : "border-border/60 bg-card/30 hover:border-border hover:bg-card/50"
        } ${isInitializing || initError ? "pointer-events-none" : ""}`}
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(124,58,237,0.1),transparent)]" />
        
        {isInitializing && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px]">
            <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Initializing AI Workspace...</p>
          </div>
        )}

        {initError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold mb-2">Connection Error</h4>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              {initError}. Please check your database connection.
            </p>
            <button 
              onClick={handleRetry}
              className="bg-foreground text-background px-6 py-2 rounded-full text-sm font-bold active:scale-95 transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <motion.div 
            initial={false}
            animate={{ y: isDragging ? -10 : 0 }}
            className="mb-8 h-20 w-20 rounded-[2rem] bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-transform duration-300 group-hover:scale-105"
          >
            <Upload className="h-9 w-9 text-white" />
          </motion.div>
          
          <h3 className="text-3xl font-extrabold tracking-tight text-foreground mb-3 font-display">
            Upload your garments
          </h3>
          <p className="text-muted-foreground font-medium max-w-sm mb-8 text-sm leading-relaxed">
            Drag and drop high-res images, ZIP folders, or directly import from your Google Drive folder.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <label className="group relative">
              <input type="file" multiple accept="image/*,.zip" onChange={onFileInput} className="hidden" />
              <div className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest cursor-pointer transition-all hover:shadow-lg active:scale-95">
                <FolderUp className="h-4 w-4" />
                Select Files / ZIP
              </div>
            </label>
            
            <button 
              onClick={() => setShowDriveInput(!showDriveInput)}
              className="flex items-center gap-2 bg-secondary/80 hover:bg-secondary text-foreground px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all active:scale-95 border border-border/50 hover:border-violet-500/30"
            >
              <Globe className="h-4 w-4 text-violet-400" />
              Google Drive
            </button>
          </div>

          <AnimatePresence>
            {showDriveInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="w-full max-w-md mt-6 overflow-hidden"
              >
                <form onSubmit={handleDriveSubmit}>
                  <div className={`flex items-center gap-2 bg-secondary/30 backdrop-blur-sm border rounded-2xl p-1.5 transition-all focus-within:ring-2 focus-within:ring-violet-500/20 ${
                    driveError ? "border-rose-500/50" : "border-border/50 focus-within:border-violet-500/40"
                  }`}>
                    <div className="pl-3">
                      {driveLoading 
                        ? <div className="h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        : <LinkIcon className="h-4 w-4 text-violet-400" />
                      }
                    </div>
                    <input 
                      type="url" 
                      placeholder="Paste Google Drive link..." 
                      value={driveUrl}
                      onChange={(e) => { setDriveUrl(e.target.value); setDriveError(null) }}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-xs py-2 px-2 text-foreground placeholder:text-muted-foreground/60 font-medium"
                      required
                      disabled={driveLoading}
                    />
                    <button 
                      type="submit" 
                      disabled={driveLoading || !driveUrl}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {driveLoading ? "Importing..." : "Import"}
                    </button>
                  </div>
                </form>
                {driveError && (
                  <p className="mt-2 text-xs text-rose-400 text-left px-2 font-medium">
                    ⚠ {driveError}
                  </p>
                )}
                <p className="mt-2 text-[10px] text-muted-foreground/50 text-left px-2 leading-relaxed">
                  The folder/file must be set to &ldquo;Anyone with the link can view&rdquo; in Google Drive.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-10 flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
            <span className="flex items-center gap-1.5"><Cloud className="h-3.5 w-3.5 text-violet-400" /> Auto-sync</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-400" /> Fast processing</span>
            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-sky-400 animate-pulse" /> AI Analysis</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {items.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  Queue <span className="h-5 w-5 rounded-full bg-secondary text-[10px] flex items-center justify-center text-foreground">{items.length}</span>
                </h4>
                {/* Status badges */}
                {uploadedCount > 0 && (
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {uploadedCount} ready
                  </span>
                )}
                {processingCount > 0 && (
                  <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 animate-pulse">
                    {processingCount} generating
                  </span>
                )}
                {doneCount > 0 && (
                  <span className="text-[10px] font-bold bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/20">
                    {doneCount} done
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {doneCount > 0 && (
                  <a
                    href="/gallery"
                    className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-xs font-bold transition-all hover:bg-secondary/80 border border-border/50"
                  >
                    View Gallery →
                  </a>
                )}
                {uploadedCount > 0 && (
                  <button
                    onClick={() => {
                      setCustomPrompt(getCompiledPrompt())
                      setShowPromptPreview(true)
                    }}
                    disabled={processingCount > 0}
                    className="flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-full text-xs font-bold transition-all border border-border/50 active:scale-95 disabled:opacity-50"
                  >
                    <Eye className="h-3.5 w-3.5" /> Prompt Preview
                  </button>
                )}
                <button 
                  onClick={handleStartGenerationClick}
                  disabled={uploadedCount === 0 || processingCount > 0 || refiningPrompt}
                  className="group flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-violet-500/20 active:scale-95"
                >
                  {processingCount > 0 ? (
                    <>
                      <div className="h-3 w-3 rounded-full border border-white border-t-transparent animate-spin" />
                      Generating {outputsRequested} per outfit...
                    </>
                  ) : refiningPrompt ? (
                    <>
                      <div className="h-3 w-3 rounded-full border border-white border-t-transparent animate-spin" />
                      AI Refinement Layer...
                    </>
                  ) : (
                    <>
                      Start Generation ({outputsRequested} per outfit)
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {items.map((it) => (
                <UploadCard key={it.id} item={it} onRemove={() => removeItem(it.id)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Prompt Preview & Editable Layer Modal */}
      <AnimatePresence>
        {showPromptPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl rounded-[2.5rem] border border-border/50 bg-[#0c0a14] p-8 shadow-2xl shadow-violet-500/5 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Decorative radial glow */}
              <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                    <FileText className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">✨ Confirm AI Enhanced Prompt</h2>
                    <p className="text-xs text-muted-foreground">The hybrid AI creative layer has refined your prompt. Review and tweak before confirming generation!</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPromptPreview(false)}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Editable Area */}
              <div className="flex-1 overflow-y-auto mb-6 relative z-10 space-y-4 pr-2">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-300 leading-relaxed">
                  💡 <strong>Expert tip:</strong> The prompt uses the <strong>5-block system</strong> to preserve garments exactly. You can fine-tune instructions here. Do not remove the <code>[OUTFIT PRESERVATION]</code> section if you wish to maintain garment accuracy.
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Compiled Prompt</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full min-h-[350px] p-5 bg-card/40 border border-border/50 rounded-3xl text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-foreground resize-none"
                    placeholder="Enter custom prompt instructions..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border/40 relative z-10">
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
                    className="px-5 py-2.5 rounded-full text-xs font-bold border border-border/50 hover:bg-secondary text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowPromptPreview(false)
                      startGeneration()
                    }}
                    className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-lg shadow-violet-500/20 active:scale-95"
                  >
                    <Save className="h-4 w-4" /> Confirm & Generate 🚀
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
