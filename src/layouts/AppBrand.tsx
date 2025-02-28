import Link from 'next/link'

import Box from '@mui/material/Box'
import { LayoutProps } from 'src/@core/layouts/types'
import { useSettings } from 'src/@core/hooks/useSettings'

interface Props {
  navHover: boolean
  collapsedNavWidth: number
  hidden: LayoutProps['hidden']
  navigationBorderWidth: number
  toggleNavVisibility: () => void
  settings: LayoutProps['settings']
  saveSettings: LayoutProps['saveSettings']
  navMenuBranding?: LayoutProps['verticalLayoutProps']['navMenu']['branding']
  menuLockedIcon?: LayoutProps['verticalLayoutProps']['navMenu']['lockedIcon']
  menuUnlockedIcon?: LayoutProps['verticalLayoutProps']['navMenu']['unlockedIcon']
}

const AppBrand = (props: Props) => {
  const { navHover, settings } = props
  const { appBranding } = useSettings()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Link href='/dashboard'>
        {settings.navCollapsed && !navHover ? (
          <img
            src={appBranding?.appFavicon || process.env.NEXT_PUBLIC_FAVICON_PATH || '/images/branding/favicon.png'}
            alt='logo'
            width={appBranding?.favicon_width || process.env.NEXT_PUBLIC_FAVICON_WIDTH || 60}
          />
        ) : (
          <img
            src={appBranding?.appLogo || process.env.NEXT_PUBLIC_MAIN_LOGO_PATH || '/images/branding/main_logo.png'}
            alt='logo'
            height={process.env.NEXT_PUBLIC_FAVICON_WIDTH || 50}
          />
        )}
      </Link>
    </Box>
  )
}

export default AppBrand
