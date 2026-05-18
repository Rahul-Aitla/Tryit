// Simple mock uploader and generator that simulates progress
export function simulateUpload(file: File, onProgress: (p: number) => void): Promise<void> {
  return new Promise((res) => {
    let p = 0
    const id = setInterval(() => {
      p += Math.random() * 20
      if (p >= 100) {
        onProgress(100)
        clearInterval(id)
        setTimeout(() => res(), 300)
      } else {
        onProgress(Math.round(p))
      }
    }, 300 + Math.random() * 200)
  })
}

export function simulateGeneration(file: File, onProgress: (p: number) => void): Promise<void> {
  return new Promise((res) => {
    let p = 0
    const id = setInterval(() => {
      p += Math.random() * 15
      if (p >= 100) {
        onProgress(100)
        clearInterval(id)
        setTimeout(() => res(), 400)
      } else {
        onProgress(Math.round(p))
      }
    }, 400 + Math.random() * 400)
  })
}
