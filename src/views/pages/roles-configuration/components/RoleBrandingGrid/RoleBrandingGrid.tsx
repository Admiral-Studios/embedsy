import React, { useState, useContext } from 'react'
import Box from '@mui/material/Box'
import EditIcon from '@mui/icons-material/Edit'
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
  GridValidRowModel,
  GridFilterModel,
  GridRenderCellParams
} from '@mui/x-data-grid'
import { Menu, MenuItem, CircularProgress, Tooltip, IconButton } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useAuth } from 'src/hooks/useAuth'
import axios from 'axios'
import MediaAndFilesModal from 'src/components/shared/MediaAndFilesModal'
import Icon from 'src/@core/components/icon'
import EditToolbar from './EditToolbar/EditToolbar'
import truncateFileName from 'src/utils/truncateFileName'
import { RolesBrandingContext } from 'src/context/RolesBrandingContext'

type CustomGridRowModel = GridRowModel & {
  isNew?: boolean
}

const LoadingBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100px',
  height: '50px'
}))

const ImageContainer = styled('div')({
  width: '50px',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden'
})

const MenuItemWithBackground = styled(MenuItem)(({ theme }) => ({
  backgroundColor: theme.palette.customColors.brandingGridBg
}))

const Thumbnail = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain'
})

const ColorSquare = styled('div')<{ bgColor: string }>(({ bgColor }) => ({
  width: '18px',
  height: '18px',
  marginRight: '10px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  backgroundColor: bgColor
}))

const EditNumberInput = styled('input')(({ theme }) => ({
  width: '100px',
  border: '0px',
  color: theme.palette.text.primary,
  fontWeight: 600,
  backgroundColor: theme.palette.customColors.brandingGridBg,
  '&:focus, &:active': {
    border: '0px !important',
    backgroundColor: theme.palette.customColors.brandingGridBg
  }
}))

const EditColorInput = styled('input')(({ theme }) => ({
  width: '60%',
  border: '0px',
  color: theme.palette.text.primary,
  fontWeight: 600,
  backgroundColor: theme.palette.customColors.brandingGridBg,
  '&:focus, &:active': {
    border: '0px !important',
    backgroundColor: theme.palette.customColors.brandingGridBg
  }
}))

const RoleBrandingGrid = () => {
  const { user } = useAuth()
  const { rolesBrandingRows: rows, setRolesBrandingRows: setRows } = useContext(RolesBrandingContext)
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [currentEditRow, setCurrentEditRow] = useState<GridValidRowModel | null>(null)
  const [originalRow, setOriginalRow] = useState<CustomGridRowModel | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [fileMenuAnchorEl, setFileMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [imageList, setImageList] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [currentImageTarget, setCurrentImageTarget] = useState<string | null>(null)
  const [currentFileTarget, setCurrentFileTarget] = useState<string | null>(null)
  const [mediaAndFilesUploadModalOpen, setMediaAndFilesUploadModalOpen] = useState(false)
  const open = Boolean(anchorEl)
  const fileMenuOpen = Boolean(fileMenuAnchorEl)

  const isValidHexColor = (color: string) => {
    return /^#[0-9A-F]{6}$/i.test(color)
  }

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleEditClick = (id: GridRowId) => async () => {
    const editedRow = rows.find(row => row.id === id)
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })
    if (editedRow) {
      setOriginalRow(editedRow)
      setCurrentEditRow({
        id: editedRow.id,
        role_id: editedRow.role_id,
        overwrite: editedRow.overwrite,
        main_logo: editedRow.main_logo,
        main_logo_on_dark: editedRow.main_logo_on_dark,
        favicon: editedRow.favicon,
        favicon_on_dark: editedRow.favicon_on_dark,
        main_logo_width: editedRow.main_logo_width,
        favicon_width: editedRow.favicon_width,
        main_color: editedRow.main_color,
        main_color_on_dark: editedRow.main_color_on_dark,
        loading_spinner: editedRow.loading_spinner,
        loading_spinner_on_dark: editedRow.loading_spinner_on_dark,
        loading_spinner_width: editedRow.loading_spinner_width,
        powerbi_light_theme: editedRow.powerbi_light_theme,
        powerbi_dark_theme: editedRow.powerbi_dark_theme,
        login_page_image: editedRow.login_page_image,
        registration_page_image: editedRow.registration_page_image
      })
    }
  }

  const handleSaveClick = (id: GridRowId) => async () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })
  }

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true }
    })

    if (originalRow) {
      setRows(rows.map(row => (row.id === id ? originalRow : row)))
    }

    setCurrentEditRow(null)
    setOriginalRow(null)
  }

  const validateWidth = (value: number, min: number, max: number) => {
    if (value < min) return min
    if (value > max) return max

    return value
  }

  const processRowUpdate = async (newRow: CustomGridRowModel) => {
    const rowState = rows.find(row => row.id === newRow.id) as CustomGridRowModel
    const updatedRow = {
      ...newRow,
      main_logo: rowState.main_logo,
      main_logo_on_dark: rowState.main_logo_on_dark,
      favicon: rowState.favicon,
      favicon_on_dark: rowState.favicon_on_dark,
      loading_spinner: rowState.loading_spinner,
      loading_spinner_on_dark: rowState.loading_spinner_on_dark,
      powerbi_light_theme: rowState.powerbi_light_theme,
      powerbi_dark_theme: rowState.powerbi_dark_theme,
      login_page_image: rowState.login_page_image,
      registration_page_image: rowState.registration_page_image,
      main_logo_width: validateWidth(newRow.main_logo_width, 10, 150),
      favicon_width: validateWidth(newRow.favicon_width, 10, 50),
      loading_spinner_width: validateWidth(newRow.loading_spinner_width, 20, 300),
      isNew: false
    } as CustomGridRowModel

    try {
      await axios.patch(`/api/db_transactions/role_branding/update`, {
        role_id: updatedRow.role_id,
        overwrite: updatedRow.overwrite,
        main_logo: updatedRow.main_logo,
        main_logo_on_dark: updatedRow.main_logo_on_dark,
        favicon: updatedRow.favicon,
        favicon_on_dark: updatedRow.favicon_on_dark,
        main_logo_width: updatedRow.main_logo_width,
        favicon_width: updatedRow.favicon_width,
        main_color: updatedRow.main_color,
        main_color_on_dark: updatedRow.main_color_on_dark,
        loading_spinner: updatedRow.loading_spinner,
        loading_spinner_on_dark: updatedRow.loading_spinner_on_dark,
        loading_spinner_width: updatedRow.loading_spinner_width,
        powerbi_light_theme: updatedRow.powerbi_light_theme,
        powerbi_dark_theme: updatedRow.powerbi_dark_theme,
        login_page_image: updatedRow.login_page_image,
        registration_page_image: updatedRow.registration_page_image
      })
      setRows(rows.map(row => (row.id === newRow.id ? updatedRow : row)))
    } catch (error) {
      console.error(error)
    }

    setCurrentEditRow(null)
    setOriginalRow(null)

    return updatedRow
  }

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel)
  }

  const handleEditImageClick = async (event: React.MouseEvent<HTMLElement>, field: string, folder: string) => {
    setCurrentImageTarget(field)
    setAnchorEl(event.currentTarget)
    setLoading(true)

    try {
      const response = await axios.get(`/api/blob/list?folder=${folder}`)
      setImageList(response.data.urls)
    } catch (error) {
      console.error('Error fetching image list:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditFileClick = async (event: React.MouseEvent<HTMLElement>, field: string) => {
    setCurrentFileTarget(field)
    setFileMenuAnchorEl(event.currentTarget)
    setLoading(true)

    try {
      const response = await axios.get(`/api/blob/list?folder=powerbi`)
      setImageList(response.data.urls)
    } catch (error) {
      console.error('Error fetching file list:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (imageUrl: string) => {
    if (!currentImageTarget || !currentEditRow) return

    const updatedRow = { ...currentEditRow, [currentImageTarget]: imageUrl }
    setRows(rows.map(row => (row.id === currentEditRow.id ? { ...row, ...updatedRow } : row)))
    setCurrentEditRow({ ...updatedRow })

    setAnchorEl(null)
    setCurrentImageTarget(null)
  }

  const handleFileSelect = (fileUrl: string) => {
    if (!currentFileTarget || !currentEditRow) return

    const updatedRow = { ...currentEditRow, [currentFileTarget]: fileUrl }
    setRows(rows.map(row => (row.id === currentEditRow.id ? { ...row, ...updatedRow } : row)))
    setCurrentEditRow({ ...updatedRow })

    setFileMenuAnchorEl(null)
    setCurrentFileTarget(null)
  }

  const handleFileReset = (currentFileTarget: string, params: any) => {
    if (!currentEditRow || !currentFileTarget) return

    const updatedRow = { ...currentEditRow, [currentFileTarget]: null }

    setRows(rows.map(row => (row.id === currentEditRow.id ? { ...row, ...updatedRow } : row)))

    setCurrentEditRow({ ...updatedRow })

    if (params.api) {
      params.api.setEditCellValue({ id: currentEditRow.id, field: currentFileTarget, value: null })
    }
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setCurrentImageTarget(null)
  }

  const handleCloseFileMenu = () => {
    setFileMenuAnchorEl(null)
    setCurrentFileTarget(null)
  }

  const renderEditButton = (field: string, params: any, folder: string) => {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {(params.formattedValue || params.value) && (
            <img
              src={params.formattedValue || params.value}
              alt={field}
              style={{ maxHeight: '42px', maxWidth: '100px' }}
            />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <IconButton onClick={event => handleEditImageClick(event, field, folder)}>
            <Icon icon='tabler:select' fontSize={20} />
          </IconButton>
          {(params.formattedValue || params.value) && (
            <IconButton onClick={() => handleFileReset(field, params)}>
              <Icon icon='tabler:refresh' fontSize={20} />
            </IconButton>
          )}
        </div>
      </div>
    )
  }

  const renderEditFileButton = (field: string, params: any) => {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          position: 'relative'
        }}
      >
        <div>
          {(params.formattedValue || params.value) && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              onClick={() => window.open(params.formattedValue || params.value, '_blank')}
            >
              <Icon icon='tabler:file' fontSize={20} />
              <span>{getFileName(params.formattedValue || params.value)}</span>
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <IconButton onClick={event => handleEditFileClick(event, field)}>
            <Icon icon='tabler:select' fontSize={20} />
          </IconButton>
          {(params.formattedValue || params.value) && (
            <IconButton onClick={() => handleFileReset(field, params)}>
              <Icon icon='tabler:refresh' fontSize={20} />
            </IconButton>
          )}
        </div>
      </div>
    )
  }

  const handleInputChange = (
    params: GridRenderCellParams,
    e: React.ChangeEvent<HTMLInputElement>,
    minNumber: number,
    maxNumber: number
  ) => {
    const value = validateWidth(Number(e.target.value), minNumber, maxNumber)
    params.api.setEditCellValue({ id: params.id, field: params.field, value })
  }

  const handleColorInputChange = (params: GridRenderCellParams, e: React.ChangeEvent<HTMLInputElement>) => {
    const colorValue = e.target.value
    const updatedColor = isValidHexColor(colorValue) ? colorValue : ''

    params.api.setEditCellValue({ id: params.id, field: params.field, value: updatedColor })
  }

  const columns: GridColDef[] = [
    {
      field: 'role',
      headerName: 'Role',
      width: 130,
      renderCell: params => {
        return params.value === 'admin' ? 'Default' : params.value
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Edit',
      width: 80,
      cellClassName: 'edit row-cell',
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
            <GridActionsCellItem
              key={id}
              icon={<EditIcon />}
              label='Edit'
              className='textPrimary'
              onClick={handleEditClick(id)}
              color='inherit'
            />
          ]
        }
      }
    },
    {
      field: 'overwrite',
      headerName: 'Overwrite',
      width: 120,
      editable: true,
      type: 'boolean'
    },
    {
      field: 'main_logo',
      headerName: 'Main Logo',
      width: 200,
      editable: true,
      renderCell: params =>
        params.value && (
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <img src={params.value} alt='Main Logo' style={{ maxWidth: '100px', maxHeight: '42px' }} />
          </div>
        ),
      renderEditCell: params => renderEditButton('main_logo', params, 'logos')
    },
    {
      field: 'main_logo_on_dark',
      headerName: 'Main Logo On Dark',
      width: 200,
      editable: true,
      renderCell: params =>
        params.value && (
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <img src={params.value} alt='Main Logo Dark' style={{ maxWidth: '100px', maxHeight: '42px' }} />
          </div>
        ),
      renderEditCell: params => renderEditButton('main_logo_on_dark', params, 'logos')
    },
    {
      field: 'main_logo_width',
      headerName: 'Main Logo Width',
      width: 170,
      editable: true,
      type: 'number',
      renderEditCell: params => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <EditNumberInput
            type='number'
            defaultValue={params.value}
            onChange={e => handleInputChange(params, e, 10, 150)}
          />
          <Tooltip title='Minimum width of a logo should be 10, while maximum width should be 150'>
            <IconButton>
              <Icon icon='tabler:info-circle' fontSize={20} />
            </IconButton>
          </Tooltip>
        </div>
      )
    },
    {
      field: 'favicon',
      headerName: 'Favicon',
      width: 200,
      editable: true,
      renderCell: params =>
        params.value && (
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <img src={params.value} alt='Favicon' style={{ maxWidth: '100px', maxHeight: '42px' }} />
          </div>
        ),
      renderEditCell: params => renderEditButton('favicon', params, 'favicons')
    },
    {
      field: 'favicon_on_dark',
      headerName: 'Favicon On Dark',
      width: 200,
      editable: true,
      renderCell: params =>
        params.value && (
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <img src={params.value} alt='Favicon Dark' style={{ maxWidth: '100px', maxHeight: '42px' }} />
          </div>
        ),
      renderEditCell: params => renderEditButton('favicon_on_dark', params, 'favicons')
    },
    {
      field: 'favicon_width',
      headerName: 'Favicon Width',
      width: 170,
      editable: true,
      type: 'number',
      renderEditCell: params => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <EditNumberInput
            type='number'
            defaultValue={params.value}
            onChange={e => handleInputChange(params, e, 10, 50)}
          />
          <Tooltip title='Minimum width of a favicon should be 10, while maximum width should be 50'>
            <IconButton>
              <Icon icon='tabler:info-circle' fontSize={20} />
            </IconButton>
          </Tooltip>
        </div>
      )
    },
    {
      field: 'main_color',
      headerName: 'Main Color',
      width: 150,
      editable: true,
      renderCell: params => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ColorSquare bgColor={isValidHexColor(params.value) ? params.value : 'transparent'} />
          {params.value}
        </div>
      ),
      renderEditCell: params => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ColorSquare bgColor={isValidHexColor(params.value) ? params.value : 'transparent'} />
          <EditColorInput type='text' defaultValue={params.value} onChange={e => handleColorInputChange(params, e)} />
        </div>
      )
    },
    {
      field: 'main_color_on_dark',
      headerName: 'Main Color On Dark',
      width: 190,
      editable: true,
      renderCell: params => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ColorSquare bgColor={isValidHexColor(params.value) ? params.value : 'transparent'} />
          {params.value}
        </div>
      ),
      renderEditCell: params => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ColorSquare bgColor={isValidHexColor(params.value) ? params.value : 'transparent'} />
          <EditColorInput type='text' defaultValue={params.value} onChange={e => handleColorInputChange(params, e)} />
        </div>
      )
    },
    {
      field: 'loading_spinner',
      headerName: 'Loading Spinner',
      width: 200,
      editable: true,
      renderCell: params =>
        params.value && (
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <img src={params.value} alt='Loading Spinner' style={{ maxWidth: '100px', maxHeight: '42px' }} />
          </div>
        ),
      renderEditCell: params => renderEditButton('loading_spinner', params, 'loading_spinners')
    },
    {
      field: 'loading_spinner_on_dark',
      headerName: 'Loading Spinner On Dark',
      width: 250,
      editable: true,
      renderCell: params =>
        params.value && (
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <img src={params.value} alt='Loading Spinner Dark' style={{ maxWidth: '100px', maxHeight: '42px' }} />
          </div>
        ),
      renderEditCell: params => renderEditButton('loading_spinner_on_dark', params, 'loading_spinners')
    },
    {
      field: 'loading_spinner_width',
      headerName: 'Loading Spinner Width',
      width: 220,
      editable: true,
      type: 'number',
      renderEditCell: params => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <EditNumberInput
            type='number'
            defaultValue={params.value}
            onChange={e => handleInputChange(params, e, 20, 300)}
          />
          <Tooltip title='Minimum width of a loading spinner should be 20, while maximum width should be 300'>
            <IconButton>
              <Icon icon='tabler:info-circle' fontSize={20} />
            </IconButton>
          </Tooltip>
        </div>
      )
    },
    {
      field: 'powerbi_light_theme',
      headerName: 'Power BI Light Theme',
      width: 200,
      editable: true,
      renderCell: params =>
        params.value && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            onClick={() => window.open(params.value, '_blank')}
          >
            <Icon icon='tabler:file' fontSize={20} />
            <span>{getFileName(params.formattedValue || params.value)}</span>
          </div>
        ),
      renderEditCell: params => renderEditFileButton('powerbi_light_theme', params)
    },
    {
      field: 'powerbi_dark_theme',
      headerName: 'Power BI Dark Theme',
      width: 200,
      editable: true,
      renderCell: params =>
        params.value && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            onClick={() => window.open(params.value, '_blank')}
          >
            <Icon icon='tabler:file' fontSize={20} />
            <span>{getFileName(params.formattedValue || params.value)}</span>
          </div>
        ),
      renderEditCell: params => renderEditFileButton('powerbi_dark_theme', params)
    },
    {
      field: 'login_page_image',
      headerName: 'Login Page Image',
      width: 200,
      editable: true,
      renderCell: params => {
        if (params.row.role === 'admin') {
          return (
            params.value && (
              <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <img src={params.value} alt='Login Page Image' style={{ maxWidth: '100px', maxHeight: '42px' }} />
              </div>
            )
          )
        }

        return (
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
          >
            <Icon icon='tabler:x' />
          </div>
        )
      },
      renderEditCell: params => {
        if (params.row.role === 'admin') {
          return renderEditButton('login_page_image', params, 'landing_page_images')
        }

        return (
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
          >
            <Icon icon='tabler:x' />
          </div>
        )
      }
    },
    {
      field: 'registration_page_image',
      headerName: 'Registration Page Image',
      width: 200,
      editable: true,
      renderCell: params => {
        if (params.row.role === 'admin') {
          return (
            params.value && (
              <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <img src={params.value} alt='Register Page Image' style={{ maxWidth: '100px', maxHeight: '42px' }} />
              </div>
            )
          )
        }

        return (
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
          >
            <Icon icon='tabler:x' />
          </div>
        )
      },
      renderEditCell: params => {
        if (params.row.role === 'admin') {
          return renderEditButton('registration_page_image', params, 'landing_page_images')
        }

        return (
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
          >
            <Icon icon='tabler:x' />
          </div>
        )
      }
    }
  ]

  const onCloseMediaModal = () => {
    setMediaAndFilesUploadModalOpen(false)
    setCurrentImageTarget(null)
  }

  const getFileName = (url: string) => {
    const nameWithExtension = url.split('/').pop() || ''
    const fileName = nameWithExtension.split('-').slice(0, -1).join('-')

    return truncateFileName(fileName, 12)
  }

  return (
    <>
      <MediaAndFilesModal open={mediaAndFilesUploadModalOpen} handleClose={onCloseMediaModal} />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        PaperProps={{
          style: {
            maxHeight: 200,
            overflowY: 'auto'
          }
        }}
      >
        {loading ? (
          <LoadingBox>
            <CircularProgress size={40} />
          </LoadingBox>
        ) : imageList.length === 0 ? (
          <MenuItem disabled>No media available.</MenuItem>
        ) : (
          imageList.map((imageUrl, index) => (
            <MenuItemWithBackground key={index} onClick={() => handleImageSelect(imageUrl)}>
              <ImageContainer>
                <Thumbnail src={imageUrl} alt='Thumbnail' />
              </ImageContainer>
            </MenuItemWithBackground>
          ))
        )}
      </Menu>
      <Menu
        anchorEl={fileMenuAnchorEl}
        open={fileMenuOpen}
        onClose={handleCloseFileMenu}
        PaperProps={{
          style: {
            maxHeight: 200,
            overflowY: 'auto'
          }
        }}
      >
        {loading ? (
          <LoadingBox>
            <CircularProgress size={40} />
          </LoadingBox>
        ) : imageList.length === 0 ? (
          <MenuItem disabled>No files available.</MenuItem>
        ) : (
          imageList.map((fileUrl, index) => (
            <MenuItem key={index} onClick={() => handleFileSelect(fileUrl)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon icon='tabler:file' fontSize={20} />
                <span>{getFileName(fileUrl)}</span>
              </div>
            </MenuItem>
          ))
        )}
      </Menu>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          '& .actions': {
            color: 'text.secondary'
          },
          '& .textPrimary': {
            color: 'text.primary'
          },
          '& .header-cell': theme => ({
            backgroundColor: theme.palette.customColors.brandingGridBg
          }),
          '& .row-cell': theme => ({
            backgroundColor: `${theme.palette.customColors.brandingGridBg} !important`
          })
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
          hideFooterSelectedRowCount={true}
          getRowClassName={() => 'row-cell'}
          getCellClassName={() => 'row-cell'}
          onCellDoubleClick={(_, event) => event.stopPropagation()}
          disableColumnMenu
          slots={{
            toolbar: EditToolbar as any
          }}
          slotProps={{
            toolbar: { setMediaAndFilesUploadModalOpen } as any
          }}
        />
      </Box>
    </>
  )
}

export default RoleBrandingGrid
