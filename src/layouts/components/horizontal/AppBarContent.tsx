// ** MUI Imports
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { useContext, useMemo, useEffect, useState } from 'react'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'
import ModeFullscreen from 'src/@core/layouts/components/shared-components/ModeFullscreen'

// ** Components
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import { ReportContext } from 'src/context/ReportContext'
import { useAdminRoles } from 'src/hooks/useAdminRoles'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import { useSettings } from 'src/@core/hooks/useSettings'

interface Props {
  settings: Settings
  saveSettings: (values: Settings) => void
}

const Circle = styled('div')<{ color: string }>(({ color }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: color
}))

const AppBarContent = (props: Props) => {
  const router = useRouter()
  const { report } = useContext(ReportContext) || {}
  const { canViewRoles } = useAdminRoles()
  const { powerBIEmbedCapacityActive, powerBICapacityExists } = useSettings()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
return () => setIsMounted(false)
  }, [])

  const circleColor = useMemo(() => {
    if (powerBIEmbedCapacityActive) {
      return '#11955f'
    } else {
      return 'gray'
    }
  }, [powerBIEmbedCapacityActive])

  // ** Props
  const { settings, saveSettings } = props

  const isDashboardPath = router.pathname.startsWith('/dashboard')
  const isLoaded = report?.iframeLoaded

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {isMounted && isDashboardPath && <ModeFullscreen disabled={!isLoaded} onClick={() => report?.fullscreen()} />}
      {canViewRoles && powerBICapacityExists && (
        <Tooltip title={powerBIEmbedCapacityActive ? 'Capacity On' : 'Capacity Suspended'} placement='top'>
          <Circle color={circleColor} />
        </Tooltip>
      )}
      <UserDropdown settings={settings} saveSettings={saveSettings} />
    </Box>
  )
}

export default AppBarContent
