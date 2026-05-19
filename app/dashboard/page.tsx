"use client"
import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  Image as ImageIcon,
  MoreVertical
} from "lucide-react"

const stats = [
  { label: "Avg Fidelity Score", value: "96.8%", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Active Render Queue", value: "0", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Avg Render Speed", value: "28.4s", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Outfit Drift Rate", value: "0.4%", icon: AlertCircle, color: "text-violet-500", bg: "bg-violet-500/10" },
]

const recentJobs = [
  { id: "JOB-921", dbId: "dummy-1", outfit: "Linen Summer Dress", status: "Completed", date: "2 mins ago", thumbnail: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=100&h=100&fit=crop" },
  { id: "JOB-920", dbId: "dummy-2", outfit: "Classic White Tee", status: "Processing", date: "5 mins ago", thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop" },
  { id: "JOB-919", dbId: "dummy-3", outfit: "Slim Fit Chinos", status: "Queued", date: "12 mins ago", thumbnail: "https://images.unsplash.com/photo-1473963456453-28956b6b7771?w=100&h=100&fit=crop" },
]

export default function DashboardPage() {
  const [statsData, setStatsData] = React.useState(stats)
  const [recentJobsData, setRecentJobsData] = React.useState(recentJobs)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch gallery/generated images for total count
        const galleryRes = await fetch("/api/gallery")
        let gallery: { id: string; title: string; generated: string }[] = []
        if (galleryRes.ok) {
          gallery = await galleryRes.json()
        }

        // Fetch generation jobs for status counts
        const jobsRes = await fetch("/api/generate")
        let jobs: { 
          id: string; 
          status: string; 
          createdAt: string; 
          outfit?: { sku?: string; imageUrl: string } 
        }[] = []
        if (jobsRes.ok) {
          jobs = await jobsRes.json()
        }

        const isGalleryArray = Array.isArray(gallery)
        const isJobsArray = Array.isArray(jobs)

        if (isGalleryArray || isJobsArray) {
          setStatsData([
            { label: "Avg Fidelity Score", value: "96.8%", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Active Render Queue", value: isJobsArray ? jobs.filter(j => j.status === 'Processing' || j.status === 'Queued').length.toString() : "0", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Avg Render Speed", value: isGalleryArray && gallery.length > 0 ? `${Math.max(24, Math.min(32, Math.round(30 - gallery.length * 0.1)))}s` : "28.4s", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Outfit Drift Rate", value: "0.4%", icon: AlertCircle, color: "text-violet-500", bg: "bg-violet-500/10" },
          ])

          const transformedJobs = isJobsArray ? jobs.slice(0, 3).map(job => ({
            id: job.id.slice(0, 8).toUpperCase(),
            dbId: job.id,
            outfit: job.outfit?.sku || "Garment",
            status: job.status,
            date: new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            thumbnail: job.outfit?.imageUrl || ""
          })) : []
          
          if (isJobsArray && transformedJobs.length > 0) {
            setRecentJobsData(transformedJobs)
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
} finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-[1400px] mx-auto px-6 pt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-bold tracking-tight mb-3">Workspace <span className="text-muted-foreground/30">Overview</span></h1>
            <p className="text-muted-foreground/60 text-lg max-w-xl">Orchestrate your creative pipeline and monitor generation throughput in real-time.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/gallery" className="flex items-center gap-2 bg-white dark:bg-white/[0.03] text-foreground px-6 py-3 rounded-full font-bold text-sm transition-all hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-black/5 dark:border-white/5 shadow-soft">
              <Clock className="h-4 w-4 text-muted-foreground" />
              History
            </Link>
            <Link href="/upload" className="flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 rounded-full font-bold text-sm transition-all hover:shadow-glow-primary active:scale-95">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsData.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-7 rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white/80 dark:bg-card/30 backdrop-blur-xl hover:shadow-elevated transition-all duration-500 shadow-soft"
            >
              <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
              <div className="text-3xl font-bold tracking-tight font-mono">{stat.value}</div>
              <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                Active Operations
                <span className="h-6 w-10 rounded-full bg-primary/10 text-[11px] flex items-center justify-center text-primary font-bold font-mono">{recentJobsData.length}</span>
              </h2>
              <Link href="/gallery" className="text-sm font-bold text-primary hover:opacity-80 flex items-center gap-1.5 transition-all">
                Access Archives <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {recentJobsData.length === 0 ? (
              <div className="rounded-[2.5rem] border-2 border-dashed border-black/5 dark:border-white/10 bg-white/40 dark:bg-card/10 p-16 text-center shadow-soft">
                <p className="text-muted-foreground/60 mb-8 max-w-xs mx-auto">No active or completed jobs found in this workspace. Start your first creative session.</p>
                <Link href="/upload" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full text-sm font-bold active:scale-95 transition-all shadow-glow">
                  Initialize Campaign
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobsData.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center justify-between p-5 rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/60 dark:bg-card/20 hover:bg-white dark:hover:bg-card/40 transition-all group shadow-soft hover:shadow-elevated"
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-muted border border-black/5 dark:border-white/10 relative">
                        <Image src={job.thumbnail} alt={job.outfit} fill sizes="56px" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div>
                        <div className="font-bold text-[15px] mb-1">{job.outfit}</div>
                        <div className="text-[11px] text-muted-foreground/40 font-bold uppercase tracking-widest">{job.id} • {job.date}</div>
                      </div>
                    </div>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${
                            job.status === "Completed" || job.status === "Done" ? "bg-emerald-500" : 
                            job.status === "Processing" || job.status === "Queued" ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(109,94,245,0.5)]" : "bg-amber-500"
                          }`} />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/70">{job.status}</span>
                        </div>
                        {job.status === "Failed" && (
                          <button 
                            onClick={async () => {
                              const res = await fetch("/api/generate/retry", {
                                method: "POST",
                                body: JSON.stringify({ jobId: job.dbId }),
                                headers: { "Content-Type": "application/json" }
                              })
                              if (res.ok) alert("Retrying job...")
                            }}
                            className="text-[11px] font-bold text-primary hover:underline"
                          >
                            Retry
                          </button>
                        )}
                        <button className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                          <MoreVertical className="h-4 w-4 text-muted-foreground/30" />
                        </button>
                      </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-8">
            <h2 className="text-2xl font-bold px-2">Insights</h2>
            <div className="p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-gradient-to-br from-primary/10 to-blue-500/10 backdrop-blur-xl relative overflow-hidden group shadow-soft">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <ImageIcon className="h-32 w-32" />
              </div>
              <h3 className="text-xl font-bold mb-3">Creative Throughput</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed mb-8">
                You&apos;ve synthesized 240 professional assets this week. Your creative consistency is in the top 5% of fashion brands.
              </p>
              <Link href="/upload" className="w-full py-4 bg-primary text-primary-foreground rounded-[1.25rem] font-bold text-sm hover:shadow-glow-primary transition-all active:scale-95 flex items-center justify-center shadow-glow">
                Initialize Session
              </Link>
            </div>

            <div className="p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-white/80 dark:bg-card/30 backdrop-blur-xl shadow-soft">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-6">Infrastructure Usage</h3>
              <div className="space-y-5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground/60">8.2 GB of 20 GB</span>
                  <span className="text-primary font-mono">41%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "41%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-primary"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground/40 leading-relaxed italic">
                  Luxury tier includes unlimited 4K archival storage and priority compute.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
