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
  { label: "Avg Fidelity Score", value: "96.8%", icon: CheckCircle2 },
  { label: "Active Render Queue", value: "0", icon: Zap },
  { label: "Avg Render Speed", value: "28.4s", icon: Clock },
  { label: "Outfit Drift Rate", value: "0.4%", icon: AlertCircle },
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
        const galleryRes = await fetch("/api/gallery")
        let gallery: { id: string; title: string; generated: string }[] = []
        if (galleryRes.ok) {
          gallery = await galleryRes.json()
        }

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
          setStatsData(stats.map((s, i) => ({
            ...s,
            value: i === 1 && isJobsArray
              ? jobs.filter(j => j.status === 'Processing' || j.status === 'Queued').length.toString()
              : s.value,
          })))

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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ink"></div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-display font-normal tracking-[-1.2px] leading-[1] mb-3">
              Workspace <span className="text-muted-foreground/40">Overview</span>
            </h1>
            <p className="text-muted-foreground text-base max-w-xl leading-relaxed mt-3">
              Orchestrate your creative pipeline and monitor generation throughput in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/gallery" className="flex items-center gap-2 border border-hairline text-ink px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:bg-muted">
              <Clock className="h-4 w-4 text-muted-foreground" />
              History
            </Link>
            <Link href="/upload" className="flex items-center gap-2 bg-primary text-primary-foreground px-7 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsData.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              // @ts-expect-error framer-motion type
              className="group relative p-6 border border-hairline bg-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <stat.icon className="h-5 w-5 text-ink" />
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
              <div className="text-3xl font-display font-normal tracking-[-1px]">{stat.value}</div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-display font-normal tracking-[-0.8px] flex items-center gap-3">
                Active Operations
                <span className="h-6 w-10 rounded-full bg-muted text-xs flex items-center justify-center text-muted-foreground font-mono">{recentJobsData.length}</span>
              </h2>
              <Link href="/gallery" className="text-sm font-semibold text-ink hover:text-muted-foreground flex items-center gap-1.5 transition-all">
                Access Archives <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {recentJobsData.length === 0 ? (
              <div className="border-2 border-dashed border-hairline bg-muted/50 p-8 sm:p-16 text-center">
                <p className="text-muted-foreground mb-8 max-w-xs mx-auto text-sm">No active or completed jobs found in this workspace. Start your first creative session.</p>
                <Link href="/upload" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold active:scale-95 transition-all">
                  Initialize Campaign
                </Link>
              </div>
            ) : (
              <div className="space-y-px bg-hairline">
                {recentJobsData.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    // @ts-expect-error framer-motion type
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 p-5 bg-card"
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 overflow-hidden bg-muted relative shrink-0 rounded-sm">
                        <Image src={job.thumbnail} alt={job.outfit} fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold mb-1 truncate">{job.outfit}</div>
                        <div className="text-xs text-muted-foreground truncate">{job.id} &bull; {job.date}</div>
                      </div>
                    </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${
                            job.status === "Completed" || job.status === "Done" ? "bg-ink" :
                            job.status === "Processing" || job.status === "Queued" ? "bg-muted-foreground" : "bg-destructive"
                          }`} />
                          <span className="text-xs font-medium text-muted-foreground">{job.status}</span>
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
                            className="text-xs font-semibold text-ink hover:underline"
                          >
                            Retry
                          </button>
                        )}
                        <button className="p-2 hover:bg-muted rounded-sm transition-colors">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-8">
            <h2 className="text-2xl font-display font-normal tracking-[-0.8px] px-2">Insights</h2>
            <div className="p-8 border border-hairline bg-muted relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ImageIcon className="h-24 w-24" />
              </div>
              <h3 className="text-xl font-display font-normal mb-3">Creative Throughput</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                You&apos;ve synthesized 240 professional assets this week. Your creative consistency is in the top 5% of fashion brands.
              </p>
              <Link href="/upload" className="w-full py-3.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold transition-all active:scale-95 flex items-center justify-center">
                Initialize Session
              </Link>
            </div>

            <div className="p-8 border border-hairline bg-card">
              <h3 className="micro-caps text-muted-foreground mb-6">Infrastructure Usage</h3>
              <div className="space-y-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">8.2 GB of 20 GB</span>
                  <span className="text-ink font-mono text-xs">41%</span>
                </div>
                <div className="h-1.5 w-full bg-hairline overflow-hidden rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "41%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    // @ts-expect-error framer-motion type
                    className="h-full bg-ink rounded-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
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
