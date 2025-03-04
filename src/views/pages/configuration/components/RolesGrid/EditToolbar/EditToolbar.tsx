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
import { Role } from '../RolesGrid'
import { styled } from '@mui/material/styles'

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.paper,
  '&:disabled': {
    color: theme.palette.action.disabled
  }
}))

type Props = {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void
  rowModesModel: GridRowModesModel
  setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void
  rows: Role[]
  filterModel: GridFilterModel
  setCurrentEditRow: React.Dispatch<React.SetStateAction<GridValidRowModel | null>>
}

const EditToolbar = ({ setRows, rowModesModel, setRowModesModel, rows, filterModel, setCurrentEditRow }: Props) => {
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

    let role = ''

    if (filterModel.items[0]) {
      const filter = filterModel.items[0]
      if (filter.field === 'role') {
        role = filter.value
      }
    }

    setRows(oldRows => [...oldRows, { id, role: role, isNew: true }])

    setRowModesModel(oldModel => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'role' }
    }))

    setCurrentEditRow({ role: '' })
  }

  return (
    <GridToolbarContainer>
      <StyledButton disabled={isEditingRow} color='primary' startIcon={<AddIcon />} onClick={handleClick}>
        Add role
      </StyledButton>
    </GridToolbarContainer>
  )
}

export default EditToolbar
