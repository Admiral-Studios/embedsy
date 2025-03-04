import React, { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  GridToolbarContainer,
  GridFilterModel,
  GridValidRowModel
} from '@mui/x-data-grid'
import { UserRoles } from '../UserRolesGrid'
import UploadUserRolesModal from './UploadUserRolesModal'
import { styled } from '@mui/material/styles'

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.paper,
  '&:disabled': {
    color: theme.palette.action.disabled
  }
}))

type EditToolbarProps = {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void
  rowModesModel: GridRowModesModel
  setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void
  rows: UserRoles[]
  updateLocalListOnSuccess: (insertedRoles: UserRoles[]) => void
  filterModel: GridFilterModel
  setCurrentEditRow: React.Dispatch<React.SetStateAction<GridValidRowModel | null>>
}

const EditToolbar = ({
  setRows,
  rowModesModel,
  setRowModesModel,
  rows,
  updateLocalListOnSuccess,
  filterModel,
  setCurrentEditRow
}: EditToolbarProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isEditingRow, setIsEditingRow] = useState(false)

  useEffect(() => {
    if (Object.keys(rowModesModel).length) {
      setIsEditingRow(true)
    } else {
      setIsEditingRow(false)
    }
  }, [rowModesModel])

  const handleClick = () => {
    const ids = rows.map(object => {
      return object.id
    })

    const id = Math.max(...ids) + 1

    let email = ''
    let role = ''

    if (filterModel.items[0]) {
      const filter = filterModel.items[0]
      switch (filter.field) {
        case 'role':
          role = filter.value
          break
        case 'email':
          email = filter.value
          break
      }
    }

    setRows(oldRows => [...oldRows, { id, email: email, role: role, isNew: true }])

    setRowModesModel(oldModel => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'role' }
    }))

    setCurrentEditRow({ role: '', email: '' })
  }

  const handleUpload = () => {
    setIsUploadModalOpen(true)
  }

  return (
    <GridToolbarContainer>
      <UploadUserRolesModal
        open={isUploadModalOpen}
        handleClose={() => setIsUploadModalOpen(false)}
        updateLocalListOnSuccess={updateLocalListOnSuccess}
      />
      <StyledButton disabled={isEditingRow} color='primary' startIcon={<AddIcon />} onClick={handleClick}>
        Assign role
      </StyledButton>
      <StyledButton disabled={isEditingRow} color='primary' startIcon={<AddIcon />} onClick={handleUpload}>
        Upload assigned roles
      </StyledButton>
    </GridToolbarContainer>
  )
}

export default EditToolbar
