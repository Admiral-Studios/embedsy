import { CircularProgress, Grid, useMediaQuery } from '@mui/material'
import { styled, Theme } from '@mui/material/styles'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Tab from '@mui/material/Tab'
import MuiTabList, { TabListProps } from '@mui/lab/TabList'
import Box from '@mui/material/Box'
import Icon from 'src/@core/components/icon'
import { ReactElement, SyntheticEvent, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { SubjectTypes } from 'src/types/acl/subjectTypes'

const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
  border: '0 !important',
  '&, & .MuiTabs-scroller': {
    boxSizing: 'content-box',
    padding: theme.spacing(1.25, 1.25, 2),
    margin: `${theme.spacing(-1.25, -1.25, -2)} !important`
  },
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    minWidth: 65,
    minHeight: 38,
    lineHeight: 1,
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.up('md')]: {
      minWidth: 130
    },
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}))

const TabAccount = dynamic(() => import('src/views/pages/profile/TabAccount'))
const TabSecurity = dynamic(() => import('src/views/pages/profile/TabSecurity'))

const tabContentList: { [key: string]: ReactElement } = {
  account: <TabAccount />,
  security: <TabSecurity />
}

const ProfilePage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>('account')
  const [isLoading, setIsLoading] = useState(false)
  const hideText = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab as string)
    }
  }, [router.query.tab])

  const handleChange = (_: SyntheticEvent, value: string) => {
    setIsLoading(true)
    setActiveTab(value)
    router.push(`/profile/${value.toLowerCase()}`).then(() => setIsLoading(false))
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <TabContext value={activeTab}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <TabList variant='scrollable' scrollButtons='auto' onChange={handleChange}>
                <Tab
                  value='account'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon fontSize='1.25rem' icon='tabler:users' />
                      {!hideText && 'Account'}
                    </Box>
                  }
                />
                <Tab
                  value='security'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon fontSize='1.25rem' icon='tabler:lock' />
                      {!hideText && 'Security'}
                    </Box>
                  }
                />
              </TabList>
            </Grid>
            <Grid item xs={12}>
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TabPanel sx={{ p: 0 }} value={activeTab}>
                  {tabContentList[activeTab]}
                </TabPanel>
              )}
            </Grid>
          </Grid>
        </TabContext>
      </Grid>
    </Grid>
  )
}

ProfilePage.acl = {
  action: 'read',
  subject: SubjectTypes.ProfilePage
}

export default ProfilePage
