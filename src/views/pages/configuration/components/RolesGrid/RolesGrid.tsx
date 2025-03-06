import React, { useContext, useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Close'
import {
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridFilterModel,
  GridValidRowModel
} from '@mui/x-data-grid'

import axios from 'axios'
import { RolesContext } from 'src/context/RolesContext'
import EditToolbar from './EditToolbar/EditToolbar'
import checkForRowPresence from 'src/utils/checkForRowPresence'
import WarningModal from '../shared/WarningModal'
import { Typography } from '@mui/material'

export type Role = {
  id: number
  role: string
  can_refresh: boolean
}

const RolesGrid = () => {
  const {
    rolesRows: rows,
    allRolesData,
    setRolesRows: setRows,
    setUserRolesRows,
    userRolesRows
  } = useContext(RolesContext)

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})
  const [warningModalOpen, setWarningModalOpen] = useState(false)

  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [currentEditRow, setCurrentEditRow] = useState<GridValidRowModel | null>(null)
  const [canRowBeUpdated, setCanRowBeUpdated] = useState(false)

  useEffect(() => {
    if (currentEditRow?.role) {
      setCanRowBeUpdated(true)
    } else {
      setCanRowBeUpdated(false)
    }
  }, [currentEditRow])

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleEditClick = (id: GridRowId) => () => {
    const editedRow = rows.find(row => row.id === id)
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })
    if (editedRow) {
      setCurrentEditRow({
        role: editedRow.role,
        can_refresh: editedRow.can_refresh
      })
    }
  }

  const handleSaveClick = (id: GridRowId) => async () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })
  }

  const handleDeleteClick = (id: GridRowId) => async () => {
    try {
      await axios.post(`/api/db_transactions/role/delete`, { id: id })
      setRows(rows.filter(row => row.id !== id))
      setUserRolesRows(userRolesRows.filter(userRole => userRole.role_id !== id))
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true }
    })

    const editedRow = rows.find(row => row.id === id)
    if (editedRow!.isNew) {
      setRows(rows.filter(row => row.id !== id))
    }

    setCurrentEditRow(null)
  }

  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false }
    const { role, id, can_refresh } = newRow
    const roleId = (rows as any).find((item: Role) => item.id === id && !newRow.isNew)

    const rowAlreadyExists = checkForRowPresence(newRow, rows as GridRowModesModel[])

    if (rowAlreadyExists) {
      setWarningModalOpen(true)
      setRowModesModel({ ...rowModesModel, [newRow.id]: { mode: GridRowModes.Edit } })

      return
    }

    if (roleId) {
      try {
        await axios.patch(`/api/db_transactions/role/update`, { role: role, id: id, can_refresh: can_refresh })
        setRows(rows.map(row => (row.id === newRow.id ? updatedRow : row)))
        setUserRolesRows(
          userRolesRows.map(userRole =>
            userRole.role_id === newRow.id ? { ...userRole, role, can_refresh } : userRole
          )
        )
      } catch (error) {
        console.error('Error updating role:', error)
      }
    } else {
      try {
        const {
          data: { id: newRoleId }
        } = await axios.post(`/api/db_transactions/role/insert`, { role: role, can_refresh: can_refresh })

        setRows(rows.map(row => (row.id === newRow.id ? { ...updatedRow, id: newRoleId } : row)))
      } catch (error) {
        console.error('Error inserting role:', error)
      }
    }

    setCurrentEditRow(null)

    return updatedRow
  }

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel)
  }

  const columns: GridColDef[] = [
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      editable: true,
      preProcessEditCellProps: params => {
        setCurrentEditRow((prev: any) => ({ ...prev, role: params.props.value ?? '' }))

        return { ...params.props }
      }
    },
    {
      field: 'can_refresh',
      headerName: 'Can Refresh Datasets',
      width: 210,
      editable: true,
      type: 'boolean'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 140,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key={id}
              icon={<SaveIcon />}
              label='Save'
              sx={{
                color: 'primary.main'
              }}
              onClick={handleSaveClick(id)}
              disabled={!canRowBeUpdated}
            />,
            <GridActionsCellItem
              key={id}
              icon={<CancelIcon />}
              label='Cancel'
              className='textPrimary'
              onClick={handleCancelClick(id)}
              color='inherit'
            />
          ]
        }

        return [
          <GridActionsCellItem
            key={id}
            icon={<EditIcon />}
            label='Edit'
            className='textPrimary'
            onClick={handleEditClick(id)}
            color='inherit'
          />,
          <GridActionsCellItem
            key={id}
            icon={<DeleteIcon />}
            label='Delete'
            onClick={handleDeleteClick(id)}
            color='inherit'
          />
        ]
      }
    }
  ]

  if (!allRolesData) return null

  return (
    <Box
      sx={{
        height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary'
        },
        '& .textPrimary': {
          color: 'text.primary'
        }
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        filterModel={filterModel}
        onFilterModelChange={model => setFilterModel(model)}
        editMode='row'
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        hideFooterPagination={true}
        getRowHeight={() => null}
        slots={{
          toolbar: EditToolbar as any
        }}
        slotProps={{
          toolbar: { setRows, rowModesModel, setRowModesModel, rows, filterModel, setCurrentEditRow } as any
        }}
      />
      <WarningModal open={warningModalOpen} onClose={() => setWarningModalOpen(false)}>
        <Typography>The row could not be updated. A Role with same name already exists.</Typography>
      </WarningModal>
    </Box>
  )
}

export default RolesGrid
