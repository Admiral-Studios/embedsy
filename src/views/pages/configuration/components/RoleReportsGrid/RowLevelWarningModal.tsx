import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import CustomModal from '../../../../../components/shared/CustomModal'
import { styled } from '@mui/material/styles'
import { WorkspaceWithReportModel } from './RoleReportsGrid'

const PreviewBoxStyled = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 250,
  overflowY: 'scroll',
  padding: theme.spacing(2, 0)
}))

const ActionBoxStyled = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  gap: theme.spacing(2),
  display: 'flex'
}))

type Props = {
  open: boolean
  workspaceWithReport: WorkspaceWithReportModel
  onClose: () => void
}

const RowLevelWarningModal = ({ open, workspaceWithReport, onClose }: Props) => (
  <CustomModal open={open} handleClose={onClose} title='Row Level Warning'>
    <PreviewBoxStyled>
      <Typography>
        {workspaceWithReport.report && workspaceWithReport.workspace
          ? `The report ${workspaceWithReport.report} from ${workspaceWithReport.workspace} workspace requires a row level role.`
          : 'The selected report requires a row level role'}
      </Typography>
    </PreviewBoxStyled>
    <ActionBoxStyled>
      <Button variant='contained' onClick={onClose}>
        Close
      </Button>
    </ActionBoxStyled>
  </CustomModal>
)

export default RowLevelWarningModal
