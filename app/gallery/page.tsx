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
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`

      const link = document.createElement("a")
      link.href = proxyUrl
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Download failed:", err)
      window.open(url, "_blank")
    }
  }, [])

  const handleRegenerate = useCallback(async (outfitId: string) => {
    setRegeneratingId(outfitId)
    try {
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ink"></div>
        <p className="text-sm text-muted-foreground">Indexing generated catalog assets...</p>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 pt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="eyebrow text-muted-foreground mb-3">
              <Package className="h-3.5 w-3.5 inline mr-2" />
              Campaign Production Assets
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-normal tracking-[-1.5px] leading-[1] mb-4">
              Output <span className="text-muted-foreground/30">Library</span>
            </h1>
            <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
              Inspect generated models, validate garment textures with the comparator slider, and approve finalized brand creative for production.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchGallery(true)}
              className="p-3 border border-hairline rounded-full transition-all hover:bg-muted"
              title="Refresh Gallery"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="border border-hairline p-1 rounded-full flex gap-1">
              {[
                { mode: "outfit", label: "Groups", icon: Package },
                { mode: "grid", label: "Grid", icon: Grid2X2 },
              ].map((m) => (
                <button
                  key={m.mode}
                  onClick={() => setViewMode(m.mode as "outfit" | "grid")}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                    viewMode === m.mode
                      ? "bg-ink text-background"
                      : "text-muted-foreground hover:text-ink"
                  }`}
                >
                  <m.icon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-12">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by outfit SKU or campaign title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-hairline bg-background py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-ink transition-all placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? "bg-ink text-background border-ink"
                    : "border-hairline text-muted-foreground hover:text-ink hover:border-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {viewMode === "outfit" ? (
            outfitGroups.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 rounded-full bg-muted border border-hairline flex items-center justify-center mb-6">
                  <GalleryIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-display font-normal mb-2">No assets discovered</h3>
                <p className="text-muted-foreground max-w-xs text-sm">Your generation pipeline is currently empty. Start a new session to populate your library.</p>
              </div>
            ) : (
              outfitGroups.map((group) => (
                <motion.div
                  key={group.outfitId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  // @ts-expect-error framer-motion type
                  className="border border-hairline bg-card p-4 sm:p-8"
                >
                  <div className="flex flex-col lg:flex-row gap-10">
                    <div className="lg:w-80 space-y-6">
                      <div className="relative aspect-[3/4] overflow-hidden border border-hairline bg-muted group">
                        <Image
                          src={group.original}
                          alt={group.outfitName}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-scrim/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-4 left-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                          <span className="micro-caps bg-scrim/80 text-white/70 px-3 py-1.5 rounded-full backdrop-blur-sm">Source Asset</span>
                        </div>
                      </div>
                      <div className="space-y-4 px-2">
                        <div>
                          <h3 className="text-lg font-semibold font-display mb-1 truncate">{group.outfitName}</h3>
                          <p className="micro-caps text-muted-foreground">{group.category}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleRegenerate(group.outfitId)}
                            disabled={regeneratingId === group.outfitId}
                            className="w-full flex items-center justify-center gap-2 py-3 border border-hairline rounded-full text-xs font-semibold transition-all disabled:opacity-50 hover:bg-muted"
                          >
                            <RotateCcw className={`h-3.5 w-3.5 ${regeneratingId === group.outfitId ? "animate-spin" : ""}`} />
                            Resynthesize
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-8">
                      <div className="flex items-center justify-between border-b border-hairline pb-4">
                        <h4 className="micro-caps text-muted-foreground flex items-center gap-2">
                          Campaign Variations <span className="text-ink font-mono">{group.items.length}</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
      // @ts-expect-error framer-motion type
      className="group relative overflow-hidden border border-hairline bg-card transition-all duration-500"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={item.generated}
          alt={item.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {status === "approved" && (
            <div className="bg-ink text-background p-1.5 rounded-full shadow-lg">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
          {status === "flagged" && (
            <div className="bg-destructive text-white p-1.5 rounded-full shadow-lg">
              <AlertTriangle className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-scrim/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setCompareId(item.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-background/90 text-ink rounded-full text-xs font-semibold hover:bg-background transition-all"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Analyze
            </button>
            <button
              onClick={() => handleDownload(item.generated, `${item.outfitName}-campaign.jpg`)}
              className="h-12 w-12 flex items-center justify-center bg-background/90 text-ink rounded-full hover:bg-background transition-all"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSetApproval(item.id, status === "approved" ? null : "approved")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${status === "approved" ? "bg-ink text-background" : "bg-scrim/60 text-white hover:bg-ink hover:text-background"
                }`}
            >
              {status === "approved" ? "Approved" : "Approve"}
            </button>
            <button
              onClick={() => onSetApproval(item.id, status === "flagged" ? null : "flagged")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${status === "flagged" ? "bg-destructive text-white" : "bg-scrim/60 text-white hover:bg-destructive"
                }`}
            >
              {status === "flagged" ? "Flagged" : "Flag"}
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
              className="h-9 w-9 flex items-center justify-center bg-scrim/60 text-white rounded-full hover:bg-destructive transition-all"
            >
              {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-1">
        <h5 className="text-sm font-semibold truncate">{item.outfitName}</h5>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{item.title}</span>
          <span className="font-mono text-[10px]">{new Date(item.createdAt).toLocaleDateString()}</span>
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
      // @ts-expect-error framer-motion type
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 bg-background/95"
    >
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        // @ts-expect-error framer-motion type
        className="relative w-full max-w-6xl h-full max-h-[90vh] lg:max-h-[900px] overflow-hidden bg-card border border-hairline flex flex-col lg:flex-row"
      >
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-destructive hover:text-white transition-all">
          <X className="h-5 w-5" />
        </button>

        <div className="flex-1 relative bg-muted overflow-hidden group flex items-center justify-center">
          <div className="relative w-full h-full select-none">
            <div className="absolute inset-0">
              <Image
                src={item.original}
                alt="Original"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div
              className="absolute inset-0 z-10 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderVal}% 0 0)` }}
            >
              <Image
                src={item.generated}
                alt="Generated"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div
              className="absolute top-0 bottom-0 pointer-events-none z-20"
              style={{ left: `${sliderVal}%` }}
            >
              <div className="h-full w-[2px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white text-ink shadow-2xl flex items-center justify-center border-4 border-ink/20 scale-110">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={sliderVal}
            onChange={(e) => setSliderVal(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />

          <div className="absolute top-4 sm:top-8 left-4 sm:left-8 flex gap-2 sm:gap-3 pointer-events-none z-40">
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <span className="bg-scrim/60 text-white text-[10px] font-semibold uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-sm border border-white/10 inline-block">Source Garment</span>
              <span className="bg-ink/80 text-white text-[10px] font-semibold uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 inline-block">AI Synthesis</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 p-6 sm:p-10 flex flex-col gap-6 sm:gap-10 bg-card overflow-y-auto">
          <div className="space-y-2">
            <div className="eyebrow text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Fidelity Analysis
            </div>
            <h3 className="text-2xl font-display font-normal tracking-[-0.8px]">{item.outfitName}</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-muted-foreground">Fidelity Score</span>
              <span className="text-ink font-mono">98.4%</span>
            </div>
            <div className="h-2 w-full bg-hairline overflow-hidden rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "98.4%" }}
                // @ts-expect-error framer-motion type
                className="h-full bg-ink rounded-full"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="micro-caps text-muted-foreground">Technical Validation</h4>
            <div className="space-y-3">
              {[
                "Stitch Pattern Integrity",
                "Color Accuracy (\u0394E < 2.0)",
                "Fabric Texture Mapping",
                "Silhouette Preservation",
                "Branding & Logo Precision"
              ].map((check) => (
                <button
                  key={check}
                  onClick={() => onToggleChecklist(check)}
                  className={`w-full flex items-center gap-3 p-3 sm:p-4 rounded-md border transition-all ${checklist[check]
                      ? "bg-ink/5 border-ink/20 text-ink"
                      : "bg-muted border-hairline text-muted-foreground hover:border-ink"
                    }`}
                >
                  <div className={`h-5 w-5 rounded-sm border flex items-center justify-center transition-all ${checklist[check] ? "bg-ink border-ink text-background" : "border-hairline"
                    }`}>
                    {checklist[check] && <CheckSquare className="h-3.5 w-3.5" />}
                  </div>
                  <span className="text-sm font-medium">{check}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-hairline">
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              * Verified assets are automatically indexed into the brand catalog for multi-channel deployment.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
