import React, { useState, useEffect } from 'react'

import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  GridToolbarContainer,
  GridValidRowModel,
  GridFilterModel
} from '@mui/x-data-grid'
import { RoleReport } from '../RoleReportsGrid'
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
  rows: RoleReport[]
  filterModel: GridFilterModel
  setCurrentEditRow: React.Dispatch<React.SetStateAction<GridValidRowModel | null>>
}

const EditToolbar = ({
  setRows,
  rowModesModel,
  setRowModesModel,
  rows,
  filterModel,
  setCurrentEditRow
}: EditToolbarProps) => {
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
    let workspace = ''
    let report = ''
    let row_level_role = ''

    if (filterModel.items[0]) {
      const filter = filterModel.items[0]
      switch (filter.field) {
        case 'role':
          role = filter.value
          break
        case 'workspace':
          workspace = filter.value
          break
        case 'report':
          report = filter.value
          break
        case 'row_level_role':
          row_level_role = filter.value
          break
      }
    }

    setRows(oldRows => [
      ...oldRows,
      { id, role: role, workspace: workspace, report: report, row_level_role: row_level_role, isNew: true }
    ])

    setRowModesModel(oldModel => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'role' }
    }))

    setCurrentEditRow({ role: '', workspace: '', report: '', row_level_role: '' })
  }

  return (
    <GridToolbarContainer>
      <StyledButton disabled={isEditingRow} color='primary' startIcon={<AddIcon />} onClick={handleClick}>
        Add report
      </StyledButton>
    </GridToolbarContainer>
  )
}

export default EditToolbar
