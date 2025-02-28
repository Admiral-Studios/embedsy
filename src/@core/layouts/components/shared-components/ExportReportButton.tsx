import { Box, Menu, MenuItem, MenuItemProps, styled } from '@mui/material'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Icon from 'src/@core/components/icon'
import { exportTo } from 'src/utils/powerbi/exportTo'

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

type Props = {
  workspaceId: string
  reportId: string
  onCloseDropdown: () => void
  datasetId?: string
  email?: string
  rowLevelRole?: string
}

const ExportReportButton = ({ workspaceId, reportId, onCloseDropdown, datasetId, email, rowLevelRole }: Props) => {
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null)
  const [loading, setLoading] = useState(false)

  const openExportMenu = Boolean(exportMenuAnchor)

  const handleOpenExportMenu = (event: React.MouseEvent<HTMLLIElement>) => {
    setExportMenuAnchor(event.currentTarget)
  }

  const handleCloseExportMenu = () => {
    setExportMenuAnchor(null)
  }

  const handleClickExportMenuItem = async (fileType: 'PDF' | 'PPTX' | 'PNG') => {
    setLoading(true)

    handleCloseExportMenu()
    onCloseDropdown()

    try {
      toast.loading('Export in progress')
      await exportTo(workspaceId, reportId, fileType, email, rowLevelRole, datasetId)
      toast.dismiss()
      toast.success('Export completed successfully')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.toString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <MenuItemStyled sx={{ p: 0, m: 0, mx: 2 }} id='export-button' disabled={loading} onClick={handleOpenExportMenu}>
        <Box sx={styles}>
          <Icon icon='mingcute:settings-2-line' />
          Export Report
        </Box>
      </MenuItemStyled>

      <Menu id='export-menu' anchorEl={exportMenuAnchor} open={openExportMenu} onClose={handleCloseExportMenu}>
        <MenuItem onClick={() => handleClickExportMenuItem('PDF')} sx={styles}>
          <Icon icon='ph:file-pdf-light' />
          PDF
        </MenuItem>

        <MenuItem onClick={() => handleClickExportMenuItem('PPTX')} sx={styles}>
          <Icon icon='ph:file-ppt-light' />
          PPT
        </MenuItem>

        <MenuItem onClick={() => handleClickExportMenuItem('PNG')} sx={styles}>
          <Icon icon='ph:file-png-light' />
          PNG
        </MenuItem>
      </Menu>
    </>
  )
}

export default ExportReportButton
