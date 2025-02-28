export function settingToLabel(str: string): string {
  const words = str.split('_')
  const transformedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())

  // Check if the last word is "id" and capitalize it
  if (transformedWords[transformedWords.length - 1] === 'Id') {
    transformedWords[transformedWords.length - 1] = 'ID'
  }

  const transformedString = transformedWords.join(' ')

  return transformedString
}
