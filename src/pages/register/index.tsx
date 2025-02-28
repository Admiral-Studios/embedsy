// ** React Imports
import { ReactNode } from 'react'

// ** MUI Components
import Box, { BoxProps } from '@mui/material/Box'
import { styled } from '@mui/material/styles'

// ** Custom Components
import RegisterForm from 'src/views/pages/register/components/RegisterForm'
import RegisterImage from 'src/views/pages/register/components/RegisterImage'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Types
import type { AppPortalSettings } from 'src/@core/context/settingsContext'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

const FormWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 450
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 600
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 750
  }
}))

const Register = () => {
  // ** Hooks
  const { appPortalSettings, appBranding, customBrandingLoaded, loadingPortalSettings } = useSettings()
  const { login_layout } = appPortalSettings

  // ** Image render
  const leftImageRender = (
    <RegisterImage
      key='left-image'
      customBrandingLoaded={customBrandingLoaded}
      customImage={appBranding?.registration_page_image}
    />
  )
  const rightImageRender = (
    <RegisterImage
      key='right-image'
      customBrandingLoaded={customBrandingLoaded}
      customImage={appBranding?.registration_page_image}
      sx={{ margin: theme => theme.spacing(8, 8, 8, 0) }}
    />
  )

  // ** Register form render
  const registerFormRender = (
    <FormWrapper key='register-form'>
      <Box
        sx={{
          p: [6, 12],
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <RegisterForm />
      </Box>
    </FormWrapper>
  )

  // ** Content render options
  const contentRenderOptions: Record<NonNullable<Extract<AppPortalSettings['login_layout'], string>>, ReactNode[]> = {
    'IMAGE LEFT, LOGIN RIGHT': [leftImageRender, registerFormRender],
    'LOGIN LEFT, IMAGE RIGHT': [registerFormRender, rightImageRender]
  }

  const contentRender =
    contentRenderOptions[login_layout as keyof typeof contentRenderOptions] ||
    contentRenderOptions['IMAGE LEFT, LOGIN RIGHT']

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      {!loadingPortalSettings && contentRender}
    </Box>
  )
}

Register.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

Register.guestGuard = true

export default Register
