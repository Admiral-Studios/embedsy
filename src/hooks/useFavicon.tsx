import { useEffect } from 'react'

const useFavicon = (faviconUrl: string | undefined, defaultFavicon: string) => {
  useEffect(() => {
    const link: any = document.querySelector("link[rel*='icon']") || document.createElement('link')
    link.type = 'image/x-icon'
    link.rel = 'shortcut icon'

    link.href = defaultFavicon

    document.getElementsByTagName('head')[0].appendChild(link)

    if (faviconUrl) {
      link.href = faviconUrl
    }
  }, [faviconUrl, defaultFavicon])
}

export default useFavicon
