// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useContext, useMemo } from 'react'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import { ReportContext } from 'src/context/ReportContext'
import { useRouter } from 'next/router'
import ModeFullscreen from 'src/@core/layouts/components/shared-components/ModeFullscreen'
import { useAdminRoles } from 'src/hooks/useAdminRoles'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import { useSettings } from 'src/@core/hooks/useSettings'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

const Circle = styled('div')<{ color: string }>(({ color }) => ({
  width: 20,
  height: 20,
  borderRadius: '50%',
  backgroundColor: color
}))

const AppBarContent = (props: Props) => {
  const router = useRouter()
  const { hidden, settings, saveSettings, toggleNavVisibility } = props
  const { report } = useContext(ReportContext) || {}
  const { canViewRoles } = useAdminRoles()
  const { powerBIEmbedCapacityActive, powerBICapacityExists } = useSettings()

  const circleColor = useMemo(() => {
    if (powerBIEmbedCapacityActive) {
      return '#11955f'
    } else {
      return 'gray'
    }
  }, [powerBIEmbedCapacityActive])

  const isDashboardPath = router.pathname.startsWith('/dashboard')
  const isLoaded = report?.iframeLoaded

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden ? (
          <IconButton color='inherit' onClick={toggleNavVisibility}>
            <Icon fontSize='1.5rem' icon='tabler:menu-2' />
          </IconButton>
        ) : null}

        {isDashboardPath && <ModeFullscreen disabled={!isLoaded} onClick={() => report?.fullscreen()} />}
      </Box>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        {canViewRoles && powerBICapacityExists && (
          <Tooltip title={powerBIEmbedCapacityActive ? 'Capacity On' : 'Capacity Suspended'} placement='top'>
            <Circle color={circleColor} />
          </Tooltip>
        )}
        <UserDropdown settings={settings} saveSettings={saveSettings} />
      </Box>
    </Box>
  )
}

export default AppBarContent
