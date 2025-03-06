import React, { useState, useContext, useEffect, useCallback } from 'react'
import moment from 'moment'
import Box from '@mui/material/Box'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Close'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RefreshIcon from '@mui/icons-material/Refresh'
import WarningAmber from '@mui/icons-material/WarningAmber'

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
  GridValidRowModel,
  GridFilterModel,
  GridRenderCellParams
} from '@mui/x-data-grid'

import { useAuth } from 'src/hooks/useAuth'
import { RolesContext } from 'src/context/RolesContext'
import { PowerBIDatasetType } from 'src/types/apps/powerbiTypes'

import axios from 'axios'
import EditToolbar from './EditToolbar/EditToolbar'
import RowLevelWarningModal from './RowLevelWarningModal'
import WarningModal from '../shared/WarningModal'
import { Tooltip, Typography } from '@mui/material'
import checkForRowPresence from 'src/utils/checkForRowPresence'
import uppercaseFirstLetter from 'src/utils/uppercaseFirstLetter'

export type WorkspaceWithReportModel = {
  report?: string
  workspace?: string
}

type CustomGridRowModel = GridRowModel &
  WorkspaceWithReportModel & {
    isNew?: boolean
  }

export type RoleReport = {
  id: number
  roleId: number
  role: string
  workspaceId: string
  reportId: string
  workspace: string
  report: string
  datasetId: string
}

type Role = {
  id: number
  role: string
}

const RoleReportsGrid = () => {
  const { user, hasAdminPrivileges, canRefresh } = useAuth()
  const { roleReportsRows: rows, setRoleReportsRows: setRows, roleReports, rolesRows } = useContext(RolesContext)
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})
  const [reportsByWorkspace, setReportsByWorkspace] = useState<RoleReport[] | any>([])
  const [datasetsByWorkspace, setDatasetsByWorkspace] = useState<PowerBIDatasetType[] | any>([])
  const [gridWorkspaces, setGridWorkspaces] = useState<RoleReport[] | any>([])
  const [rowLevelWarningModalOpen, setRowLevelWarningModalOpen] = useState(false)
  const [rowLevelWarningReportAndWorkspace, setRowLevelWarningReportAndWorkspace] = useState<WorkspaceWithReportModel>({
    report: '',
    workspace: ''
  })
  const [warningModalOpen, setWarningModalOpen] = useState(false)
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [currentEditRow, setCurrentEditRow] = useState<GridValidRowModel | null>(null)
  const [canRowBeUpdated, setCanRowBeUpdated] = useState(false)

  useEffect(() => {
    if (currentEditRow?.role && currentEditRow?.workspace && currentEditRow?.report) {
      setCanRowBeUpdated(true)
    } else {
      setCanRowBeUpdated(false)
    }
  }, [currentEditRow])

  const fetchWorkspaces = useCallback(async () => {
    if (hasAdminPrivileges && gridWorkspaces.length === 0) {
      try {
        const response = await axios.get('/api/powerbi/workspaces')
        setGridWorkspaces(response.data)
      } catch (error) {
        console.error('Error fetching workspaces:', error)
      }
    }
  }, [hasAdminPrivileges, gridWorkspaces.length])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    const checkUnknownRefreshStatus = () => {
      const uniqueWorkspaceDatasetPairs = new Set()
      rows.forEach((row: any) => {
        if (row.last_refresh_status === 'unknown') {
          const key = `${row.workspace_id}-${row.dataset_id}`
          if (!uniqueWorkspaceDatasetPairs.has(key)) {
            uniqueWorkspaceDatasetPairs.add(key)
            handleCheckRefreshStatus(row.workspace_id, row.dataset_id)
          }
        }
      })
    }

    checkUnknownRefreshStatus()

    const intervalId = setInterval(checkUnknownRefreshStatus, 30000)

    return () => clearInterval(intervalId)
  }, [rows])

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleEditClick = (id: GridRowId) => async () => {
    const editedRow = rows.find(row => row.id === id)
    handleGetDatasets(editedRow?.workspace_id)
    handleGetReports(editedRow?.workspace_id)
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })
    if (editedRow) {
      setCurrentEditRow({
        role: editedRow.role,
        workspace: editedRow.workspace,
        report: editedRow.report,
        row_level_role: editedRow.row_level_role,
        preview_pages: editedRow.preview_pages
      })
    }
  }

  const handleRefreshClick = (lastRefreshStatus: string | null, workspaceId: string, datasetId: string) => async () => {
    if (lastRefreshStatus === 'unknown') {
      await handleCancelRefresh(workspaceId, datasetId)
    } else {
      await handleBeginRefresh(workspaceId, datasetId)
    }
  }

  const handleBeginRefresh = async (workspaceId: string, datasetId: string) => {
    try {
      const response = await axios.post(`/api/powerbi/refresh/begin`, { workspaceId, datasetId })
      if (response.data.status && response.data.last_refresh_date) {
        setRows(
          rows.map(row =>
            row.dataset_id === datasetId
              ? {
                  ...row,
                  last_refresh_status: response.data.status,
                  last_refresh_date: response.data.last_refresh_date
                }
              : row
          )
        )
      }
    } catch (error) {
      console.error('Error refreshing dataset:', error)
    }
  }

  const handleCheckRefreshStatus = async (workspaceId: string, datasetId: string) => {
    try {
      const response = await axios.get('/api/powerbi/refresh/check-status', {
        params: { workspaceId, datasetId }
      })
      if (response.data.status && response.data.last_refresh_date && response.data.status !== 'unknown') {
        setRows((prevRows: any) =>
          prevRows.map((row: any) =>
            row.dataset_id === datasetId
              ? {
                  ...row,
                  last_refresh_status: response.data.status,
                  last_refresh_date: response.data.last_refresh_date
                }
              : row
          )
        )
      }
    } catch (error) {
      console.error('Error checking refresh status:', error)
    }
  }

  const handleCancelRefresh = async (workspaceId: string, datasetId: string) => {
    try {
      const response = await axios.post(`/api/powerbi/refresh/cancel`, { workspaceId, datasetId })
      if (response.data.status && response.data.last_refresh_date) {
        setRows(
          rows.map(row =>
            row.dataset_id === datasetId
              ? {
                  ...row,
                  last_refresh_status: response.data.status,
                  last_refresh_date: response.data.last_refresh_date
                }
              : row
          )
        )
      }
    } catch (error) {
      console.error('Error canceling refresh:', error)
    }
  }

  const handleGetReports = async (workspaceId: string | null) => {
    try {
      const response = await axios.post(`/api/powerbi/reports`, { workspaceId: workspaceId })
      setReportsByWorkspace(response.data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const handleGetDatasets = async (workspaceId: string | null) => {
    try {
      const response = await axios.post(`/api/powerbi/datasets`, { workspaceId: workspaceId })
      setDatasetsByWorkspace(response.data)
    } catch (error) {
      console.error('Error fetching datasets:', error)
    }
  }

  const handleSaveClick = (id: GridRowId) => async () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })
  }

  const handleDeleteClick = (id: GridRowId) => async () => {
    try {
      await axios.post(`/api/db_transactions/role_reports/delete`, { id: id })
      setRows(rows.filter(row => row.id !== id))
    } catch (error) {
      console.error('Error deleting role report:', error)
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

  const processRowUpdate = async (newRow: CustomGridRowModel) => {
    const selectedRole = rolesRows.find((role: any) => role.role === newRow.role)
    newRow.role_id = selectedRole ? selectedRole.id : null

    const selectedWorkspace = gridWorkspaces.find((workspace: any) => workspace.name === newRow.workspace)
    newRow.workspace_id = selectedWorkspace ? selectedWorkspace.id : null

    const selectedReport = reportsByWorkspace.find((report: any) => report.name === newRow.report)
    newRow.report_id = selectedReport ? selectedReport.id : null
    newRow.dataset_id = selectedReport ? selectedReport.datasetId : null

    const selectedDataset = datasetsByWorkspace.find((dataset: any) => dataset.id === newRow.dataset_id)
    newRow.is_effective_identity_required = selectedDataset && selectedDataset.isEffectiveIdentityRequired ? 1 : 0

    const updatedRow = { ...newRow, isNew: false }
    const roleReport = (rows as any).find((item: RoleReport) => item.id === newRow.id && !newRow.isNew)

    const rowAlreadyExists = checkForRowPresence(
      { ...newRow, row_level_role: newRow.row_level_role ?? '', preview_pages: newRow.preview_pages ?? undefined },
      rows as GridRowModesModel[]
    )

    if (rowAlreadyExists) {
      setWarningModalOpen(true)
      setRowModesModel({ ...rowModesModel, [newRow.id]: { mode: GridRowModes.Edit } })

      return
    }

    if (newRow.is_effective_identity_required && !newRow.row_level_role) {
      setRowLevelWarningReportAndWorkspace({ report: updatedRow.report, workspace: updatedRow.workspace })
      setRowLevelWarningModalOpen(true)
      setRowModesModel({ ...rowModesModel, [newRow.id]: { mode: GridRowModes.Edit } })

      return
    }

    let refreshStatus: string | null = null
    let refreshDate: Date | null = null

    if (roleReport) {
      try {
        const response = await axios.patch(`/api/db_transactions/role_reports/update`, {
          id: newRow.id,
          roleId: newRow.role_id,
          workspaceId: newRow.workspace_id,
          workspace: newRow.workspace,
          reportId: newRow.report_id,
          report: newRow.report,
          datasetId: newRow.dataset_id,
          isEffectiveIdentityRequired: newRow.is_effective_identity_required,
          rowLevelRole: newRow.row_level_role,
          previewPages: newRow.preview_pages
        })

        refreshStatus = response.data.last_refresh_status
        refreshDate = new Date(response.data.last_refresh_date)

        setRows(
          rows.map(row =>
            row.dataset_id === newRow.dataset_id
              ? { ...row, last_refresh_status: refreshStatus, last_refresh_date: refreshDate }
              : row.id === newRow.id
              ? { ...updatedRow, last_refresh_status: refreshStatus, last_refresh_date: refreshDate }
              : row
          )
        )
      } catch (error) {
        console.error('Error updating role report:', error)
      }
    } else {
      try {
        const response = await axios.post(`/api/db_transactions/role_reports/insert`, {
          roleId: newRow.role_id,
          workspaceId: newRow.workspace_id,
          workspace: newRow.workspace,
          reportId: newRow.report_id,
          report: newRow.report,
          datasetId: newRow.dataset_id,
          isEffectiveIdentityRequired: newRow.is_effective_identity_required,
          rowLevelRole: newRow.row_level_role,
          previewPages: newRow.preview_pages
        })

        refreshStatus = response.data.last_refresh_status
        refreshDate = new Date(response.data.last_refresh_date)

        setRows(
          rows.map(row =>
            row.dataset_id === newRow.dataset_id
              ? { ...row, last_refresh_status: refreshStatus, last_refresh_date: refreshDate }
              : row.id === newRow.id
              ? { ...updatedRow, last_refresh_status: refreshStatus, last_refresh_date: refreshDate }
              : row
          )
        )
      } catch (error) {
        console.error('Error inserting role report:', error)
      }
    }

    setCurrentEditRow(null)

    return { ...updatedRow, last_refresh_status: refreshStatus, last_refresh_date: refreshDate }
  }

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel)
  }

  const handleCloseRowLevelWarningModal = () => {
    setRowLevelWarningModalOpen(false)
    setRowLevelWarningReportAndWorkspace({ report: '', workspace: '' })
  }

  const columns: GridColDef[] = [
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 140,
      cellClassName: 'actions',
      getActions: ({ id, row }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit
        const userIsAdmin = row.email === user?.email

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

        if (userIsAdmin) {
          return []
        } else {
          return [
            ...(canRefresh || hasAdminPrivileges
              ? [
                  <GridActionsCellItem
                    key={`${id}-refresh`}
                    icon={
                      <Box
                        sx={{
                          '@keyframes spin': {
                            '0%': {
                              transform: 'rotate(0deg)'
                            },
                            '100%': {
                              transform: 'rotate(360deg)'
                            }
                          },
                          animation: row.last_refresh_status === 'unknown' ? 'spin 2s linear infinite' : 'none',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <RefreshIcon />
                      </Box>
                    }
                    label='Refresh'
                    className='textPrimary'
                    onClick={handleRefreshClick(row.last_refresh_status, row.workspace_id, row.dataset_id)}
                    color='inherit'
                  />
                ]
              : []),
            ...(hasAdminPrivileges
              ? [
                  <GridActionsCellItem
                    key={`${id}-edit`}
                    icon={<EditIcon />}
                    label='Edit'
                    className='textPrimary'
                    onClick={handleEditClick(id)}
                    color='inherit'
                  />,
                  <GridActionsCellItem
                    key={`${id}-delete`}
                    icon={<DeleteIcon />}
                    label='Delete'
                    onClick={handleDeleteClick(id)}
                    color='inherit'
                  />
                ]
              : [])
          ]
        }
      }
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      editable: true,
      type: 'singleSelect',
      valueOptions: rolesRows ? (rolesRows as any).map((item: Role) => item.role) : '',
      preProcessEditCellProps: params => {
        setCurrentEditRow((prev: any) => ({ ...prev, role: params.props.value ?? '' }))

        return { ...params.props }
      }
    },
    {
      field: 'workspace',
      headerName: 'Workspace',
      width: 180,
      editable: true,
      type: 'singleSelect',
      valueOptions: gridWorkspaces ? (gridWorkspaces as any).map((item: any) => item.name) : '',
      preProcessEditCellProps: params => {
        const selectedWorkspace = gridWorkspaces.find((workspace: any) => workspace.name === params.props.value)
        const selectedWorkspaceId = selectedWorkspace ? selectedWorkspace.id : null
        handleGetReports(selectedWorkspaceId)
        handleGetDatasets(selectedWorkspaceId)

        setCurrentEditRow((prev: any) => ({ ...prev, workspace: params.props.value ?? '' }))

        return { ...params.props }
      }
    },
    {
      field: 'report',
      headerName: 'Report',
      width: 160,
      editable: true,
      type: 'singleSelect',
      valueOptions: reportsByWorkspace ? (reportsByWorkspace as any).map((item: any) => item.name) : '',
      preProcessEditCellProps: params => {
        setCurrentEditRow((prev: any) => ({ ...prev, report: params.props.value ?? '' }))

        return { ...params.props }
      }
    },
    {
      field: 'row_level_role',
      headerName: 'Row Level Role',
      width: 200,
      editable: true,
      preProcessEditCellProps: params => {
        setCurrentEditRow((prev: any) => ({ ...prev, row_level_role: params.props.value ?? '' }))

        return { ...params.props }
      }
    },
    {
      field: 'preview_pages',
      headerName: 'Preview Pages',
      width: 160,
      editable: true,
      type: 'boolean'
    },
    {
      field: 'last_refresh_status',
      headerName: 'Last Refresh Status',
      width: 200,
      editable: false,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.row.last_refresh_status
        const displayStatus = status ? (status === 'unknown' ? 'Refreshing' : uppercaseFirstLetter(status)) : 'N/A'
        const isFailed = status === 'failed'
        const isRefreshing = status === 'unknown'
        const isSucceeded = status === 'success'

        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isFailed && (
              <Tooltip title='Refresh of dataset has failed'>
                <WarningAmber style={{ marginRight: '8px' }} />
              </Tooltip>
            )}
            {isRefreshing && (
              <Tooltip title='Dataset is currently refreshing'>
                <RefreshIcon style={{ marginRight: '8px' }} />
              </Tooltip>
            )}
            {isSucceeded && (
              <Tooltip title='Refresh of dataset was successful'>
                <CheckCircleOutlineIcon style={{ marginRight: '8px' }} />
              </Tooltip>
            )}
            {displayStatus}
          </div>
        )
      }
    },
    {
      field: 'last_refresh_date',
      headerName: 'Last Refresh Date',
      width: 200,
      editable: false,
      renderCell: params => {
        if (!params.value) return ''
        const formattedDate = moment(params.value).format('YYYY/MM/DD - HH:mm:ss')

        return <span>{formattedDate}</span>
      }
    }
  ]

  if (!roleReports) return null

  return (
    <Box
      sx={{
        height: hasAdminPrivileges ? 500 : '100vh',
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
        filterModel={filterModel}
        onFilterModelChange={model => setFilterModel(model)}
        columns={columns}
        editMode='row'
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        hideFooterPagination={true}
        getRowHeight={() => null}
        slots={{
          toolbar: hasAdminPrivileges ? (EditToolbar as any) : null
        }}
        slotProps={{
          toolbar: {
            ...({
              setRows,
              rowModesModel,
              setRowModesModel,
              rows,
              filterModel,
              setCurrentEditRow
            } as any)
          }
        }}
      />
      <RowLevelWarningModal
        open={rowLevelWarningModalOpen}
        workspaceWithReport={rowLevelWarningReportAndWorkspace}
        onClose={handleCloseRowLevelWarningModal}
      />
      <WarningModal open={warningModalOpen} onClose={() => setWarningModalOpen(false)}>
        <Typography>The row could not be updated. A Role Report with same information already exists.</Typography>
      </WarningModal>
    </Box>
  )
}

export default RoleReportsGrid
