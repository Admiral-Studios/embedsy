import { Box, Button, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useAdminRoles } from 'src/hooks/useAdminRoles'
import getRoleHumanizedName from 'src/utils/getRoleHumanizedName'
import { useSettings } from 'src/@core/hooks/useSettings'

const ToolbarWrapper = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingTop: '6px',
  paddingBottom: '6px',
  width: '100%'
}))

const ToolbarContent = styled(Box, {
  shouldForwardProp: prop => prop !== 'navCollapsed' && prop !== 'hidden'
})<{ navCollapsed?: boolean; hidden?: boolean }>(({ navCollapsed, hidden }) => ({
  display: 'flex',
  alignItems: 'center',
  paddingLeft: hidden ? '0px' : navCollapsed ? '82px' : '260px',
  transition: 'padding-left 0.25s ease-in-out'
}))

const ViewAsRoleToolbar = () => {
  const { viewAsCustomRole, onChangeViewAsRole } = useAdminRoles()
  const { settings } = useSettings()
  const { navCollapsed } = settings

  if (!viewAsCustomRole) return null

  const handleExitRoleView = () => {
    onChangeViewAsRole(null)
  }

  return (
    <ToolbarWrapper>
      <ToolbarContent navCollapsed={navCollapsed} hidden={settings.navHidden}>
        <Typography variant='body2' sx={{ fontWeight: 500 }}>
          You are viewing the portal as: <strong>{getRoleHumanizedName(viewAsCustomRole.role)}</strong>
        </Typography>
        <Button
          variant='outlined'
          size='small'
          color='primary'
          onClick={handleExitRoleView}
          sx={{
            ml: 4,
            borderRadius: '4px',
            height: '24px',
            backgroundColor: theme => theme.palette.grey[100],
            borderColor: theme => theme.palette.grey[300],
            color: theme => theme.palette.grey[700],
            '&:hover': {
              backgroundColor: theme => theme.palette.grey[200],
              borderColor: theme => theme.palette.grey[400]
            }
          }}
        >
          Stop Role View
        </Button>
      </ToolbarContent>
    </ToolbarWrapper>
  )
}

export default ViewAsRoleToolbar
