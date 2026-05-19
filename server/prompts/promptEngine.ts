/**
 * Prompt Engine — AI Outfit Generation
 *
 * Implements the 5-block structure required by the assignment:
 *   1. Outfit Preservation Block  — outfit-lock instruction (hard requirement)
 *   2. Reference Interpretation Block — model, pose, lighting, bg, camera, aesthetic
 *   3. Creative Direction Block    — user-supplied vibe / brand direction
 *   4. Negative Instruction Block  — what the AI must never do
 *   5. Output Instruction Block    — format, realism, framing, aspect ratio
 */

export interface PromptConfig {
  garmentType?: string
  creativeDirection?: string
  references?: {
    lighting?: string   // descriptive label, e.g. "golden hour"
    pose?: string
    background?: string
    modelType?: string
    camera?: string     // camera angle / lens style
    vibe?: string       // brand aesthetic / mood
  }
}

// ─── Block 1: Outfit Preservation (CRITICAL — never remove) ──────────────────

export const OUTFIT_LOCK_BLOCK = `
[OUTFIT PRESERVATION — CRITICAL]
The uploaded garment image is the ABSOLUTE reference for the clothing item.
You MUST reproduce the outfit with pixel-perfect fidelity:
• Same design, silhouette, and garment structure
• Same color scheme, color blocking, and gradient transitions
• Same fabric texture, weight, and material appearance
• Same pattern, print, motif, and repeat
• Same stitching, seam lines, and edge finishing
• Same cuts, darts, and tailoring details
• Same collar, neckline, and lapel shape
• Same sleeve style, length, cuff, and opening
• Same button placement, zipper position, and fastener type
• Same pockets, flaps, and hardware details
• Same lining, interlining, and visible inner fabric
• Same embroidery, embellishment, appliqué, and trim
• Same logo placement (do NOT add, remove, or alter any branding)
DO NOT redesign, simplify, or reinterpret any aspect of the garment.
`.trim()

// ─── Block 2: Reference Interpretation ───────────────────────────────────────

export const generateReferenceBlock = (ref?: PromptConfig['references']) => {
  let pose = ref?.pose || 'dynamic fashion editorial standing pose, with natural movement and an elegant weight shift (never standing stiffly or still like a robot)'
  if (pose.toLowerCase().includes('standing') && !pose.toLowerCase().includes('dynamic')) {
    pose = 'dynamic fashion editorial standing pose, with natural movement and an elegant weight shift (never standing stiffly or still like a robot)'
  }
  return `
[REFERENCE INTERPRETATION]
Apply the following creative references to the scene — NOT to the garment:
• Model type / body: ${ref?.modelType || 'professional fashion model, proportionate build'}
• Pose & body language: ${pose}
• Lighting setup: ${ref?.lighting || 'professional studio lighting with soft shadows'}
• Background / environment: ${ref?.background || 'clean seamless studio backdrop'}
• Camera angle & framing: ${ref?.camera || 'straight-on medium shot, 4:5 aspect ratio'}
• Brand aesthetic / vibe: ${ref?.vibe || 'high-end commercial fashion photography'}
The references control the scene, model presentation, and atmosphere ONLY.
`.trim()
}

// ─── Block 3: Creative Direction ─────────────────────────────────────────────

export const generateCreativeBlock = (direction?: string) =>
  direction
    ? `[CREATIVE DIRECTION]\n${direction}`
    : `[CREATIVE DIRECTION]\nHigh-end commercial fashion editorial. Clean, professional, aspirational.`

// ─── Block 4: Negative Instructions ─────────────────────────────────────────

export const NEGATIVE_BLOCK = `
[NEGATIVE INSTRUCTIONS — STRICTLY PROHIBITED]
• DO NOT change the garment's color, pattern, texture, or fabric
• DO NOT redesign, simplify, or add details to the outfit
• DO NOT hallucinate extra logos, badges, or brand marks
• DO NOT alter stitching, cuts, sleeves, collar, or hem
• DO NOT change button count, zipper style, or hardware
• DO NOT apply AI-style smoothing that removes fabric texture
• DO NOT generate nudity, inappropriate content, or fantasy styling
• DO NOT blend the outfit into the background
• DO NOT crop the garment — show the full outfit
`.trim()

// ─── Block 5: Output Instructions ────────────────────────────────────────────

export const OUTPUT_BLOCK = `
[OUTPUT INSTRUCTIONS]
• Format: high-resolution commercial fashion photograph
• Realism: photorealistic, NOT illustrated or stylized
• Aspect ratio: 4:5 (portrait, standard e-commerce / Instagram format)
• Quality: sharp detail, correct exposure, no motion blur
• Usage: product e-commerce and brand editorial campaigns
• Show the complete garment from collar to hem — no cropping
`.trim()

// ─── Assembled Prompt ─────────────────────────────────────────────────────────

export const generateStructuredPrompt = (config: PromptConfig): string => {
  return [
    OUTFIT_LOCK_BLOCK,
    generateReferenceBlock(config.references),
    generateCreativeBlock(config.creativeDirection),
    OUTPUT_BLOCK,
  ].join('\n\n')
}

export const generateNegativePrompt = (): string => NEGATIVE_BLOCK
