/**
 * High-performance client-side image compression utility.
 * Downscales camera and high-resolution images to a maximum dimension (default 512x512)
 * and encodes to an optimized JPEG data URL (quality 0.82).
 * Prevents exceeding MongoDB 16MB BSON document limits and keeps avatar payloads ~40KB - 80KB.
 */
export function compressImageFile(file, maxWidth = 512, maxHeight = 512, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No image file selected.'))
    }

    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not a valid image format.'))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed reading image file.'))
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed loading image data for compression.'))
      img.onload = () => {
        let width = img.naturalWidth || img.width
        let height = img.naturalHeight || img.height

        if (!width || !height) {
          return resolve(event.target.result)
        }

        // Downscale while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          return resolve(event.target.result)
        }

        // Fill background white to support transparent PNG conversion to clean JPEG
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(compressedDataUrl)
        } catch (canvasErr) {
          resolve(event.target.result)
        }
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })
}
