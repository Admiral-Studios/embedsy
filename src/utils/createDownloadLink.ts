export const createDownloadLink = async (downloadLink: string, fileName: string) => {
  const response = await fetch(downloadLink)
  const blob = await response.blob()

  const blobUrl = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = blobUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()

  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(blobUrl)
}
