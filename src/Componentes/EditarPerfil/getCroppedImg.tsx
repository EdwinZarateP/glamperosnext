// getCroppedImg.ts
export interface Area {
  width: number
  height: number
  x: number
  y: number
}

/**
 * Recibe una URL de imagen y un área de recorte, devuelve un Blob ya recortado.
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  // 1) Cargar la imagen
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Error cargando la imagen'))
    img.src = imageSrc
  })

  // 2) Crear un canvas del tamaño del recorte
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo obtener el contexto 2D')

  // 3) Dibujar la porción recortada en el canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // 4) Convertir a Blob (webp para optimizar)
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error('Error al generar el blob'))
      resolve(blob)
    }, 'image/webp')
  })
}
