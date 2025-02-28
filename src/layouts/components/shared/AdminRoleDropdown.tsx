import { useState, SyntheticEvent, Fragment } from 'react'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import { styled } from '@mui/material/styles'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'
import Icon from 'src/@core/components/icon'
import { useAdminRoles } from 'src/hooks/useAdminRoles'
import { Role } from 'src/context/types'
import { PermanentRoles } from 'src/context/types'
import { useAuth } from 'src/hooks/useAuth'
import getRoleHumanizedName from 'src/utils/getRoleHumanizedName'

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
    mr: 2.5,
    fontSize: '1.5rem',
    color: 'text.secondary'
  }
}

const AdminRoleDropdown = () => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const { roles, onChangeViewAsRole, viewAsCustomRole } = useAdminRoles()
  const { isSuperAdmin, isAdmin } = useAuth()

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  const onClickChangeViewAsRole = (role: Role) => {
    onChangeViewAsRole(role)
    handleDropdownClose()
  }

  return (
    <Fragment>
      <MenuItemStyled sx={{ p: 0 }} onClick={handleDropdownOpen}>
        <Box sx={styles}>
          <Icon icon='tabler:user-circle' />
          View As Role
        </Box>
      </MenuItemStyled>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4.75 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {roles
          .filter(role => isSuperAdmin || role.role !== PermanentRoles.super_admin)
          .map((role: Role, index: number) => {
            const isHighlighted =
              (role.role === PermanentRoles.super_admin && isSuperAdmin && !viewAsCustomRole) ||
              (role.role === PermanentRoles.admin && isAdmin && !viewAsCustomRole) ||
              role === viewAsCustomRole

            return (
              <MenuItemStyled key={index} sx={{ p: 0 }} onClick={() => onClickChangeViewAsRole(role)}>
                <Box sx={{ ...styles, fontWeight: isHighlighted ? 'bold' : 'normal' }}>
                  {getRoleHumanizedName(role.role)}
                </Box>
              </MenuItemStyled>
            )
          })}
      </Menu>
    </Fragment>
  )
}

export default AdminRoleDropdown
