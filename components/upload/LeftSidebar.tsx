"use client"
import React, { useEffect, useState } from "react"
import { Layout, Briefcase, Plus, Hash, Loader2 } from "lucide-react"

interface Project {
  id: string
  projectName: string
  status: string
  _count?: {
    outfits: number
  }
}

interface LeftSidebarProps {
  currentProjectId?: string | null
  onSelectProject?: (projectId: string) => void
}

export default function LeftSidebar({ currentProjectId, onSelectProject }: LeftSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [refCounts, setRefCounts] = useState<Record<string, number>>({
    Atmosphere: 12,
    Choreography: 6,
    Personas: 6,
    Aesthetics: 12
  })

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects")
        if (res.ok) {
          const data = await res.json()
          setProjects(data)
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
    const interval = setInterval(fetchProjects, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!currentProjectId) return

    const fetchRefCounts = async () => {
      try {
        const res = await fetch(`/api/references?projectId=${currentProjectId}`)
        if (res.ok) {
          const data = await res.json()
          const uploads = data as { referenceType: string }[]

          const counts = {
            Atmosphere: 12 + uploads.filter(r => r.referenceType === "lighting" || r.referenceType === "background").length,
            Choreography: 6 + uploads.filter(r => r.referenceType === "pose").length,
            Personas: 6 + uploads.filter(r => r.referenceType === "model").length,
            Aesthetics: 12 + uploads.filter(r => r.referenceType === "vibe" || r.referenceType === "camera").length
          }
          setRefCounts(counts)
        }
      } catch (err) {
        console.error("Failed to fetch ref counts:", err)
      }
    }

    fetchRefCounts()
    const interval = setInterval(fetchRefCounts, 10000)
    return () => clearInterval(interval)
  }, [currentProjectId])

  const handleCreateProject = async () => {
    setCreating(true)
    try {
      const name = `Project ${projects.length + 1}`
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: name })
      })
      if (res.ok) {
        const newProject = await res.json()
        setProjects([newProject, ...projects])
        if (onSelectProject) onSelectProject(newProject.id)
      }
    } catch (err) {
      console.error("Failed to create project:", err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border border-hairline bg-card p-5">
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="eyebrow text-muted-foreground flex items-center gap-2">
            <Layout className="h-3.5 w-3.5" />
            Operations
          </div>
          <button
            onClick={handleCreateProject}
            disabled={creating}
            className="p-1.5 hover:bg-muted rounded-sm transition-all duration-300 disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>

        <nav className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center opacity-40">
              <Loader2 className="h-5 w-5 animate-spin mb-2" />
              <span className="text-xs font-medium">Loading history...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-10 text-center opacity-30">
              <span className="text-xs font-medium">No sessions found</span>
            </div>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject?.(project.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-sm text-sm font-medium transition-all duration-300 group ${
                  currentProjectId === project.id
                    ? "bg-ink text-background"
                    : "text-muted-foreground hover:text-ink hover:bg-muted"
                }`}
              >
                <Briefcase className={`h-4 w-4 transition-transform ${currentProjectId === project.id ? "scale-110" : "group-hover:scale-110"}`} />
                <div className="flex-1 text-left truncate">{project.projectName}</div>
                {project._count && project._count.outfits > 0 && (
                  <span className="text-[10px] font-mono opacity-40">{project._count.outfits}</span>
                )}
              </button>
            ))
          )}
        </nav>
      </div>

      <div className="border border-hairline bg-card p-5">
        <div className="eyebrow text-muted-foreground flex items-center gap-2 mb-5 px-1">
          <Hash className="h-3.5 w-3.5" />
          Asset Library
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {Object.entries(refCounts).map(([cat, count]) => (
            <button key={cat} className="flex flex-col items-start gap-1 p-3.5 border border-hairline bg-muted hover:bg-muted/80 transition-all duration-300">
              <span className="text-sm font-medium text-ink">{cat}</span>
              <span className="text-xs text-muted-foreground font-mono">{count} items</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
