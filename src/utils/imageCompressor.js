/**
 * High-performance client-side image compression utility.
 * Downscales camera and high-resolution images to a maximum dimension (default 384x384)
 * and encodes to an optimized JPEG data URL (quality 0.75).
 * Prevents exceeding MongoDB 16MB BSON document limits and keeps avatar payloads ~25KB - 60KB.
 */
export function compressImageFile(file, maxWidth = 384, maxHeight = 384, quality = 0.75) {
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
          return reject(new Error('Unable to determine image dimensions.'))
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
          return reject(new Error('Browser canvas is not available for image processing.'))
        }

        // Fill background white to support transparent PNG conversion to clean JPEG
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          // If compressed string is still > 350KB, perform secondary reduction
          if (compressedDataUrl.length > 350 * 1024) {
            const secondaryCanvas = document.createElement('canvas')
            secondaryCanvas.width = Math.round(width * 0.7)
            secondaryCanvas.height = Math.round(height * 0.7)
            const sCtx = secondaryCanvas.getContext('2d')
            sCtx.fillStyle = '#FFFFFF'
            sCtx.fillRect(0, 0, secondaryCanvas.width, secondaryCanvas.height)
            sCtx.drawImage(canvas, 0, 0, secondaryCanvas.width, secondaryCanvas.height)
            const secondaryDataUrl = secondaryCanvas.toDataURL('image/jpeg', 0.65)
            resolve(secondaryDataUrl)
          } else {
            resolve(compressedDataUrl)
          }
        } catch (canvasErr) {
          reject(new Error('Failed compressing image: ' + canvasErr.message))
        }
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })
}
