"use client"
import React, { useState } from "react"
import { Settings2, ShieldCheck, ChevronUp, ChevronDown } from "lucide-react"

interface RightSidebarProps {
  outputs: number
  setOutputs: (n: number) => void
  prompt: string
  setPrompt: (s: string) => void
}

export default function RightSidebar({ outputs, setOutputs, prompt, setPrompt }: RightSidebarProps) {
  const [ratio, setRatio] = useState("4:5")

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 px-1">
          <Settings2 className="h-3.5 w-3.5" />
          Generation Settings
        </div>

        <div className="space-y-6">
          {/* Creative Direction */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/70 uppercase tracking-tight block">
              Creative Direction
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-secondary/50 border border-border/50 rounded-xl px-3 py-2 text-xs font-medium resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-foreground placeholder:text-muted-foreground"
              placeholder="e.g. High-end editorial fashion, natural daylight..."
            />
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-foreground/70 uppercase tracking-tight block">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {["1:1", "4:5", "9:16"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${
                    ratio === r 
                      ? "bg-foreground text-background border-foreground shadow-md" 
                      : "bg-secondary/30 border-border/50 text-muted-foreground hover:border-border"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Outputs per outfit */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-foreground/70 uppercase tracking-tight block">
              Outputs per outfit
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                min={1} 
                max={4} 
                value={outputs} 
                onChange={(e) => setOutputs(Math.min(4, Math.max(1, Number(e.target.value))))} 
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20" 
              />
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => setOutputs(Math.min(4, outputs + 1))} 
                  className="p-1.5 hover:bg-secondary rounded border border-border/30 transition-colors"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button 
                  onClick={() => setOutputs(Math.max(1, outputs - 1))} 
                  className="p-1.5 hover:bg-secondary rounded border border-border/30 transition-colors"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Max 4 per outfit (AI generation takes ~30s each)</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-violet-600/5 p-4 space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-bold text-violet-500 uppercase tracking-widest">
          <ShieldCheck className="h-3 w-3" />
          Outfit-Lock Active
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Garment structure, texture, and details are protected. AI will only modify model and background.
        </p>
      </div>
    </div>
  )
}
