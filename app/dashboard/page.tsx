"use client"
import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { 
  BarChart3, 
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
  { label: "Total Generations", value: "0", icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Active Jobs", value: "0", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Completed", value: "0", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Failed", value: "0", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
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
            { label: "Total Generations", value: isGalleryArray ? gallery.length.toString() : "0", icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Active Jobs", value: isJobsArray ? jobs.filter(j => j.status === 'Processing' || j.status === 'Queued').length.toString() : "0", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Completed", value: isGalleryArray ? gallery.length.toString() : "0", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Failed", value: isJobsArray ? jobs.filter(j => j.status === 'Failed').length.toString() : "0", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-[1400px] mx-auto px-6 pt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Workspace <span className="text-muted-foreground/40">Overview</span></h1>
            <p className="text-muted-foreground text-lg">Track your generation pipeline and project performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/gallery" className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:bg-secondary/80 border border-border/50">
              <Clock className="h-4 w-4" />
              History
            </Link>
            <Link href="/upload" className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:shadow-lg active:scale-95">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              // @ts-expect-error - Framer Motion component type discrepancy in strict typescript environment
              className="group relative p-6 rounded-[2rem] border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all"
            >
              <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="text-3xl font-black tracking-tight">{stat.value}</div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Recent Jobs
                <span className="h-5 w-5 rounded-full bg-secondary text-[10px] flex items-center justify-center text-foreground">{recentJobsData.length}</span>
              </h2>
              <Link href="/gallery" className="text-sm font-bold text-violet-500 hover:text-violet-600 flex items-center gap-1">
                View all <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentJobsData.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-card/20 hover:bg-card/40 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted ring-1 ring-border/50 relative">
                      <Image src={job.thumbnail} alt={job.outfit} fill sizes="48px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{job.outfit}</div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{job.id} • {job.date}</div>
                    </div>
                  </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          job.status === "Completed" || job.status === "Done" ? "bg-emerald-500" : 
                          job.status === "Processing" || job.status === "Queued" ? "bg-blue-500 animate-pulse" : "bg-amber-500"
                        }`} />
                        <span className="text-xs font-bold uppercase tracking-widest">{job.status}</span>
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
                          className="text-[10px] font-bold text-violet-500 hover:underline"
                        >
                          Retry
                        </button>
                      )}
                      <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <h2 className="text-xl font-bold px-2">Project Activity</h2>
            <div className="p-6 rounded-[2rem] border border-border/50 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <ImageIcon className="h-24 w-24" />
              </div>
              <h3 className="text-lg font-bold mb-2">Catalog Update</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                You&apos;ve generated 240 new assets this week. Your output quality score has increased by 12%.
              </p>
              <Link href="/upload" className="w-full py-3 bg-foreground text-background rounded-2xl font-bold text-sm hover:shadow-lg transition-all active:scale-95 flex items-center justify-center">
                Generate New Assets
              </Link>
            </div>

            <div className="p-6 rounded-[2rem] border border-border/50 bg-card/30 backdrop-blur-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Storage Usage</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold">
                  <span>8.2 GB of 20 GB</span>
                  <span className="text-violet-500">41%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "41%" }}
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-600"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  Upgrading to Pro gives you unlimited storage and 4K outputs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
