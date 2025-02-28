// ** MUI Imports
import { Box, MenuItem, MenuItemProps, styled } from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types Import
import { Mode } from 'src/@core/layouts/types'
import { Settings } from 'src/@core/context/settingsContext'

interface Props {
  settings: Settings
  saveSettings: (values: Settings) => void
}

const MenuItemStyled = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
  '&:hover .MuiBox-root, &:hover .MuiBox-root svg': {
    color: theme.palette.primary.main
  }
}))

const styles = {
  px: 4,
  py: 1.75,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  color: 'text.primary',
  textDecoration: 'none',
  '& svg': {
    mr: 1.5,
    fontSize: '1.6rem',
    color: 'text.primary'
  }
}

const ModeToggler = (props: Props) => {
  // ** Props
  const { settings, saveSettings } = props

  const handleModeChange = (mode: Mode) => {
    saveSettings({ ...settings, mode: mode })
  }

  const handleModeToggle = () => {
    if (settings.mode === 'light') {
      handleModeChange('dark' as Mode)
    } else {
      handleModeChange('light' as Mode)
    }
  }

  return (
    <MenuItemStyled sx={{ p: 0 }} onClick={handleModeToggle}>
      <Box sx={styles}>
        <Icon icon={settings.mode === 'dark' ? 'tabler:sun' : 'tabler:moon-stars'} />
        Switch to {settings.mode === 'dark' ? 'light' : 'dark'} mode
      </Box>
    </MenuItemStyled>
  )
}

export default ModeToggler
