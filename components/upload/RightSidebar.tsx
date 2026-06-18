"use client"
import React, { useState } from "react"
import { Settings2, ShieldCheck, ChevronUp, ChevronDown, Sparkles } from "lucide-react"
import ReferencesPanel, { ReferenceSelections } from "./ReferencesPanel"

type RefKey = keyof ReferenceSelections

interface RightSidebarProps {
  outputs: number
  setOutputs: (n: number) => void
  prompt: string
  setPrompt: (s: string) => void
  projectId: string | null
  onReferenceSelectionsChange: (s: ReferenceSelections) => void
}

type TabType = "references" | "settings"

export default function RightSidebar({
  outputs, setOutputs, prompt, setPrompt,
  projectId, onReferenceSelectionsChange,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>("references")
  const [ratio, setRatio] = useState("4:5")
  const [selections, setSelections] = useState<ReferenceSelections>({})

  const handleSelect = (key: RefKey, value: string | null) => {
    const next = { ...selections }
    if (value === null) delete next[key]
    else next[key] = value
    setSelections(next)
    onReferenceSelectionsChange(next)
  }

  return (
    <div className="space-y-6">
      <div className="flex p-1 bg-card border border-hairline rounded-md">
        <button
          onClick={() => setActiveTab("references")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-sm text-xs font-semibold transition-all ${
            activeTab === "references"
              ? "bg-ink text-background"
              : "text-muted-foreground hover:text-ink"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Style Presets
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-sm text-xs font-semibold transition-all ${
            activeTab === "settings"
              ? "bg-ink text-background"
              : "text-muted-foreground hover:text-ink"
          }`}
        >
          <Settings2 className="h-3.5 w-3.5" />
          Campaign
        </button>
      </div>

      <div className="transition-all duration-300">
        {activeTab === "references" ? (
          <ReferencesPanel
            projectId={projectId}
            selections={selections}
            onSelect={handleSelect}
          />
        ) : (
          <div className="border border-hairline bg-card p-7 space-y-8">
            <div className="eyebrow text-muted-foreground flex items-center gap-2 px-1">
              <Settings2 className="h-3.5 w-3.5" />
              Campaign Parameters
            </div>

            <div className="space-y-7">
              <div className="space-y-3">
                <label className="text-sm font-medium text-ink block px-1">
                  Creative Direction
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full border border-hairline bg-background px-4 py-4 text-sm resize-none focus:outline-none focus:border-ink text-foreground placeholder:text-muted-foreground transition-all"
                  placeholder="e.g. High-end editorial fashion, natural daylight, rooftop setting..."
                />
                <p className="text-xs text-muted-foreground leading-relaxed px-1">
                  Specify aesthetic nuances. The AI orchestrator will interpret these instructions with high-fidelity garment preservation.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-ink block px-1">Output Resolution</label>
                <div className="grid grid-cols-3 gap-2">
                  {["1:1", "4:5", "9:16"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRatio(r)}
                      className={`py-2 rounded-sm text-xs font-semibold border transition-all ${
                        ratio === r
                          ? "bg-ink text-background border-ink"
                          : "border-hairline text-muted-foreground hover:border-ink"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-ink block px-1">
                  Outputs per outfit
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center justify-between border border-hairline bg-background px-5 py-3.5">
                    <span className="text-sm font-semibold font-mono text-ink">{outputs}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setOutputs(Math.max(1, outputs - 1))} className="p-1 hover:bg-muted rounded-sm transition-colors text-muted-foreground">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <div className="h-4 w-px bg-hairline" />
                      <button onClick={() => setOutputs(Math.min(4, outputs + 1))} className="p-1 hover:bg-muted rounded-sm transition-colors text-muted-foreground">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground px-1">Max 4 campaign variations per garment</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border border-hairline bg-muted p-5 space-y-2">
        <div className="flex items-center gap-2 micro-caps text-ink">
          <ShieldCheck className="h-3.5 w-3.5" />
          Outfit-Lock Guard Enabled
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          All details (cuts, prints, textures, collar lines, seams) are fully protected. AI only reimagines background, scene elements, models, and pose.
        </p>
      </div>
    </div>
  )
}
