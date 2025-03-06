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

const BoxStyled = styled('div')<MenuItemProps>(({ theme }) => ({
  margin: 0,
  '&:hover': {
    cursor: 'pointer',
    backgroundColor: theme.palette.customColors.trackBg,
    borderRadius: 6
  },
  transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
}))

const MenuItemStyled = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
  '&:hover .MuiBox-root, &:hover .MuiBox-root svg': {
    color: theme.palette.primary.main
  }
}))

const RoleBoxStyled = styled(Box)<{ isHighlighted: boolean }>(({ isHighlighted, theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  fontWeight: isHighlighted ? 'bold' : 'normal',
  borderRadius: 6,
  '& > span': {
    px: 2,
    py: 2,
    display: 'inherit'
  },
  '&:hover': {
    backgroundColor: theme.palette.background.default
  }
}))

const RoleSpanStyled = styled('span')({
  padding: '6px 12px'
})

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
      <BoxStyled sx={styles} onClick={handleDropdownOpen}>
        <Icon icon='tabler:user-circle' />
        View As Role
      </BoxStyled>
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
          .map((role: Role, index: number) => (
            <MenuItemStyled key={index} sx={{ p: 0 }} onClick={() => onClickChangeViewAsRole(role)}>
              <RoleBoxStyled
                isHighlighted={
                  (role.role === PermanentRoles.super_admin && isSuperAdmin && !viewAsCustomRole) ||
                  (role.role === PermanentRoles.admin && isAdmin && !viewAsCustomRole) ||
                  role === viewAsCustomRole
                }
              >
                <RoleSpanStyled>{getRoleHumanizedName(role.role)}</RoleSpanStyled>
              </RoleBoxStyled>
            </MenuItemStyled>
          ))}
      </Menu>
    </Fragment>
  )
}

export default AdminRoleDropdown
