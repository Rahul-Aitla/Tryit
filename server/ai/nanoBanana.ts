import { generateStructuredPrompt, generateNegativePrompt } from '@/server/prompts/promptEngine'
import { uploadToGCS } from '@/lib/storage'

export async function generateOutfitImage(params: {
  outfitImageUrl: string;
  creativeDirection?: string;
  outputsRequested: number;
  references?: {
    lighting?: string;
    pose?: string;
    background?: string;
    modelType?: string;
  };
}) {
  const apiKey = process.env.NANO_BANANA_API_KEY
  
  if (!apiKey) {
    throw new Error('NANO_BANANA_API_KEY is not set')
  }

  // Generate structured prompts based on Milestone 22
  const finalPrompt = generateStructuredPrompt({
    creativeDirection: params.creativeDirection,
    references: params.references
  })
  const negativePrompt = generateNegativePrompt()

  console.log(`[AI] Using Structured Prompt: \n${finalPrompt}`)
  console.log(`[AI] Using Negative Prompt: \n${negativePrompt}`)
  
  console.log(`[AI] Fetching original image: ${params.outfitImageUrl}`)
  const imgRes = await fetch(params.outfitImageUrl)
  if (!imgRes.ok) throw new Error(`Failed to fetch original image: ${imgRes.statusText}`)
  const arrayBuffer = await imgRes.arrayBuffer()
  const base64Image = Buffer.from(arrayBuffer).toString('base64')
  
  const generatedResults = [];
  
  for (let i = 0; i < params.outputsRequested; i++) {
    console.log(`[AI] Requesting generation ${i+1}/${params.outputsRequested}...`);
    
    // Combining structural, stylistic, and negative prompts for Nano Banana (Gemini)
    const combinedPrompt = `${finalPrompt}\n\nNegative Rules:\n${negativePrompt}`
    
    const requestBody = {
      contents: [{
        role: "user",
        parts: [
          { text: combinedPrompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }],
      generationConfig: {
        responseModalities: ["IMAGE"]
      }
    };
    
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[AI] Generation API failed:`, errorText);
      throw new Error(`Generation failed: ${errorText}`);
    }
    
    const data = await res.json();
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error('Invalid response from AI generation API');
    }
    
    // Find the image part
    const imagePart = candidate.content.parts.find(p => p.inlineData);
    if (!imagePart) {
      throw new Error('No image returned by the AI generation API');
    }
    
    const outputBase64 = imagePart.inlineData.data;
    const outputBuffer = Buffer.from(outputBase64, 'base64');
    
    console.log(`[AI] Uploading generated image to GCS...`);
    const gcsUrl = await uploadToGCS(outputBuffer, `generated-${Date.now()}-${i}.jpg`, 'image/jpeg', 'generated');
    
    generatedResults.push({
      url: gcsUrl,
      id: `gen-${Date.now()}-${i}`
    });
  }

  return generatedResults;
}
