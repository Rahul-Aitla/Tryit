"use client"
import React from "react"
import UploadArea from "@/components/upload/UploadArea"
import LeftSidebar from "@/components/upload/LeftSidebar"
import RightSidebar from "@/components/upload/RightSidebar"
import { ReferenceSelections } from "@/components/upload/ReferencesPanel"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react"

export default function UploadPage() {
  const [outputs, setOutputs] = React.useState(1)
  const [prompt, setPrompt] = React.useState("High-end commercial fashion photography")
  const [projectId, setProjectId] = React.useState<string | null>(null)
  const [referenceSelections, setReferenceSelections] = React.useState<ReferenceSelections>({})
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true) // Collapsed by default for clean canvas

  return (
    <div className="min-h-full pb-32">
      <div className="max-w-[1500px] mx-auto px-8 pt-16">
        
        {/* Workspace Title Area */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-12">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#7C5CFF] font-medium text-[11px] uppercase tracking-[0.3em] mb-4 opacity-90">
              <Sparkles className="h-3.5 w-3.5" />
              Creative Operations Platform
            </div>

            {/* Sidebar toggle button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center gap-2.5 px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl text-[12px] font-semibold transition-all active:scale-95 text-foreground/70 hover:text-foreground shadow-sm"
            >
              {sidebarCollapsed ? (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-[#38BDF8]" />
                  Project History
                </>
              ) : (
                <>
                  <ChevronLeft className="h-3.5 w-3.5 text-[#38BDF8]" />
                  Collapse Panel
                </>
              )}
            </button>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-5 font-display leading-[1.1] mt-2">
            Design your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFF] via-[#8B5CF6] to-[#38BDF8]">Campaign</span>
          </h1>
          <p className="text-muted-foreground/80 max-w-2xl text-[15px] md:text-[17px] font-normal leading-relaxed">
            Ingest garment assets, orchestrate high-fashion aesthetics, and generate photorealistic creative operations in seconds.
          </p>
          </div>
        </motion.div>

        {/* Workflow Stepper Navigation Guide — Ultra Subtle 2026 Style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-16 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl max-w-5xl mx-auto flex items-center justify-between text-[11px] font-semibold text-muted-foreground/50">
          {[
            { step: "01", label: "Asset Ingestion", active: true },
            { step: "02", label: "Creative Direction", active: false },
            { step: "03", label: "Studio Synthesis", active: false },
            { step: "04", label: "Fidelity Audit", active: false },
            { step: "05", label: "Platform Export", active: false },
          ].map((item, idx) => (
            <div key={item.step} className="flex items-center flex-1 justify-center gap-2 px-4 py-2.5 rounded-xl relative transition-all duration-300">
              {item.active ? (
                <>
                  <div className="absolute inset-0 bg-white/[0.03] border border-white/5 rounded-xl -z-10 shadow-sm" />
                  <span className="text-[#7C5CFF] font-mono">{item.step}</span>
                  <span className="text-foreground font-medium">{item.label}</span>
                </>
              ) : (
                <>
                  <span className="font-mono opacity-40">{item.step}</span>
                  <span className="opacity-60">{item.label}</span>
                </>
              )}
              {idx < 4 && <div className="h-px w-8 bg-white/5 mx-auto hidden md:inline ml-4" />}
            </div>
          ))}
          </div>
        </motion.div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Collapsible Left Projects Sidebar */}
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.aside
                initial={{ width: 0, opacity: 0, scale: 0.95 }}
                animate={{ width: "auto", opacity: 1, scale: 1 }}
                exit={{ width: 0, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <div className="col-span-12 lg:col-span-3 hidden lg:block sticky top-24 overflow-hidden">
                <div className="w-[280px]">
                  <LeftSidebar 
                    currentProjectId={projectId} 
                    onSelectProject={setProjectId} 
                  />
                </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Upload Zone — Takes full wide column when projects sidebar is collapsed */}
          <main className={`col-span-12 transition-all duration-300 ${
            sidebarCollapsed 
              ? "lg:col-span-8" 
              : "lg:col-span-5"
          }`}>
            <UploadArea
              projectId={projectId}
              outputsRequested={outputs}
              prompt={prompt}
              referenceSelections={referenceSelections}
              onProjectReady={setProjectId}
            />
          </main>

          {/* Right Styling & Generation Panel */}
          <aside className={`col-span-12 transition-all duration-300 sticky top-24 ${
            sidebarCollapsed 
              ? "lg:col-span-4" 
              : "lg:col-span-4"
          }`}>
            <RightSidebar
              outputs={outputs}
              setOutputs={setOutputs}
              prompt={prompt}
              setPrompt={setPrompt}
              projectId={projectId}
              onReferenceSelectionsChange={setReferenceSelections}
            />
          </aside>

        </div>
      </div>
    </div>
  )
}
