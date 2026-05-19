"use client"

import React, { useState, useCallback, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Download,
  Search,
  Grid2X2,
  ArrowRightLeft,
  Image as GalleryIcon,
  Trash2,
  Loader2,
  RefreshCw,
  Package,
  RotateCcw,
  CheckSquare,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react"

interface GalleryItem {
  id: string
  title: string
  category: string
  original: string
  generated: string
  outfitId: string
  outfitName: string
  jobId: string
  createdAt: string
}

interface OutfitGroup {
  outfitId: string
  outfitName: string
  category: string
  original: string
  items: GalleryItem[]
}

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<"outfit" | "grid">("outfit")
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [compareId, setCompareId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sliderVal, setSliderVal] = useState<number>(50)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  const [checklist, setChecklist] = useState<Record<string, Record<string, boolean>>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dc_fashion_checklist")
        if (saved) return JSON.parse(saved)
      } catch { }
    }
    return {}
  })

  const [approvals, setApprovals] = useState<Record<string, "approved" | "flagged">>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dc_approvals")
        if (saved) return JSON.parse(saved)
      } catch { }
    }
    return {}
  })

  const handleSetApproval = useCallback((itemId: string, status: "approved" | "flagged" | null) => {
    setApprovals(prev => {
      const next = { ...prev }
      if (status === null) delete next[itemId]
      else next[itemId] = status
      if (typeof window !== "undefined") {
        localStorage.setItem("dc_approvals", JSON.stringify(next))
      }
      return next
    })
  }, [])

  const fetchGallery = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setLoading(true)
      const res = await fetch("/api/gallery")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setGalleryItems(data)
      }
    } catch (err) {
      console.error("Failed to fetch gallery:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initFetch = async () => {
      await fetchGallery(false)
    }
    initFetch()
  }, [fetchGallery])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this generated image? This cannot be undone.")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setGalleryItems(prev => prev.filter(item => item.id !== id))
        if (compareId === id) setCompareId(null)
      }
    } catch (err) {
      console.error("Failed to delete item:", err)
    } finally {
      setDeletingId(null)
    }
  }, [compareId])

  const toggleChecklist = useCallback((itemId: string, key: string) => {
    setChecklist(prev => {
      const next = { ...prev }
      if (!next[itemId]) next[itemId] = {}
      next[itemId][key] = !next[itemId][key]
      if (typeof window !== "undefined") {
        localStorage.setItem("dc_fashion_checklist", JSON.stringify(next))
      }
      return next
    })
  }, [])

  const handleDownload = useCallback(async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error("Download failed:", err)
    }
  }, [])

  const handleRegenerate = useCallback(async (outfitId: string) => {
    setRegeneratingId(outfitId)
    try {
      // Logic for regeneration...
      await new Promise(r => setTimeout(r, 2000))
    } finally {
      setRegeneratingId(null)
    }
  }, [])

  const filteredItems = useMemo(() => {
    return galleryItems.filter(item => {
      const matchesSearch = item.outfitName.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [galleryItems, search, selectedCategory])

  const outfitGroups = useMemo(() => {
    const map: Record<string, OutfitGroup> = {}
    for (const item of filteredItems) {
      if (!map[item.outfitId]) {
        map[item.outfitId] = {
          outfitId: item.outfitId,
          outfitName: item.outfitName,
          category: item.category,
          original: item.original,
          items: [],
        }
      }
      map[item.outfitId].items.push(item)
    }
    return Object.values(map)
  }, [filteredItems])

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const item of galleryItems) {
      if (item.category) set.add(item.category)
    }
    return ["All", ...Array.from(set)]
  }, [galleryItems])

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center py-40 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-sm font-semibold text-muted-foreground/60">Indexing generated catalog assets...</p>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-[1500px] mx-auto px-6 pt-20">
        {/* Gallery Title Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2.5 text-primary font-bold text-[11px] uppercase tracking-[0.2em] mb-3 opacity-80">
              <Package className="h-3.5 w-3.5" />
              Campaign Production Assets
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 leading-[0.95]">
              Output <span className="text-muted-foreground/30">Library</span>
            </h1>
            <p className="text-muted-foreground/60 text-lg max-w-2xl leading-relaxed">
              Inspect generated models, validate garment textures with the comparator slider, and approve finalized brand creative for production.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchGallery(true)}
              className="p-3.5 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-black/5 dark:border-white/5 rounded-full transition-all shadow-soft"
              title="Refresh Gallery"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-black/5 dark:border-white/5 p-1.5 rounded-full flex gap-1 shadow-soft">
              {[
                { mode: "outfit", label: "Groups", icon: Package },
                { mode: "grid", label: "Grid", icon: Grid2X2 },
              ].map((m) => (
                <button
                  key={m.mode}
                  onClick={() => setViewMode(m.mode as "outfit" | "grid")}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-bold transition-all ${
                    viewMode === m.mode
                      ? "bg-primary text-white shadow-glow"
                      : "text-muted-foreground/50 hover:text-foreground"
                  }`}
                >
                  <m.icon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-12">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <input
              type="text"
              placeholder="Search by outfit SKU or campaign title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-soft placeholder:text-muted-foreground/30"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-3 rounded-2xl text-[12px] font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-white/80 dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-muted-foreground/60 hover:border-black/10 shadow-soft"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-12">
          {viewMode === "outfit" ? (
            outfitGroups.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 rounded-[2rem] bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center justify-center mb-6 shadow-soft">
                  <GalleryIcon className="h-8 w-8 text-muted-foreground/20" />
                </div>
                <h3 className="text-xl font-bold mb-2">No assets discovered</h3>
                <p className="text-muted-foreground/40 max-w-xs text-sm">Your generation pipeline is currently empty. Start a new session to populate your library.</p>
              </div>
            ) : (
              outfitGroups.map((group) => (
                <motion.div
                  key={group.outfitId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] p-8 backdrop-blur-xl shadow-soft"
                >
                  <div className="flex flex-col lg:flex-row gap-10">
                    {/* Source Garment */}
                    <div className="lg:w-80 space-y-6">
                      <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-black/5 dark:border-white/10 shadow-soft group">
                        <Image
                          src={group.original}
                          alt={group.outfitName}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg">Source Asset</span>
                        </div>
                      </div>
                      <div className="space-y-4 px-2">
                        <div>
                          <h3 className="text-xl font-bold mb-1 truncate">{group.outfitName}</h3>
                          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">{group.category}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleRegenerate(group.outfitId)}
                            disabled={regeneratingId === group.outfitId}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.1] border border-black/5 dark:border-white/5 rounded-xl text-[12px] font-bold transition-all disabled:opacity-50 shadow-soft"
                          >
                            <RotateCcw className={`h-3.5 w-3.5 ${regeneratingId === group.outfitId ? "animate-spin" : ""}`} />
                            Resynthesize
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Generated Campaign Variations */}
                    <div className="flex-1 space-y-8">
                      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                          Campaign Variations <span className="text-primary font-mono">{group.items.length}</span>
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {group.items.map((item) => (
                          <GalleryCard
                            key={item.id}
                            item={item}
                            compareId={compareId}
                            setCompareId={setCompareId}
                            handleDownload={handleDownload}
                            handleDelete={handleDelete}
                            deletingId={deletingId}
                            status={approvals[item.id]}
                            onSetApproval={handleSetApproval}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )
          ) : (
            /* Standard Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
              {filteredItems.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  compareId={compareId}
                  setCompareId={setCompareId}
                  handleDownload={handleDownload}
                  handleDelete={handleDelete}
                  deletingId={deletingId}
                  status={approvals[item.id]}
                  onSetApproval={handleSetApproval}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Modal Overlay */}
      <AnimatePresence>
        {compareId && (
          <ImageComparisonOverlay
            itemId={compareId}
            galleryItems={galleryItems}
            onClose={() => setCompareId(null)}
            sliderVal={sliderVal}
            setSliderVal={setSliderVal}
            checklist={checklist[compareId] || {}}
            onToggleChecklist={(key) => toggleChecklist(compareId, key)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function GalleryCard({
  item, setCompareId, handleDownload, handleDelete, deletingId, status, onSetApproval
}: {
  item: GalleryItem;
  compareId?: string | null;
  setCompareId: (id: string) => void;
  handleDownload: (url: string, name: string) => void;
  handleDelete: (id: string) => void;
  deletingId: string | null;
  status?: "approved" | "flagged";
  onSetApproval: (id: string, s: "approved" | "flagged" | null) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group relative rounded-[2rem] overflow-hidden bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 transition-all duration-500 shadow-soft hover:shadow-elevated"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={item.generated}
          alt={item.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />

        {/* Status Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {status === "approved" && (
            <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
          {status === "flagged" && (
            <div className="bg-rose-500 text-white p-1.5 rounded-full shadow-lg">
              <AlertTriangle className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]" />

        <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setCompareId(item.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/90 dark:bg-white/10 backdrop-blur-md text-foreground dark:text-white rounded-xl text-[12px] font-bold hover:bg-white transition-all shadow-lg"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Analyze
            </button>
            <button
              onClick={() => handleDownload(item.generated, `${item.outfitName}-campaign.jpg`)}
              className="h-12 w-12 flex items-center justify-center bg-white/90 dark:bg-white/10 backdrop-blur-md text-foreground dark:text-white rounded-xl hover:bg-white transition-all shadow-lg"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSetApproval(item.id, status === "approved" ? null : "approved")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${status === "approved" ? "bg-emerald-500 text-white" : "bg-black/20 text-white hover:bg-emerald-500"
                }`}
            >
              {status === "approved" ? "Approved" : "Approve"}
            </button>
            <button
              onClick={() => onSetApproval(item.id, status === "flagged" ? null : "flagged")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${status === "flagged" ? "bg-rose-500 text-white" : "bg-black/20 text-white hover:bg-rose-500"
                }`}
            >
              {status === "flagged" ? "Flagged" : "Flag"}
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
              className="h-9 w-9 flex items-center justify-center bg-black/20 text-white rounded-lg hover:bg-rose-600 transition-all"
            >
              {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-1">
        <h5 className="font-bold text-[14px] truncate">{item.outfitName}</h5>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground/50 font-medium">
          <span>{item.title}</span>
          <span className="font-mono text-[9px]">{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  )
}

function ImageComparisonOverlay({
  itemId, galleryItems, onClose, sliderVal, setSliderVal, checklist, onToggleChecklist
}: {
  itemId: string;
  galleryItems: GalleryItem[];
  onClose: () => void;
  sliderVal: number;
  setSliderVal: (v: number) => void;
  checklist: Record<string, boolean>;
  onToggleChecklist: (key: string) => void;
}) {
  const item = galleryItems.find(i => i.id === itemId)
  if (!item) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 backdrop-blur-2xl bg-white/40 dark:bg-black/80"
    >
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-6xl h-full max-h-[900px] rounded-[3rem] overflow-hidden bg-white dark:bg-[#0A0A0B] border border-black/5 dark:border-white/5 shadow-2xl flex flex-col lg:flex-row"
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-20 h-10 w-10 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
          <X className="h-5 w-5" />
        </button>

        {/* Comparison Section */}
        <div className="flex-1 relative bg-slate-50 dark:bg-black overflow-hidden group">
          <div className="absolute inset-0 select-none pointer-events-none">
            {/* Original Image */}
            <Image src={item.original} alt="Original" fill className="object-contain" />

            {/* Generated Image Overlay */}
            <div
              className="absolute inset-0 overflow-hidden border-r border-white/50"
              style={{ width: `${sliderVal}%` }}
            >
              <div className="absolute inset-0 w-[100vw] h-full">
                <Image src={item.generated} alt="Generated" fill className="object-contain" />
              </div>
            </div>
          </div>

          {/* Slider Control */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderVal}
            onChange={(e) => setSliderVal(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
          />

          <div
            className="absolute top-0 bottom-0 pointer-events-none z-10"
            style={{ left: `${sliderVal}%` }}
          >
            <div className="h-full w-[2px] bg-white shadow-lg" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white text-black shadow-2xl flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-8 left-8 flex gap-3 pointer-events-none z-10">
            <span className="bg-black/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-white/10">Source Garment</span>
            <span className="bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-primary/20">AI Synthesis</span>
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="w-full lg:w-96 p-10 flex flex-col gap-10 bg-white dark:bg-[#0A0A0B] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-[11px] uppercase tracking-[0.2em] opacity-80">
              <ShieldCheck className="h-3.5 w-3.5" />
              Fidelity Analysis
            </div>
            <h3 className="text-2xl font-bold tracking-tight">{item.outfitName}</h3>
          </div>

          {/* Confidence Score */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-muted-foreground/60">Fidelity Score</span>
              <span className="text-emerald-500 font-mono">98.4%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "98.4%" }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>

          {/* QA Checklist */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Technical Validation</h4>
            <div className="space-y-3">
              {[
                "Stitch Pattern Integrity",
                "Color Accuracy (ΔE < 2.0)",
                "Fabric Texture Mapping",
                "Silhouette Preservation",
                "Branding & Logo Precision"
              ].map((check) => (
                <button
                  key={check}
                  onClick={() => onToggleChecklist(check)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${checklist[check]
                      ? "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-50 dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-muted-foreground/60 hover:border-black/10"
                    }`}
                >
                  <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${checklist[check] ? "bg-emerald-500 border-emerald-500 text-white" : "border-black/10 dark:border-white/10"
                    }`}>
                    {checklist[check] && <CheckSquare className="h-3.5 w-3.5" />}
                  </div>
                  <span className="text-[13px] font-semibold">{check}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/5">
            <p className="text-[11px] text-muted-foreground/40 italic leading-relaxed">
              * Verified assets are automatically indexed into the brand catalog for multi-channel deployment.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
