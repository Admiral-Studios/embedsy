import React, { useState, useCallback, useEffect } from 'react'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import axios from 'axios'
import { styled, useTheme } from '@mui/material/styles'
import DeleteIcon from '@mui/icons-material/Delete'
import CustomModal from '../CustomModal'
import ConfirmDeleteMediaFilesModal from './ConfirmDeleteMediaFilesModal'
import UploadMediaModal from './UploadMediaModal'
import FolderNames from 'src/enums/folderNames'
import Icon from 'src/@core/components/icon'
import truncateFileName from 'src/utils/truncateFileName'
import UploadFilesModal from './UploadFilesModal'

const Carousel = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(2),
  maxHeight: '450px',
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

const DeleteButtonOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0,
  transition: 'opacity 0.3s',
  cursor: 'pointer',
  '&:hover': {
    opacity: 1
  }
}))

const FoldersBoxStyled = styled(Box)(({ theme }) => ({
  gap: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column'
}))

type Props = {
  open: boolean
  handleClose: () => void
}

const MediaAndFilesModal = ({ open, handleClose }: Props) => {
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [loadingExistingImages, setLoadingExistingImages] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [confirmDeleteMediaFilesModalOpen, setConfirmDeleteMediaFilesModalOpen] = useState(false)
  const [mediaOrFileToDelete, setMediaOrFileToDelete] = useState<string | null>(null)
  const [uploadMediaModalOpen, setUploadMediaModalOpen] = useState(false)
  const [uploadFilesModalOpen, setUploadFilesModalOpen] = useState(false)
  const [fileTypeToDelete, setFileTypeToDelete] = useState<string | null>(null)

  const theme = useTheme()

  useEffect(() => {
    if (!open) {
      setStep(1)
      setSelectedFolder(null)
      setExistingImages([])
    }
  }, [open])

  const handleDeleteExistingFile = (file: string) => {
    setFileTypeToDelete('file')
    setMediaOrFileToDelete(file)
    setConfirmDeleteMediaFilesModalOpen(true)
  }

  const handleDeleteExistingImage = (image: string) => {
    setFileTypeToDelete('media')
    setMediaOrFileToDelete(image)
    setConfirmDeleteMediaFilesModalOpen(true)
  }

  const onGoBack = () => {
    setSelectedFolder(null)
    setStep(1)
  }

  const fetchExistingImagesOrFiles = useCallback(async (folder: string) => {
    setLoadingExistingImages(true)
    try {
      const response = await axios.get(`/api/blob/list?folder=${folder}`)
      setExistingImages(response.data.urls)
    } catch (error) {
      console.error('Error fetching existing images:', error)
    } finally {
      setLoadingExistingImages(false)
    }
  }, [])

  const onSelectFolder = (folder: string) => {
    setSelectedFolder(folder)
    setStep(2)
    fetchExistingImagesOrFiles(folder)
  }

  const handleDeleteSuccess = () => {
    setExistingImages(prev => prev.filter(url => url !== mediaOrFileToDelete))
    setMediaOrFileToDelete(null)
  }

  const handleUploadMediaSuccess = () => {
    if (!selectedFolder) return
    setUploadMediaModalOpen(false)
    fetchExistingImagesOrFiles(selectedFolder)
  }

  const handleUploadFilesSuccess = () => {
    if (!selectedFolder) return
    setUploadFilesModalOpen(false)
    fetchExistingImagesOrFiles(selectedFolder)
  }

  const getFileName = (url: string) => {
    const nameWithExtension = url.split('/').pop() || ''
    const fileName = nameWithExtension.split('-').slice(0, -1).join('-')

    return truncateFileName(fileName, 12)
  }

  return (
    <CustomModal
      open={open}
      handleClose={handleClose}
      customWidth={500}
      title={`Manage Media & Files ${
        selectedFolder ? `- ${FolderNames[selectedFolder as keyof typeof FolderNames]}` : ''
      }`}
    >
      {step === 1 && (
        <FoldersBoxStyled>
          <Button variant='contained' onClick={() => onSelectFolder('logos')} sx={{ mt: 2 }}>
            Logos
          </Button>
          <Button variant='contained' onClick={() => onSelectFolder('favicons')} sx={{ mt: 2 }}>
            Favicons
          </Button>
          <Button variant='contained' onClick={() => onSelectFolder('loading_spinners')} sx={{ mt: 2 }}>
            Loading Spinners
          </Button>
          <Button variant='contained' onClick={() => onSelectFolder('landing_page_images')} sx={{ mt: 2 }}>
            Landing Page Images
          </Button>
          <Button variant='contained' onClick={() => onSelectFolder('powerbi')} sx={{ mt: 2 }}>
            Power BI Themes
          </Button>
        </FoldersBoxStyled>
      )}

      {step === 2 && (
        <Box>
          {loadingExistingImages ? (
            <Box display='flex' justifyContent='center' alignItems='center' height='150px'>
              <CircularProgress />
            </Box>
          ) : existingImages.length > 0 ? (
            <Box sx={{ height: '450px' }}>
              <Carousel>
                {existingImages.map((image, index) => (
                  <CarouselItem key={index}>
                    {selectedFolder === 'powerbi' ? (
                      <FileIconWrapper>
                        <Icon icon='tabler:file' fontSize={20} />
                        <span>{getFileName(image)}</span>
                        <DeleteButtonOverlay onClick={() => handleDeleteExistingFile(image)}>
                          <DeleteIcon style={{ color: theme.palette.mode === 'dark' ? '#000' : '#fff' }} />
                        </DeleteButtonOverlay>
                      </FileIconWrapper>
                    ) : (
                      <ImagePreviewWrapper>
                        <ImagePreview src={image} alt='Existing' />
                        <DeleteButtonOverlay onClick={() => handleDeleteExistingImage(image)}>
                          <DeleteIcon style={{ color: theme.palette.mode === 'dark' ? '#000' : '#fff' }} />
                        </DeleteButtonOverlay>
                      </ImagePreviewWrapper>
                    )}
                  </CarouselItem>
                ))}
              </Carousel>
            </Box>
          ) : (
            <Typography align='center' sx={{ pt: 4, pb: 4 }}>
              No media uploaded yet.
            </Typography>
          )}
          <Box sx={{ mt: 2 }}>
            {selectedFolder === 'powerbi' ? (
              <Button variant='contained' onClick={() => setUploadFilesModalOpen(true)}>
                Upload Files
              </Button>
            ) : (
              <Button variant='contained' onClick={() => setUploadMediaModalOpen(true)}>
                Upload Media
              </Button>
            )}
            <Button variant='contained' sx={{ ml: 2 }} onClick={() => onGoBack()}>
              Back
            </Button>
          </Box>
        </Box>
      )}
      <ConfirmDeleteMediaFilesModal
        open={confirmDeleteMediaFilesModalOpen}
        mediaOrFileUrl={mediaOrFileToDelete}
        handleClose={() => setConfirmDeleteMediaFilesModalOpen(false)}
        onDeleteSuccess={handleDeleteSuccess}
        type={fileTypeToDelete}
      />
      <UploadMediaModal
        open={uploadMediaModalOpen}
        handleClose={() => setUploadMediaModalOpen(false)}
        selectedFolder={selectedFolder}
        onUploadSuccess={handleUploadMediaSuccess}
      />
      <UploadFilesModal
        open={uploadFilesModalOpen}
        handleClose={() => setUploadFilesModalOpen(false)}
        onUploadSuccess={handleUploadFilesSuccess}
      />
    </CustomModal>
  )
}

export default MediaAndFilesModal
