import React, { useState, useCallback, useEffect, ChangeEvent } from 'react'
import { TextField, Box, Typography, Button, IconButton } from '@mui/material'
import axios from 'axios'
import { styled } from '@mui/material/styles'
import DeleteIcon from '@mui/icons-material/Delete'
import CustomModal from '../CustomModal'
import resizeImage from 'src/utils/resizeImage'

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

const ImagePreviewWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '150px',
  height: '150px',
  backgroundColor: theme.palette.customColors.brandingGridBg,
  padding: 4
}))

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  width: 'auto',
  height: 'auto'
})

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
  selectedFolder: string | null
  onUploadSuccess: () => void
}

const UploadMediaModal = ({ open, handleClose, selectedFolder, onUploadSuccess }: Props) => {
  const [files, setFiles] = useState<File[]>([])
  const [localImages, setLocalImages] = useState<string[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [isUploadButtonDisabled, setIsUploadButtonDisabled] = useState(false)

  useEffect(() => {
    if (!open) {
      setFiles([])
      setUploadError(null)
      setLoadingUpload(false)
      setLocalImages([])
    }
  }, [open])

  useEffect(() => {
    if (files.length) {
      const readers = files.map(file => {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        return reader
      })

      Promise.all(
        readers.map(
          reader =>
            new Promise<string>(resolve => {
              reader.onloadend = () => resolve(reader.result as string)
            })
        )
      ).then(setLocalImages)
      setIsUploadButtonDisabled(false)
    } else {
      setLocalImages([])
    }
  }, [files])

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList) {
      if (selectedFolder === 'landing_page_images') {
        setFiles(prevFiles => [...prevFiles, ...Array.from(fileList)])
      } else {
        const resizedFiles = await Promise.all(Array.from(fileList).map(file => resizeImage(file, 800, 800)))
        setFiles(prevFiles => [...prevFiles, ...resizedFiles])
      }
    }
  }

  const handleDeleteFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
    setLocalImages(prevImages => prevImages.filter((_, i) => i !== index))
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
    formData.append('folder', selectedFolder!)

    try {
      const response = await axios.post('/api/blob/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (response.data.urls) {
        onUploadSuccess()
      } else {
        setUploadError('Failed to upload images.')
      }
    } catch (error: any) {
      console.error('Error uploading media:', error)
      setUploadError(`Error uploading media. ${error.response?.data?.message || error.message}`)
    } finally {
      setLoadingUpload(false)
    }
  }, [files, selectedFolder, onUploadSuccess])

  return (
    <CustomModal open={open} handleClose={handleClose} customWidth={500} title='Upload Media Files'>
      {files.length > 0 && (
        <Box sx={{ mt: 2, height: '250px' }}>
          <Carousel>
            {localImages.map((image, index) => (
              <CarouselItem key={index}>
                <ImagePreviewWrapper>
                  <ImagePreview src={image} alt='Preview' />
                  <DeleteButton onClick={() => handleDeleteFile(index)}>
                    <DeleteIcon />
                  </DeleteButton>
                </ImagePreviewWrapper>
                <FileName variant='caption'>{files[index].name}</FileName>
              </CarouselItem>
            ))}
          </Carousel>
        </Box>
      )}
      <UploadBoxStyled>
        <TextField
          type='file'
          onChange={handleFileChange}
          inputProps={{ accept: 'image/*,image/gif', multiple: true }}
          fullWidth
        />
      </UploadBoxStyled>
      <ActionBoxStyled>
        <Button variant='contained' onClick={handleUpload} disabled={!files.length || isUploadButtonDisabled}>
          {loadingUpload
            ? 'Uploading...'
            : isUploadButtonDisabled && localImages.length > 0
            ? 'Files Uploaded'
            : 'Upload Files'}
        </Button>
        <Button variant='contained' disabled={loadingUpload} onClick={handleClose}>
          Cancel
        </Button>
      </ActionBoxStyled>
      {uploadError && (
        <Typography color='error' sx={{ mt: 2 }}>
          {uploadError}
        </Typography>
      )}
    </CustomModal>
  )
}

export default UploadMediaModal
