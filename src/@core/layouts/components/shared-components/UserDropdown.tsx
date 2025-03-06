// ** React Imports
import { useState, SyntheticEvent, Fragment } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Context
import { useAuth } from 'src/hooks/useAuth'

// ** Type Imports
import { Settings } from 'src/@core/context/settingsContext'
import Link from 'next/link'
import Switch from 'react-switch'
import { useSettings } from 'src/@core/hooks/useSettings'
import ModeToggler from './ModeToggler'
import AdminRoleDropdown from 'src/layouts/components/shared/AdminRoleDropdown'
import { useAdminRoles } from 'src/hooks/useAdminRoles'

interface Props {
  settings: Settings
  saveSettings: (values: Settings) => void
}

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const MenuItemStyled = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
  '&:hover .MuiBox-root, &:hover .MuiBox-root svg': {
    color: theme.palette.primary.main
  }
}))

const UserDropdown = (props: Props) => {
  // ** Props
  const { settings, saveSettings } = props
  const { canViewRoles } = useAdminRoles()

  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  // ** Hooks
  const router = useRouter()
  const { logout, user, hasAdminPrivileges, canRefresh } = useAuth()

  // ** Vars
  const { direction } = settings

  const { powerBIEmbedCapacityActive, changeEmbedCapacity, powerBICapacityExists } = useSettings()

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = (url?: string) => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  const styles = {
    px: 4,
    py: 1.75,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2.5,
      fontSize: '1.5rem',
      color: 'text.secondary'
    }
  }

  const handleLogout = () => {
    logout()
    handleDropdownClose()
  }

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <Icon icon='mdi:account' onClick={handleDropdownOpen} width={38} height={38} />
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4.75 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <Box sx={{ py: 1.75, px: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
            >
              <Icon icon='mdi:account' width='2.5rem' height='2.5rem' />
            </Badge>
            <Box sx={{ display: 'flex', ml: 2.5, alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 500, wordBreak: 'break-word' }}>{user?.username}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />

        <Box sx={{ px: 1 }}>
          <ModeToggler settings={settings} saveSettings={saveSettings} />

          {canViewRoles && <AdminRoleDropdown />}
        </Box>

        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />

        <Link href='/profile/account'>
          <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
            <Box sx={styles}>
              <Icon icon='tabler:user-check' />
              My Profile
            </Box>
          </MenuItemStyled>
        </Link>
        {canRefresh || hasAdminPrivileges ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link href='/integrations'>
              <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
                <Box sx={styles}>
                  <Icon icon='lucide:user-cog' />
                  Integrations
                </Box>
              </MenuItemStyled>
            </Link>
            <Link href='/configuration'>
              <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
                <Box sx={styles}>
                  <Icon icon='lucide:user-cog' />
                  User Configuration
                </Box>
              </MenuItemStyled>
            </Link>
            {hasAdminPrivileges && (
              <>
                <Link href='/roles-configuration'>
                  <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
                    <Box sx={styles}>
                      <Icon icon='tabler:user-cog' />
                      Roles Configuration
                    </Box>
                  </MenuItemStyled>
                </Link>
                <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
                <Link href='/portal-configuration'>
                  <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
                    <Box sx={styles}>
                      <Icon icon='clarity:cog-line' />
                      Portal Configuration
                    </Box>
                  </MenuItemStyled>
                </Link>
                {powerBICapacityExists && (
                  <>
                    <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
                    <Box sx={{ ...styles, paddingLeft: 6, gap: 2 }}>
                      <Switch
                        height={16.8}
                        width={33.6}
                        handleDiameter={12}
                        checked={powerBIEmbedCapacityActive}
                        onChange={() => changeEmbedCapacity()}
                        checkedIcon={false}
                        uncheckedIcon={false}
                        onColor='#11955f'
                      />
                      Embed Capacity
                    </Box>
                  </>
                )}
              </>
            )}
          </div>
        ) : null}
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />

        <MenuItemStyled sx={{ p: 0 }} onClick={handleLogout}>
          <Box sx={styles}>
            <Icon icon='tabler:logout' />
            Sign Out
          </Box>
        </MenuItemStyled>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
