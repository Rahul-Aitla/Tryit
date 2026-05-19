import { NextResponse } from 'next/server'
import { enhancePromptWithAI } from '@/server/ai/nanoBanana'
import { generateStructuredPrompt, generateNegativePrompt } from '@/server/prompts/promptEngine'

export async function POST(request: Request) {
  try {
    const { prompt, referenceSelections } = await request.json()
    const apiKey = process.env.NANO_BANANA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'NANO_BANANA_API_KEY is not set' }, { status: 500 })
    }

    // 1. Call flash model prompt enhancer
    const enhancedCreativeDirection = await enhancePromptWithAI({
      creativeDirection: prompt,
      referenceSelections: referenceSelections || {},
      apiKey,
    })

    // 2. Build structural 5-block prompt template
    const textPrompt = generateStructuredPrompt({
      creativeDirection: enhancedCreativeDirection,
      references: referenceSelections
        ? {
            lighting: referenceSelections.lighting ? 'See attached lighting reference image' : undefined,
            pose: referenceSelections.pose ? 'See attached pose reference image' : undefined,
            background: referenceSelections.background ? 'See attached background reference image' : undefined,
            modelType: referenceSelections.modelType ? 'See attached model type reference image' : undefined,
            camera: referenceSelections.camera ? 'See attached camera/angle reference image' : undefined,
            vibe: referenceSelections.vibe ? 'See attached vibe/aesthetic reference image' : undefined,
          }
        : undefined,
    })
    const negativePrompt = generateNegativePrompt()
    const fullPrompt = `${textPrompt}\n\n${negativePrompt}`

    return NextResponse.json({ refinedPrompt: fullPrompt })
  } catch (error) {
    console.error('Refine prompt error:', error)
    return NextResponse.json({ error: 'Failed to refine prompt with AI' }, { status: 500 })
  }
}
