export default function hexToRgb(hex: string) {
  hex = hex.replace(/^#/, '')

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(h => h + h)
      .join('')
  }

  const num = parseInt(hex, 16)
  
return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}
