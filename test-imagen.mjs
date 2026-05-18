import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${process.env.NANO_BANANA_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: "A photorealistic cat wearing a fashionable jacket." }]
      }],
      generationConfig: {
        responseModalities: ["IMAGE"]
      }
    })
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data).substring(0, 500));
}
test();
