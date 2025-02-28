export default function isColorDark(r: number, g: number, b: number) {
  const [R, G, B] = [r, g, b].map(c => {
    c /= 255
    
return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B
  
return luminance < 0.7
}
