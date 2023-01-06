/**
 *
 * Convert file to base64. base64 size will be different from original file size,
 * see [Encoded size increase](https://developer.mozilla.org/en-US/docs/Glossary/Base64#encoded_size_increase).
 *
 * @param file File
 * @returns string
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result?.toString() || '')
      reader.onerror = (error) => reject(error)
    })
  }
  