export const MAX_IMAGE_SIZE_MB = 5

export async function readImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file (JPG, PNG, or WebP)")
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image must be under ${MAX_IMAGE_SIZE_MB} MB`)
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Failed to read image"))
    reader.readAsDataURL(file)
  })
}
