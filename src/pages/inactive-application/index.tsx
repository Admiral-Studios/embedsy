import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/router'

import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import { useAuth } from 'src/hooks/useAuth'

const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))

const InactiveApplicationPage = () => {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user || (user && user?.active_app)) {
      router.replace('/')
    }
  }, [user, router])

  return (
    <Box className='content-center'>
      <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <BoxWrapper>
          <Typography variant='h2' sx={{ mb: 1.5 }}>
            Inactive Application
          </Typography>
          <Typography sx={{ mb: 6, color: 'error.main' }}>
            Your application is inactive. Please contact us at{' '}
            <span style={{ fontWeight: 'bold' }}>info@embedsy.io</span> for further information or if you want to
            activate your application.
          </Typography>
        </BoxWrapper>
      </Box>
    </Box>
  )
}

InactiveApplicationPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

InactiveApplicationPage.acl = {
  action: 'read',
  subject: SubjectTypes.ApplicationStateErrorPage
}

export default InactiveApplicationPage
