import { useEffect } from 'react'

const useFavicon = (faviconUrl: string | undefined, defaultFavicon: string) => {
  useEffect(() => {
    const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")

    if (link) {
      link.type = 'image/png'
      link.href = faviconUrl || defaultFavicon
    } else {
      const newLink = document.createElement('link')
      newLink.type = 'image/png'
      newLink.rel = 'icon'
      newLink.href = faviconUrl || defaultFavicon
      document.head.appendChild(newLink)
    }
  }, [faviconUrl, defaultFavicon])
}

export default useFavicon
