let powerbi: any = null
let pbi: any = null
const preloadedReports = new Set<string>()

export const preloadPowerBI = async (workspaceId: string, reportId?: string) => {
  if (typeof window === 'undefined' || !reportId) return

  const cacheKey = `pbi-${workspaceId}-${reportId}`
  if (preloadedReports.has(cacheKey)) return

  try {
    if (!powerbi || !pbi) {
      const pbiModule = await import('powerbi-client')
      pbi = pbiModule
      powerbi = new pbiModule.service.Service(
        pbiModule.factories.hpmFactory,
        pbiModule.factories.wpmpFactory,
        pbiModule.factories.routerFactory
      )
    }
    const embedUrlResponse = await fetch(`/api/powerbi/embed-url?reportId=${reportId}&workspaceId=${workspaceId}`)
    const embedUrlData = await embedUrlResponse.json()

    const result = await powerbi.preload({
      type: 'report',
      embedUrl: embedUrlData.embedUrl,
      accessToken: undefined,
      tokenType: pbi.models.TokenType.Embed
    })

    preloadedReports.add(cacheKey)

    return result
  } catch (error) {
    console.error('Error preloading Power BI report:', error)
  }
}

export const preloadThemes = async (darkThemeUrl?: string, lightThemeUrl?: string) => {
  if (typeof window === 'undefined') return { dark: null, light: null }

  const themes: { dark: any; light: any } = { dark: null, light: null }

  try {
    const promises = []
    if (darkThemeUrl) promises.push(fetch(darkThemeUrl).then(res => res.json()))
    if (lightThemeUrl) promises.push(fetch(lightThemeUrl).then(res => res.json()))

    const results = await Promise.all(promises)
    if (darkThemeUrl) themes.dark = results[0]
    if (lightThemeUrl) themes.light = results[results.length - 1]

    return themes
  } catch (error) {
    console.error('Error preloading themes:', error)

    return themes
  }
}

export const clearPreloadedReports = () => {
  preloadedReports.clear()
}
