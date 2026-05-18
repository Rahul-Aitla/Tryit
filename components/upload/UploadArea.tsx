"use client"
import React, { useCallback, useState } from "react"
import UploadCard from "./UploadCard"
import { Upload, Cloud, Zap, ArrowRight, Sparkles, FolderUp, Globe, Link as LinkIcon } from "lucide-react"
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

interface UploadAreaProps {
  outputsRequested: number
  prompt: string
}

export default function UploadArea({ outputsRequested, prompt }: UploadAreaProps) {
  const [items, setItems] = useState<FileEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [driveUrl, setDriveUrl] = useState("")
  const [showDriveInput, setShowDriveInput] = useState(false)
  const [driveLoading, setDriveLoading] = useState(false)
  const [driveError, setDriveError] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

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
          if (active) setProjectId(projects[0].id)
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
          if (active) setProjectId(newProject.id)
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
  }, [])

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
            prompt: prompt || "High-end commercial fashion photography",
            outputsRequested: outputsRequested  // ✅ now uses the prop from RightSidebar
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
  }, [items, outputsRequested, prompt])

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
        
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <motion.div 
            initial={false}
            animate={{ y: isDragging ? -10 : 0 }}
            className="mb-6 h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/20"
          >
            <Upload className="h-10 w-10" />
          </motion.div>
          
          <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Upload your garments
          </h3>
          <p className="text-muted-foreground max-w-sm mb-8">
            Drag and drop images, ZIP folders, or import from your favorite cloud storage.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <label className="group relative">
              <input type="file" multiple accept="image/*,.zip" onChange={onFileInput} className="hidden" />
              <div className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-semibold cursor-pointer transition-all hover:shadow-lg hover:shadow-foreground/10 active:scale-95">
                <FolderUp className="h-4 w-4" />
                Select Files / ZIP
              </div>
            </label>
            
            <button 
              onClick={() => setShowDriveInput(!showDriveInput)}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-semibold transition-all hover:bg-secondary/80 active:scale-95 border border-border/50"
            >
              <Globe className="h-4 w-4" />
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
                  <div className={`flex items-center gap-2 bg-secondary/50 border rounded-2xl p-1.5 transition-all focus-within:ring-2 focus-within:ring-violet-500/20 ${
                    driveError ? "border-rose-500/50" : "border-border/50"
                  }`}>
                    <div className="pl-3">
                      {driveLoading 
                        ? <div className="h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        : <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      }
                    </div>
                    <input 
                      type="url" 
                      placeholder="Paste Google Drive folder or file link..." 
                      value={driveUrl}
                      onChange={(e) => { setDriveUrl(e.target.value); setDriveError(null) }}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2"
                      required
                      disabled={driveLoading}
                    />
                    <button 
                      type="submit" 
                      disabled={driveLoading || !driveUrl}
                      className="bg-foreground text-background px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      {driveLoading ? "Importing..." : "Import"}
                    </button>
                  </div>
                </form>
                {driveError && (
                  <p className="mt-2 text-xs text-rose-400 text-left px-1">
                    ⚠ {driveError}
                  </p>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground/60 text-left px-1">
                  The folder/file must be set to &ldquo;Anyone with the link can view&rdquo; in Google Drive.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-8 flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <span className="flex items-center gap-1.5"><Cloud className="h-3 w-3" /> Auto-sync</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> Fast processing</span>
            <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> AI Analysis</span>
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
                <button 
                  onClick={startGeneration}
                  disabled={uploadedCount === 0 || processingCount > 0}
                  className="group flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-violet-500/20 active:scale-95"
                >
                  {processingCount > 0 ? (
                    <>
                      <div className="h-3 w-3 rounded-full border border-white border-t-transparent animate-spin" />
                      Generating {outputsRequested} per outfit...
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
    </div>
  )
}
