import React from 'react'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import { GridToolbarContainer } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.paper,
  '&:disabled': {
    color: theme.palette.action.disabled
  }
}))

type Props = {
  setMediaAndFilesUploadModalOpen: (value: boolean) => void
}

const EditToolbar = ({ setMediaAndFilesUploadModalOpen }: Props) => {
  const handleClick = () => {
    setMediaAndFilesUploadModalOpen(true)
  }

  return (
    <GridToolbarContainer>
      <StyledButton color='primary' startIcon={<AddIcon />} onClick={handleClick}>
        Upload & Manage Files
      </StyledButton>
    </GridToolbarContainer>
  )
}

export default EditToolbar
