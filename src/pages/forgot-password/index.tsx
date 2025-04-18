// ** React Imports
import React, { ReactNode } from 'react'

// ** MUI Components
import Box, { BoxProps } from '@mui/material/Box'
import { styled } from '@mui/material/styles'

// ** Layout Import

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Types
import type { AppPortalSettings } from 'src/@core/context/settingsContext'
import ForgotPasswordForm from 'src/views/pages/forgot-password/components/ForgotPasswordForm'
import LandingPagesImage from 'src/components/shared/LandingPages/LandingPagesImage'

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

const ForgotPasswordPage = () => {
  // ** Hooks
  const { appPortalSettings, appBranding, customBrandingLoaded, loadingPortalSettings } = useSettings()
  const { login_layout } = appPortalSettings

  // ** Image render
  const leftImageRender = (
    <LandingPagesImage
      key='left-image'
      customBrandingLoaded={customBrandingLoaded}
      customImage={appBranding?.forgot_password_page_image}
    />
  )
  const rightImageRender = (
    <LandingPagesImage
      key='right-image'
      customBrandingLoaded={customBrandingLoaded}
      customImage={appBranding?.forgot_password_page_image}
      sx={{ margin: theme => theme.spacing(8, 8, 8, 0) }}
    />
  )

  // ** Forgot password form render
  const forgotPasswordFormRender = (
    <FormWrapper key='login-form'>
      <Box
        sx={{
          p: [6, 12],
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ForgotPasswordForm />
      </Box>
    </FormWrapper>
  )

  // ** Content render options
  const contentRenderOptions: Partial<
    Record<NonNullable<Extract<AppPortalSettings['login_layout'], string>>, ReactNode[]>
  > = {
    'IMAGE LEFT, LOGIN RIGHT': [leftImageRender, forgotPasswordFormRender],
    'LOGIN LEFT, IMAGE RIGHT': [forgotPasswordFormRender, rightImageRender]
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

ForgotPasswordPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

ForgotPasswordPage.guestGuard = true

export default ForgotPasswordPage
