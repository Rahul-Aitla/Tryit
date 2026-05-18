/**
 * Prompt Engine for AI Outfit Generation
 * Based on Milestone 22: Separating outfit preservation from creative direction
 */

export interface PromptConfig {
  garmentType?: string;
  creativeDirection?: string;
  references?: {
    lighting?: string;
    pose?: string;
    background?: string;
    modelType?: string;
  };
}

export const generateStructuredPrompt = (config: PromptConfig) => {
  // 1. Outfit Preservation Block (CRITICAL)
  const preservationBlock = `
Use the uploaded outfit EXACTLY as provided.
Preserve:
- color, stitching, and sleeves
- fabric texture and neckline
- seams, embroidery, and garment structure
Do not redesign or modify the garment.
  `.trim();

  // 2. Creative Direction Block
  const creativeBlock = config.creativeDirection 
    ? `Creative Direction: ${config.creativeDirection}`
    : "Style the outfit in a high-end commercial fashion setting.";

  // 3. Reference Interpretation Block
  const ref = config.references;
  const referenceBlock = `
Use references ONLY for:
- lighting: ${ref?.lighting || "studio lighting"}
- pose: ${ref?.pose || "natural fashion pose"}
- mood: ${ref?.background || "professional editorial"}
- background: ${ref?.background || "clean studio"}
- model styling: ${ref?.modelType || "fashion model"}
  `.trim();

  // 4. Final Combined Prompt
  return `
${preservationBlock}

${creativeBlock}

${referenceBlock}
  `.trim();
};

export const generateNegativePrompt = () => {
  return `
Avoid:
- altered fabric or changed sleeves
- missing details or color changes
- extra accessories or logo hallucination
- distorted garment structure
- unrealistic textures
  `.trim();
};
