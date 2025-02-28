// ** MUI Components
import Box, { BoxProps } from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// ** Styled Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  height: '100%',
  width: '100%',
  borderRadius: '20px',
  marginTop: theme.spacing(12),
  objectFit: 'cover',
  marginBottom: theme.spacing(12)
}))

interface LoginImageProps extends BoxProps {
  customImage?: string
  customBrandingLoaded?: boolean
}

const LoginImage = ({ customImage, customBrandingLoaded = false, sx = {}, ...props }: LoginImageProps) => {
  // ** Hooks
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  return !hidden ? (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        borderRadius: '20px',
        justifyContent: 'center',
        backgroundColor: 'customColors.bodyBg',
        margin: theme => theme.spacing(8, 0, 8, 8),
        ...sx
      }}
      {...props}
    >
      {customBrandingLoaded &&
        (customImage || process.env.NEXT_PUBLIC_LOGIN_IMAGE_PATH || '/images/branding/login-image.jpg') && (
          <LoginIllustration
            src={customImage || process.env.NEXT_PUBLIC_LOGIN_IMAGE_PATH || '/images/branding/login-image.jpg'}
          />
        )}
      <FooterIllustrationsV2 />
    </Box>
  ) : null
}

export default LoginImage
