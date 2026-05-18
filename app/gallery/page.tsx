"use client"
import React, { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { 
  Download, 
  Filter, 
  Search, 
  Grid2X2, 
  LayoutList, 
  ArrowRightLeft,
  Image as GalleryIcon,
  Trash2,
  Loader2,
  RefreshCw
} from "lucide-react"

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  original: string;
  generated: string;
}

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [viewMode, setViewMode] = useState("grid")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [compareId, setCompareId] = useState<string | null>(null)

  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/gallery")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setGalleryItems(data)
        }
      } else {
        console.error("Gallery API failed:", res.status)
      }
    } catch (err) {
      console.error("Failed to fetch gallery:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this generated image? This cannot be undone.")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" })
      if (res.ok) {
        setGalleryItems(prev => prev.filter(item => item.id !== id))
      } else {
        alert("Failed to delete image.")
      }
    } catch (err) {
      console.error("Delete error:", err)
      alert("Failed to delete image.")
    } finally {
      setDeletingId(null)
    }
  }, [])

  const handleDownload = useCallback(async (url: string, filename: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = objectUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    } catch {
      // fallback: open in new tab
      window.open(url, "_blank")
    }
  }, [])

  const handleDownloadAll = useCallback(async () => {
    for (const item of filteredItems) {
      await handleDownload(item.generated, `${item.title}-generated.jpg`)
      await new Promise(r => setTimeout(r, 300)) // small delay between downloads
    }
  }, [galleryItems, selectedCategory, search]) // eslint-disable-line react-hooks/exhaustive-deps

  const categories = ["All", ...Array.from(new Set(galleryItems.map(item => item.category)))]

  const filteredItems = galleryItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-[1400px] mx-auto px-6 pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Output <span className="text-muted-foreground/40">Gallery</span></h1>
            <p className="text-muted-foreground text-lg">Browse, compare and export your AI-generated fashion assets.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search gallery..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-secondary/50 border border-border/50 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-64"
              />
            </div>
            <button 
              onClick={fetchGallery}
              title="Refresh gallery"
              className="p-2.5 bg-secondary/50 border border-border/50 rounded-full hover:bg-secondary transition-colors"
            >
              <RefreshCw className="h-5 w-5 text-foreground/70" />
            </button>
            {filteredItems.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-violet-500/20 active:scale-95"
              >
                <Download className="h-4 w-4" />
                Download All ({filteredItems.length})
              </button>
            )}
          </div>
        </div>

        {/* Filters + View Toggle */}
        <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  selectedCategory === cat 
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">{filteredItems.length} images</span>
            <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl border border-border/40">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-card shadow-sm text-violet-500" : "text-muted-foreground"}`}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-card shadow-sm text-violet-500" : "text-muted-foreground"}`}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Compare Modal */}
        <AnimatePresence>
          {compareId && (() => {
            const item = galleryItems.find(i => i.id === compareId)
            if (!item) return null
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={() => setCompareId(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-card rounded-3xl p-6 max-w-4xl w-full"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">{item.title} — Before / After</h3>
                    <button onClick={() => setCompareId(null)} className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Original</p>
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                        <Image src={item.original} alt="Original" fill sizes="(max-width: 768px) 50vw, 400px" className="object-cover" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">AI Generated</p>
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                        <Image src={item.generated} alt="Generated" fill sizes="(max-width: 768px) 50vw, 400px" className="object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleDownload(item.generated, `${item.title}-generated.jpg`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-violet-700 transition-colors"
                    >
                      <Download className="h-4 w-4" /> Download Generated
                    </button>
                    <button
                      onClick={() => handleDownload(item.original, `${item.title}-original.jpg`)}
                      className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl font-bold text-sm hover:bg-secondary/80 transition-colors"
                    >
                      <Download className="h-4 w-4" /> Original
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )
          })()}
        </AnimatePresence>

        {/* Grid */}
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" 
          : "flex flex-col gap-4"
        }>
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className={viewMode === "grid" ? "group relative" : "group relative flex items-center gap-6 p-4 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/50 transition-all"}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {viewMode === "grid" ? (
                  <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-muted ring-1 ring-border/50 shadow-2xl transition-all group-hover:shadow-violet-500/10 group-hover:-translate-y-2">
                    <Image 
                      src={hoveredId === item.id ? item.generated : item.original} 
                      alt={item.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-all duration-700 ease-out"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        {hoveredId === item.id ? "AI Generated" : "Original"}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <h3 className="text-white font-bold text-lg mb-1 truncate">{item.title}</h3>
                      <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-4">{item.category}</p>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDownload(item.generated, `${item.title}-generated.jpg`)}
                          className="flex-1 bg-white text-black py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </button>
                        <button 
                          onClick={() => setCompareId(item.id)}
                          className="p-2.5 bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/30 transition-colors"
                          title="Compare original vs generated"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-rose-500/50 transition-colors disabled:opacity-50"
                          title="Delete image"
                        >
                          {deletingId === item.id 
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // List view
                  <>
                    <div className="relative h-20 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                      <Image src={item.generated} alt={item.title} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setCompareId(item.id)}
                        className="p-2 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
                        title="Compare"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(item.generated, `${item.title}-generated.jpg`)}
                        className="p-2 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-2 bg-secondary/50 rounded-xl hover:bg-rose-500/20 text-rose-500 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === item.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredItems.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="h-20 w-20 rounded-3xl bg-secondary flex items-center justify-center mb-6">
              <GalleryIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {search ? `No results for "${search}"` : "No assets yet"}
            </h3>
            <p className="text-muted-foreground max-w-xs mb-6">
              {search ? "Try a different search term." : "Upload outfit images and start generating to see them here."}
            </p>
            {!search && (
              <a href="/upload" className="bg-violet-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-violet-700 transition-colors">
                Go to Upload →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
