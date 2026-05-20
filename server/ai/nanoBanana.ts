import { generateStructuredPrompt, generateNegativePrompt } from '@/server/prompts/promptEngine'
import { uploadToGCS } from '@/lib/storage'

type ReferencePart = {
  inlineData: { mimeType: string; data: string }
}

/**
 * Fetch an image from a URL and return it as a base64 inline data part.
 * Returns null if the fetch fails so a bad reference doesn't block generation.
 */
async function fetchImagePart(url: string, label: string): Promise<ReferencePart | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`[AI] Could not fetch ${label} reference (${res.status}): ${url}`)
      return null
    }
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const buffer = await res.arrayBuffer()
    return {
      inlineData: {
        mimeType: contentType.split(';')[0],
        data: Buffer.from(buffer).toString('base64'),
      },
    }
  } catch (err) {
    console.warn(`[AI] Failed to load ${label} reference:`, err)
    return null
  }
}

/**
 * Enhances raw user prompts and selections using the fast & free gemini-2.5-flash text model.
 * Returns a highly concise, fashion-focused prompt to guide the image generator without hallucinations.
 */
export async function enhancePromptWithAI(params: {
  creativeDirection?: string
  referenceSelections?: Record<string, string>
  apiKey: string
}): Promise<string> {
  const { creativeDirection, referenceSelections, apiKey } = params

  if (!creativeDirection && (!referenceSelections || Object.keys(referenceSelections).length === 0)) {
    return "High-end commercial fashion editorial photography."
  }

  const selectionString = referenceSelections
    ? Object.entries(referenceSelections)
        .map(([k, v]) => {
          let val = v
          if (k === 'pose') {
            val = `dynamic professional fashion editorial pose (${v}), with natural movement, fluid body language, and a realistic organic weight shift (never look stiff, rigid, static, or like a robot standing still)`
          }
          return `- ${k}: ${val}`
        })
        .join("\n")
    : ""

  const userNotes = creativeDirection || "None"

  const enhancerPrompt = `You are a professional fashion editorial photographer and creative director.
Your task is to take a user's preset style choices and creative direction text, and enhance them into a highly cohesive, precise, on-point prompt description of the SCENE setting, MODEL representation, and LIGHTING style for an image generator.

### IMPORTANT RULES:
1. DO NOT mention the clothes or garments (the outfit is preserved exactly by a separate layer).
2. DO NOT use generic buzzwords (like "photorealistic", "ultra detailed", "hyperrealistic").
3. Be highly SPECIFIC and ON-POINT to prevent the image generation model from hallucinating.
4. Output EXACTLY one single concise paragraph (max 100 words) describing the scene. No intro, no markdown bolding, no explanations.

### User References & Selections:
${selectionString}

### User Additional Notes:
${userNotes}

Enhanced Prompt Paragraph:`

  try {
    console.log("[AI Layer] Enhancing prompt with nano-banana-pro-preview model...")
    const startTime = Date.now()
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: enhancerPrompt }] }],
        }),
      }
    )
    if (!res.ok) throw new Error(`Text generation failed: ${res.statusText}`)
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (text) {
      const cleaned = text.trim().replace(/\n+/g, " ")
      console.log(`[AI Layer] Enhanced prompt in ${Date.now() - startTime}ms:\n"${cleaned}"`)
      return cleaned
    }
  } catch (err) {
    console.warn("[AI Layer] prompt-enhancer failed (falling back):", err)
  }

  return creativeDirection || "High-end commercial fashion photography."
}

export async function generateOutfitImage(params: {
  outfitImageUrl: string
  creativeDirection?: string
  outputsRequested: number
  references?: {
    lighting?: string   // URL of lighting reference image
    pose?: string       // URL of pose reference image
    background?: string // URL of background reference image
    modelType?: string  // URL of model-type reference image
    camera?: string     // URL of camera angle reference image
    vibe?: string       // URL of brand vibe reference image
  }
  referenceSelections?: Record<string, string> // optional selections
}) {
  const apiKey = process.env.NANO_BANANA_API_KEY
  if (!apiKey) throw new Error('NANO_BANANA_API_KEY is not set')

  let fullPrompt = ''
  if (params.creativeDirection && params.creativeDirection.includes('[OUTFIT PRESERVATION')) {
    console.log('[AI] Bypassing prompt engine, using pre-compiled user custom prompt.')
    fullPrompt = params.creativeDirection
  } else {
    // Call the Hybrid prompt refiner layer
    const enhancedCreativeDirection = await enhancePromptWithAI({
      creativeDirection: params.creativeDirection,
      referenceSelections: params.referenceSelections,
      apiKey,
    })

    // ── Build structured prompts (5-block system) ──────────────────────────────
    const textPrompt = generateStructuredPrompt({
      creativeDirection: enhancedCreativeDirection,
      references: params.references
        ? {
            lighting: params.references.lighting ? 'See attached lighting reference image' : undefined,
            pose: params.references.pose ? 'See attached pose reference image' : undefined,
            background: params.references.background ? 'See attached background reference image' : undefined,
            modelType: params.references.modelType ? 'See attached model type reference image' : undefined,
            camera: params.references.camera ? 'See attached camera/angle reference image' : undefined,
            vibe: params.references.vibe ? 'See attached vibe/aesthetic reference image' : undefined,
          }
        : undefined,
    })
    const negativePrompt = generateNegativePrompt()
    fullPrompt = `${textPrompt}\n\n${negativePrompt}`
  }

  console.log(`[AI] Structured Prompt (${fullPrompt.length} chars):\n${fullPrompt.slice(0, 400)}…`)

  // ── Fetch outfit image ─────────────────────────────────────────────────────
  console.log(`[AI] Fetching outfit image: ${params.outfitImageUrl}`)
  const outfitRes = await fetch(params.outfitImageUrl)
  if (!outfitRes.ok) throw new Error(`Failed to fetch outfit image: ${outfitRes.statusText}`)
  const outfitBuffer = await outfitRes.arrayBuffer()
  const outfitBase64 = Buffer.from(outfitBuffer).toString('base64')
  const outfitMime = (outfitRes.headers.get('content-type') || 'image/jpeg').split(';')[0]

  // ── Fetch reference images (all optional) ─────────────────────────────────
  const refParts: ReferencePart[] = []

  if (params.references) {
    const refs = params.references
    const pairs: [string | undefined, string][] = [
      [refs.modelType,  'model-type'],
      [refs.pose,       'pose'],
      [refs.lighting,   'lighting'],
      [refs.background, 'background'],
      [refs.camera,     'camera-angle'],
      [refs.vibe,       'brand-vibe'],
    ]
    for (const [url, label] of pairs) {
      if (url) {
        const part = await fetchImagePart(url, label)
        if (part) refParts.push(part)
      }
    }
  }

  console.log(`[AI] Reference images loaded: ${refParts.length}`)

  // ── Generate N images ──────────────────────────────────────────────────────
  const generatedResults: { url: string; id: string }[] = []

  for (let i = 0; i < params.outputsRequested; i++) {
    console.log(`[AI] Generating image ${i + 1}/${params.outputsRequested}…`)

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            // 1. Full structured text prompt
            { text: fullPrompt },
            // 2. The outfit image to preserve (primary reference)
            { text: '\n[OUTFIT IMAGE — preserve this garment exactly]:' },
            { inlineData: { mimeType: outfitMime, data: outfitBase64 } },
            // 3. Reference images (optional)
            ...(refParts.length > 0
              ? [
                  { text: '\n[CREATIVE REFERENCE IMAGES — use for scene/model/lighting only]:' },
                  ...refParts,
                ]
              : []),
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE'],
      },
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    )

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`[AI] Generation API failed:`, errorText)
      throw new Error(`Generation failed: ${errorText}`)
    }

    const data = await res.json()
    console.log(`[AI] API Response Status: ${res.status}`)
    
    const candidate = data.candidates?.[0]
    if (!candidate?.content?.parts) {
      console.error(`[AI] Invalid response structure. Full response:`, JSON.stringify(data, null, 2))
      
      // Check if it was blocked by safety
      if (candidate?.finishReason === 'SAFETY') {
        throw new Error('Generation failed: The request was blocked by safety filters. Try a different prompt.')
      }
      
      throw new Error('Invalid response from AI generation API')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagePart = candidate.content.parts.find((p: any) => p.inlineData)
    if (!imagePart) throw new Error('No image returned by the AI generation API')

    const outputBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
    console.log(`[AI] Uploading generated image ${i + 1} to GCS…`)
    const gcsUrl = await uploadToGCS(
      outputBuffer,
      `generated-${Date.now()}-${i}.jpg`,
      'image/jpeg',
      'generated'
    )

    generatedResults.push({ url: gcsUrl, id: `gen-${Date.now()}-${i}` })
  }

  return generatedResults
}
