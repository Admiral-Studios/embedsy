// ** React Imports
import React, { ReactNode, useEffect } from 'react'

// ** MUI Components
import Box, { BoxProps } from '@mui/material/Box'
import { styled } from '@mui/material/styles'

// ** Layout Import
import LoginForm from 'src/views/pages/login/components/LoginForm'
import LoginImage from 'src/views/pages/login/components/LoginImage'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Types
import type { AppPortalSettings } from 'src/@core/context/settingsContext'

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

const LoginPage = () => {
  // ** Hooks
  const { appPortalSettings, appBranding, customBrandingLoaded, loadingPortalSettings } = useSettings()
  const { login_layout } = appPortalSettings
  const router = useRouter()

  // ** Image render
  const leftImageRender = (
    <LoginImage
      key='left-image'
      customBrandingLoaded={customBrandingLoaded}
      customImage={appBranding?.login_page_image}
    />
  )
  const rightImageRender = (
    <LoginImage
      key='right-image'
      customBrandingLoaded={customBrandingLoaded}
      customImage={appBranding?.login_page_image}
      sx={{ margin: theme => theme.spacing(8, 8, 8, 0) }}
    />
  )

  // ** Login form render
  const loginFormRender = (
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
        <LoginForm />
      </Box>
    </FormWrapper>
  )

  useEffect(() => {
    const { user, pass } = router.query
    if (user && typeof user === 'string') {
      sessionStorage.setItem('loginEmail', user)
    }
    if (pass && typeof pass === 'string') {
      sessionStorage.setItem('loginPassword', pass)
    }
  }, [router.query])

  // ** Content render options
  const contentRenderOptions: Partial<
    Record<NonNullable<Extract<AppPortalSettings['login_layout'], string>>, ReactNode[]>
  > = {
    'IMAGE LEFT, LOGIN RIGHT': [leftImageRender, loginFormRender],
    'LOGIN LEFT, IMAGE RIGHT': [loginFormRender, rightImageRender]
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

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

LoginPage.guestGuard = true

export default LoginPage
