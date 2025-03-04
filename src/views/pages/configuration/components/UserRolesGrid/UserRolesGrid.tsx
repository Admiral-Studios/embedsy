import React, { useState, useContext, useEffect, useMemo } from 'react'
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

import { useAuth } from 'src/hooks/useAuth'

import axios from 'axios'
import { RolesContext } from 'src/context/RolesContext'
import EditToolbar from './EditToolbar/EditToolbar'
import ConfirmDeleteUserRoleModal from './ConfirmDeleteUserRoleModal'
import WarningModal from '../shared/WarningModal'
import { Typography } from '@mui/material'
import { PermanentRoles } from 'src/context/types'

export type UserRoles = {
  id: number
  email: string
  role: string
}

export type GridRowUserRoles = {
  id: number
  email: string
  role: string
  role_id: number
}

export type Role = {
  id: number
  role: string
}

const UserRolesGrid = () => {
  const { user, isSuperAdmin } = useAuth()

  const { userRolesRows: rows, userRoles, setUserRolesRows: setRows, rolesRows } = useContext(RolesContext)

  const [isDeleteUserRoleModalOpen, setDeleteUserRoleModalOpen] = useState(false)
  const [userRoleToDelete, setUserRoleToDelete] = useState<UserRoles | null>(null)
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})
  const [warningModalOpen, setWarningModalOpen] = useState(false)
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [currentEditRow, setCurrentEditRow] = useState<GridValidRowModel | null>(null)
  const [canRowBeUpdated, setCanRowBeUpdated] = useState(false)

  useEffect(() => {
    if (currentEditRow?.role && currentEditRow?.email) {
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
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })
    const editedRow = rows.find(row => row.id === id)
    if (editedRow) {
      setCurrentEditRow({
        role: editedRow.role
      })
    }
  }

  const handleSaveClick = (id: GridRowId) => async () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })
  }

  const isUserRoles = (obj: any): obj is UserRoles => {
    return obj && typeof obj.id === 'number' && typeof obj.email === 'string' && typeof obj.role === 'string'
  }

  const handleDeleteClick = (id: GridRowId) => {
    const userRole = rows.find(row => row.id === id)
    if (userRole && isUserRoles(userRole)) {
      setUserRoleToDelete(userRole)
      setDeleteUserRoleModalOpen(true)
    }
  }

  const handleDelete = async (id: GridRowId) => {
    try {
      await axios.post(`/api/db_transactions/user_roles/delete`, { id: id })
      setRows(rows.filter(row => row.id !== id))
    } catch (error) {}
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

  const updateRowsOnBulkInsert = async (insertedRows: GridRowUserRoles[]) => {
    setRows(prev => [...prev, ...insertedRows] as const)
  }

  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false }
    const { email, role, id } = newRow

    const roleId = (rolesRows as any).find((item: Role) => item.role === role).id
    const currentRowById = (rows as any).find((item: UserRoles) => item.id === id && !newRow.isNew)

    const duplicateRow = (rows as any).find((item: UserRoles) => item.email === email && item.id !== id)

    if (duplicateRow) {
      setWarningModalOpen(true)
      setRowModesModel({ ...rowModesModel, [newRow.id]: { mode: GridRowModes.Edit } })

      return
    }

    if (currentRowById) {
      try {
        await axios.patch(`/api/db_transactions/user_roles/update`, { email: email, roleId: roleId, id: id })
        setRows(rows.map(row => (row.id === newRow.id ? { ...updatedRow, role_id: roleId } : row)))
      } catch (error) {}
    } else {
      try {
        await axios.post(`/api/db_transactions/user_roles/insert`, { email: email, roleId: roleId })

        setRows(rows.map(row => (row.id === newRow.id ? { ...updatedRow, role_id: roleId } : row)))
      } catch (error) {}
    }

    setCurrentEditRow(null)

    return updatedRow
  }

  const handleRowModesModelChange: (newRowModesModel: GridRowModesModel) => void = newRowModesModel => {
    setRowModesModel(newRowModesModel)
  }

  const rolesOptions = useMemo(() => {
    if (rolesRows?.length) {
      const options = (rolesRows as any)
        .map((item: Role) => item.role)
        .filter((role: string) => {
          if (role === PermanentRoles.super_admin) {
            return isSuperAdmin
          }

          return true
        })

      return options
    }

    return ''
  }, [rolesRows, isSuperAdmin])

  const columns: GridColDef[] = [
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      editable: true,
      type: 'singleSelect',
      valueOptions: rolesOptions,
      preProcessEditCellProps: params => {
        setCurrentEditRow((prev: any) => ({ ...prev, role: params.props.value ?? '' }))

        return { ...params.props }
      }
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 180,
      editable: true,
      preProcessEditCellProps: params => {
        setCurrentEditRow((prev: any) => ({ ...prev, email: params.props.value ?? '' }))

        return { ...params.props }
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 140,
      cellClassName: 'actions',
      getActions: ({ id, row }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit
        const isCurrentUserRow = row.email === user?.email
        const isRowUserSuperAdmin = row.role === PermanentRoles.super_admin

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

        if (isCurrentUserRow || (isRowUserSuperAdmin && !isSuperAdmin)) {
          return []
        } else {
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
              onClick={() => handleDeleteClick(id)}
              color='inherit'
            />
          ]
        }
      }
    }
  ]

  if (!userRoles) return null

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
        isCellEditable={params => params.row.email !== user?.email}
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
          toolbar: {
            setRows,
            rowModesModel,
            setRowModesModel,
            rows,
            updateLocalListOnSuccess: updateRowsOnBulkInsert,
            filterModel,
            setCurrentEditRow
          } as any
        }}
      />
      <WarningModal open={warningModalOpen} onClose={() => setWarningModalOpen(false)}>
        <Typography>
          The row could not be updated. In the current version of the app, a user can only be assigned to one role
        </Typography>
      </WarningModal>
      {userRoleToDelete && (
        <ConfirmDeleteUserRoleModal
          open={isDeleteUserRoleModalOpen}
          userRoleToDelete={userRoleToDelete}
          handleClose={() => {
            setDeleteUserRoleModalOpen(false)
            setUserRoleToDelete(null)
          }}
          handleDelete={(id: GridRowId) => handleDelete(id)}
        />
      )}
    </Box>
  )
}

export default UserRolesGrid
