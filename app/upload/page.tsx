"use client"
import React from "react"
import UploadArea from "@/components/upload/UploadArea"
import LeftSidebar from "@/components/upload/LeftSidebar"
import RightSidebar from "@/components/upload/RightSidebar"
import { ReferenceSelections } from "@/components/upload/ReferencesPanel"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export default function UploadPage() {
  const [outputs, setOutputs] = React.useState(1)
  const [prompt, setPrompt] = React.useState("High-end commercial fashion photography")
  const [projectId, setProjectId] = React.useState<string | null>(null)
  const [referenceSelections, setReferenceSelections] = React.useState<ReferenceSelections>({})

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-[1400px] mx-auto px-6 pt-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-[0.25em] mb-3">
            <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
            Creative Studio Workspace
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 font-display leading-[0.95]">
            Create your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-sky-400">Collection</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base md:text-lg font-medium leading-relaxed">
            Ingest outfit flat-lays, set creative styling tags or references, and instantly orchestrate photorealistic brand campaigns.
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-8 items-start">
          <aside className="col-span-12 lg:col-span-2 hidden lg:block sticky top-24">
            <LeftSidebar />
          </aside>

          <main className="col-span-12 lg:col-span-7">
            <UploadArea
              outputsRequested={outputs}
              prompt={prompt}
              referenceSelections={referenceSelections}
              onProjectReady={setProjectId}
            />
          </main>

          <aside className="col-span-12 lg:col-span-3 sticky top-24">
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
