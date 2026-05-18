"use client"
import React from "react"
import UploadArea from "@/components/upload/UploadArea"
import LeftSidebar from "@/components/upload/LeftSidebar"
import RightSidebar from "@/components/upload/RightSidebar"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export default function UploadPage() {
  // Shared generation settings — lifted here so RightSidebar and UploadArea share state
  const [outputs, setOutputs] = React.useState(1)
  const [prompt, setPrompt] = React.useState("High-end commercial fashion photography")

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-[1400px] mx-auto px-6 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-violet-500 font-bold text-xs uppercase tracking-[0.2em] mb-3">
            <Sparkles className="h-4 w-4" />
            AI Workspace
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Create your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500">Collection</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Transform your flat-lay or mannequin shots into professional editorial photography in seconds.
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-8 items-start">
          <aside className="col-span-12 lg:col-span-2 hidden lg:block sticky top-24">
            <LeftSidebar />
          </aside>

          <main className="col-span-12 lg:col-span-7">
            <UploadArea outputsRequested={outputs} prompt={prompt} />
          </main>

          <aside className="col-span-12 lg:col-span-3 sticky top-24">
            <RightSidebar
              outputs={outputs}
              setOutputs={setOutputs}
              prompt={prompt}
              setPrompt={setPrompt}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}
