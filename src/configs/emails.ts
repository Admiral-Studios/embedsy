import { AppBranding } from 'src/@core/context/settingsContext'

export const basicEmailConfiguration = (appBranding?: AppBranding | null) => ({
  mainColor: appBranding?.main_color || process.env.NEXT_PUBLIC_MAIN_COLOR || ' #FFC815',
  logo: appBranding?.main_logo
    ? appBranding?.main_logo
    : process.env.NEXT_PUBLIC_MAIN_LOGO_PATH
    ? `${process.env.NEXT_PUBLIC_URL}${process.env.NEXT_PUBLIC_MAIN_LOGO_PATH}`
    : `${process.env.NEXT_PUBLIC_URL}/images/branding/main_logo.png`,
  logoWidth: appBranding?.main_logo_width || process.env.NEXT_PUBLIC_MAIN_LOGO_WIDTH || 150
})
