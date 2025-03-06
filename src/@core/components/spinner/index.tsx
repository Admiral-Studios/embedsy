// ** MUI Imports
import Box, { BoxProps } from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useSettings } from 'src/@core/hooks/useSettings'

const FallbackSpinner = ({ sx }: { sx?: BoxProps['sx'] }) => {
  const { appBranding, customBrandingLoaded } = useSettings()

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        ...sx
      }}
    >
      {customBrandingLoaded && (
        <img
          src={appBranding?.appLogo || process.env.NEXT_PUBLIC_MAIN_LOGO_PATH || ''}
          alt={process.env.NEXT_PUBLIC_BRAND_NAME ? process.env.NEXT_PUBLIC_BRAND_NAME : ''}
          width={appBranding?.main_logo_width || process.env.NEXT_PUBLIC_MAIN_LOGO_WIDTH || '295'}
        />
      )}

      <CircularProgress disableShrink sx={{ mt: 6 }} />
    </Box>
  )
}

export default FallbackSpinner
