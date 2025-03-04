import { CircularProgress, Grid, Typography, useMediaQuery } from '@mui/material'
import { styled, Theme } from '@mui/material/styles'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Tab from '@mui/material/Tab'
import MuiTabList, { TabListProps } from '@mui/lab/TabList'
import Box from '@mui/material/Box'

import Icon from 'src/@core/components/icon'

import { ReactElement, SyntheticEvent, useState } from 'react'
import { useRouter } from 'next/router'
import TabAccount from 'src/views/pages/profile/TabAccount'
import TabSecurity from 'src/views/pages/profile/TabSecurity'
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

const tabContentList: { [key: string]: ReactElement } = {
  account: <TabAccount />,
  security: <TabSecurity />
}

const ProfilePage = () => {
  const { push } = useRouter()

  const [activeTab, setActiveTab] = useState('account')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (event: SyntheticEvent, value: string) => {
    setIsLoading(true)
    setActiveTab(value)

    push(`/profile/${value.toLowerCase()}`).then(() => setIsLoading(false))
  }

  const hideText = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <TabContext value={activeTab}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <TabList
                variant='scrollable'
                scrollButtons='auto'
                onChange={handleChange}
                aria-label='customized tabs example'
              >
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
                <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                  <CircularProgress sx={{ mb: 4 }} />
                  <Typography>Loading...</Typography>
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
