import React, { useState, useCallback, useEffect, ChangeEvent } from 'react'
import { TextField, Box, Typography, Button, IconButton } from '@mui/material'
import axios from 'axios'
import { styled } from '@mui/material/styles'
import DeleteIcon from '@mui/icons-material/Delete'
import CustomModal from '../CustomModal'
import Icon from 'src/@core/components/icon'

const UploadBoxStyled = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4)
}))

const ActionBoxStyled = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  gap: theme.spacing(2),
  display: 'flex'
}))

const Carousel = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(2),
  maxHeight: '250px',
  overflowY: 'scroll',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  '-ms-overflow-style': 'none',
  'scrollbar-width': 'none'
}))

const CarouselItem = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative'
}))

const FileIconWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '150px',
  height: '150px',
  backgroundColor: theme.palette.customColors.brandingGridBg,
  padding: 4
}))

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.background.paper
  }
}))

const FileName = styled(Typography)({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: '150px',
  display: 'block'
})

type Props = {
  open: boolean
  handleClose: () => void
  onUploadSuccess: () => void
}

const UploadFilesModal = ({ open, onUploadSuccess, handleClose }: Props) => {
  const [files, setFiles] = useState<File[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [isUploadButtonDisabled, setIsUploadButtonDisabled] = useState(false)

  useEffect(() => {
    if (!open) {
      setFiles([])
      setUploadError(null)
      setLoadingUpload(false)
    }
  }, [open])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList) {
      const validFiles: File[] = []
      const invalidFiles: string[] = []

      for (const file of fileList) {
        if (file.type === 'application/json') {
          validFiles.push(file)
        } else {
          invalidFiles.push(file.name)
        }
      }

      if (invalidFiles.length > 0) {
        setUploadError(`Only JSON files are accepted. Invalid files: ${invalidFiles.join(', ')}`)
      } else {
        setUploadError(null)
      }

      setFiles(prevFiles => [...prevFiles, ...validFiles])
      event.target.value = ''
    }
  }

  const handleDeleteFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  const handleUpload = useCallback(async () => {
    if (!files.length) {
      setUploadError('No files selected.')
      
return
    }

    setUploadError(null)
    setLoadingUpload(true)

    const formData = new FormData()
    files.forEach(file => formData.append('file', file))
    formData.append('folder', 'powerbi')

    try {
      const response = await axios.post('/api/blob/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (response.data.urls.length) {
        setIsUploadButtonDisabled(true)
        onUploadSuccess()
      } else {
        setUploadError('Failed to upload files.')
      }
    } catch (error: any) {
      console.error('Error uploading files:', error)
      setUploadError(`Error uploading files. ${error.response?.data?.message || error.message}`)
    } finally {
      setLoadingUpload(false)
    }
  }, [files, onUploadSuccess])

  return (
    <CustomModal open={open} customWidth={500} handleClose={handleClose} title='Upload JSON Files'>
      {files.length > 0 && (
        <Box sx={{ mt: 2, height: '250px' }}>
          <Carousel>
            {files.map((file, index) => (
              <CarouselItem key={index}>
                <FileIconWrapper>
                  <Icon icon='tabler:file' fontSize={40} />
                  <FileName variant='caption'>{file.name}</FileName>
                  <DeleteButton onClick={() => handleDeleteFile(index)}>
                    <DeleteIcon />
                  </DeleteButton>
                </FileIconWrapper>
              </CarouselItem>
            ))}
          </Carousel>
        </Box>
      )}
      <UploadBoxStyled>
        <TextField
          type='file'
          onChange={handleFileChange}
          inputProps={{ accept: 'application/json', multiple: true }}
          fullWidth
        />
      </UploadBoxStyled>
      {uploadError && (
        <ActionBoxStyled>
          <Typography color='error'>{uploadError}</Typography>
        </ActionBoxStyled>
      )}
      <ActionBoxStyled sx={{ mt: 2 }}>
        <Button variant='contained' onClick={handleUpload} disabled={!files.length || isUploadButtonDisabled}>
          {loadingUpload ? 'Uploading...' : isUploadButtonDisabled ? 'Files Uploaded' : 'Upload Files'}
        </Button>
        <Button variant='contained' onClick={handleClose}>
          Close
        </Button>
      </ActionBoxStyled>
    </CustomModal>
  )
}

export default UploadFilesModal
