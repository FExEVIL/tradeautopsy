/**
 * Compress image file before upload to prevent 413 errors
 * Reduces file size while maintaining reasonable quality
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8,
  maxSizeKB: number = 500
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width
        let height = img.height
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }
        
        // Create canvas and compress
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob with quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }
            
            // If still too large, reduce quality further
            const sizeKB = blob.size / 1024
            if (sizeKB > maxSizeKB) {
              // Recursively compress with lower quality
              const newQuality = Math.max(0.3, quality * 0.7)
              canvas.toBlob(
                (finalBlob) => {
                  if (!finalBlob) {
                    reject(new Error('Failed to compress image'))
                    return
                  }
                  
                  const compressedFile = new File(
                    [finalBlob],
                    file.name,
                    { type: 'image/jpeg' }
                  )
                  resolve(compressedFile)
                },
                'image/jpeg',
                newQuality
              )
            } else {
              const compressedFile = new File(
                [blob],
                file.name,
                { type: 'image/jpeg' }
              )
              resolve(compressedFile)
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Check if file needs compression
 */
export function shouldCompressImage(file: File, maxSizeKB: number = 1000): boolean {
  return file.size / 1024 > maxSizeKB
}

