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
  }, [])

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
      <div className="rounded-3xl border border-black/5 dark:border-white/5 bg-white/80 dark:bg-white/[0.01] p-5 backdrop-blur-xl shadow-soft">
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary opacity-80">
            <Layout className="h-3.5 w-3.5" />
            Operations
          </div>
          <button 
            onClick={handleCreateProject}
            disabled={creating}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
        
        <nav className="space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center opacity-40">
              <Loader2 className="h-5 w-5 animate-spin mb-2" />
              <span className="text-[10px] font-medium">Loading history...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-10 text-center opacity-30">
              <span className="text-[10px] font-medium">No sessions found</span>
            </div>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject?.(project.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 group ${
                  currentProjectId === project.id
                    ? "bg-primary/10 text-primary border border-primary/10" 
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                }`}
              >
                <Briefcase className={`h-4 w-4 transition-transform ${currentProjectId === project.id ? "scale-110" : "group-hover:scale-110"}`} />
                <div className="flex-1 text-left truncate">{project.projectName}</div>
                {project._count && project._count.outfits > 0 && (
                  <span className="text-[9px] font-mono opacity-40">{project._count.outfits}</span>
                )}
              </button>
            ))
          )}
        </nav>
      </div>

      <div className="rounded-3xl border border-black/5 dark:border-white/5 bg-white/80 dark:bg-white/[0.01] p-5 backdrop-blur-xl shadow-soft">
        <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#38BDF8] mb-5 px-1 opacity-80">
          <Hash className="h-3.5 w-3.5" />
          Asset Library
        </div>
        
        <div className="grid grid-cols-2 gap-2.5">
          {["Atmosphere", "Choreography", "Personas", "Aesthetics"].map((cat) => (
            <button key={cat} className="flex flex-col items-start gap-1 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.05]">
              <span className="text-[12px] font-semibold text-foreground/80">{cat}</span>
              <span className="text-[10px] text-muted-foreground/40 font-mono">12 items</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
