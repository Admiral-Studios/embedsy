import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { Box, Tab } from '@mui/material'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React, { SyntheticEvent, useEffect } from 'react'
import { TabList } from 'src/components/shared/Tab/TabList'
import { UserConfigurationProvider } from 'src/context/UserConfiguration/UserConfigurationProvider'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import { useAuth } from 'src/hooks/useAuth'

const TABS = [
  {
    key: 'roles',
    label: 'Roles',
    Component: dynamic(() => import('src/views/pages/configuration/RolesScreen'), { ssr: false })
  },
  {
    key: 'pages',
    label: 'Pages',
    Component: dynamic(() => import('src/views/pages/configuration/PagesScreen'), { ssr: false })
  },
  {
    key: 'users',
    label: 'Users',
    Component: dynamic(() => import('src/views/pages/configuration/UsersScreen'), { ssr: false })
  }
]

type PageType = (typeof TABS)[number]['key']

const UserConfigurationPage = () => {
  const router = useRouter()
  const { hasAdminPrivileges } = useAuth()

  const page = router.query.page

  useEffect(() => {
    if (!hasAdminPrivileges) {
      router.replace('/')
    }
  }, [hasAdminPrivileges, router])

  const handleChangeTab = (e: SyntheticEvent, tab: string) => {
    router.replace(`/user-configuration/${tab}`)
  }

  if (!hasAdminPrivileges) {
    return null
  }

  return (
    <UserConfigurationProvider>
      <TabContext value={(page || 'roles') as string}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
          <TabList
            onChange={handleChangeTab}
            variant='scrollable'
            scrollButtons='auto'
            sx={{ '.MuiTabs-flexContainer': { justifyContent: 'flex-end' } }}
          >
            {TABS.map(({ key, label }) => (
              <Tab key={key} value={key} label={label} />
            ))}
          </TabList>
        </Box>

        <Box sx={{ mt: 4 }}>
          {TABS.map(({ key, Component }) => (
            <TabPanel
              key={key}
              value={key}
              sx={{
                padding: 0
              }}
            >
              <Component />
            </TabPanel>
          ))}
        </Box>
      </TabContext>
    </UserConfigurationProvider>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const page = ctx.params?.page as PageType

  const validPages = TABS.map(tab => tab.key)

  if (!ctx.params?.page || !validPages.includes(page)) {
    ctx.res.writeHead(302, { Location: `/new-configuration/${validPages[0]}` })
    ctx.res.end()
  }

  return { props: {} }
}

UserConfigurationPage.acl = {
  action: 'read',
  subject: SubjectTypes.UserConfiguration
}

export default UserConfigurationPage
