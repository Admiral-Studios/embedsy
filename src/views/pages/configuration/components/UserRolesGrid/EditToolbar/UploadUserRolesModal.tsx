import React, { useState, useCallback, useEffect } from 'react'
import { TextField, Box, Typography, Button, Divider } from '@mui/material'
import CustomModal from '../../../../../../components/shared/CustomModal'
import axios from 'axios'
import { GridRowUserRoles } from '../UserRolesGrid'
import { styled } from '@mui/material/styles'

const UploadBoxStyled = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4)
}))

const PreviewBoxStyled = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 250,
  overflowY: 'scroll'
}))

const HeaderPreviewBoxStyled = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  position: 'sticky',
  top: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
  padding: theme.spacing(0, 2)
}))

const RowBoxStyled = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  padding: theme.spacing(3, 2)
}))

const ActionBoxStyled = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  gap: theme.spacing(2),
  display: 'flex'
}))

type Props = {
  open: boolean
  handleClose: () => void
  updateLocalListOnSuccess: (insertedRoles: GridRowUserRoles[]) => void
}

type CSVRow = {
  email: string
  role: string
}

const UploadUserRolesModal = ({ open, handleClose, updateLocalListOnSuccess }: Props) => {
  const [file, setFile] = useState<any>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [showCsvData, setShowCsvData] = useState(false)
  const [loadingUpload, setLoadingUpload] = useState(false)

  const handleFileRead = (file: any) => {
    setUploadError(null)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result?.toString()
        if (text) {
          const data = parseCSV(text)
          if (data.length > 0) {
            setCsvData(data)
            setUploadError(null)
          }
        }
      }
      reader.readAsText(file)
    }
  }

  /* eslint-disable */
  useEffect(() => {
    setShowCsvData(false)
    setCsvData([])
    setUploadError(null)
    if (file) {
      handleFileRead(file)
    }
  }, [file])
  /* eslint-enable */

  useEffect(() => {
    setFile(null)
    setUploadError(null)
    setCsvData([])
  }, [open])

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0])
  }

  const parseCSV = useCallback((text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    if (headers.length !== 2 || headers[0] !== 'email' || headers[1] !== 'role') {
      setUploadError('CSV format is incorrect. It must only contain "email" and "role" columns.')

      return []
    }
    const data = lines.slice(1).map(line => {
      const [email, role] = line.split(',')

      return { email, role }
    })

    return data
  }, [])

  const handleUpload = useCallback(async () => {
    setUploadError(null)
    try {
      setLoadingUpload(true)

      const uniqueRoleNames = [...new Set(csvData.map(row => row.role))]

      const rolesResponse = await axios.post(`/api/db_transactions/user_roles/post/get_bulk_by_name`, uniqueRoleNames)

      if (rolesResponse.data) {
        const roleMap = new Map(
          rolesResponse.data.map((role: { roleName: string; roleId: number }) => [role.roleName, role.roleId])
        )

        const updatedCsvData = csvData.map(row => ({
          ...row,
          roleId: roleMap.get(row.role)
        }))

        const userRolesModels: GridRowUserRoles[] = updatedCsvData
          .filter(row => typeof row.roleId === 'number')
          .map((row, index) => ({
            id: Date.now() + index,
            email: row.email,
            role: row.role,
            role_id: row.roleId as number
          }))

        await axios.post(`/api/db_transactions/user_roles/bulk_insert`, updatedCsvData)
        updateLocalListOnSuccess(userRolesModels)
        handleClose()
      } else {
        setUploadError('Failed to retrieve matching role IDs for role names provided.')
      }
    } catch (error: any) {
      console.error('Error uploading CSV data:', error)
      setUploadError(`Error uploading CSV data. ${error.response.data.message}`)
    } finally {
      setLoadingUpload(false)
    }
  }, [csvData, handleClose, updateLocalListOnSuccess])

  return (
    <CustomModal open={open} handleClose={handleClose} title='Upload & Assign User Roles'>
      <UploadBoxStyled>
        <TextField type='file' onChange={handleFileChange} inputProps={{ accept: '.csv' }} fullWidth />
      </UploadBoxStyled>
      {showCsvData && csvData.length > 0 && (
        <PreviewBoxStyled>
          <HeaderPreviewBoxStyled>
            <Typography sx={{ width: '50%', textAlign: 'left', fontWeight: 'bold' }}>ROLE</Typography>
            <Typography sx={{ width: '50%', textAlign: 'left', fontWeight: 'bold' }}>EMAIL</Typography>
          </HeaderPreviewBoxStyled>
          {csvData.map((row, index) => (
            <React.Fragment key={index}>
              <RowBoxStyled>
                <Typography sx={{ width: '50%', textAlign: 'left' }}>{row.role}</Typography>
                <Typography sx={{ width: '50%', textAlign: 'left' }}>{row.email}</Typography>
              </RowBoxStyled>
              {index < csvData.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </PreviewBoxStyled>
      )}
      <ActionBoxStyled>
        <Button
          variant='contained'
          onClick={() => setShowCsvData(true)}
          disabled={csvData.length === 0}
          sx={{ mt: 2, mr: 1 }}
        >
          Preview Roles
        </Button>
        <Button variant='contained' onClick={handleUpload} disabled={csvData.length === 0} sx={{ mt: 2 }}>
          {loadingUpload ? 'Uploading...' : 'Upload'}
        </Button>
      </ActionBoxStyled>
      <ActionBoxStyled>
        {uploadError && (
          <Typography color='error' sx={{ mt: 2 }}>
            {uploadError}
          </Typography>
        )}
      </ActionBoxStyled>
    </CustomModal>
  )
}

export default UploadUserRolesModal
