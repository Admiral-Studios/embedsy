import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Box, Button, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import DeleteIcon from '@mui/icons-material/Delete'
import Icon from 'src/@core/components/icon'
import CustomModal from '../CustomModal'

const FileIconWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '150px',
  height: '150px',
  backgroundColor: theme.palette.customColors.brandingGridBg,
  padding: 4,
  margin: '0 auto'
}))

const ImagePreviewWrapper = styled(Box)(() => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '150px',
  height: '150px',
  margin: '0 auto'
}))

const BoxStyled = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.customColors.brandingGridBg,
  textAlign: 'center',
  marginBottom: 8
}))

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  width: 'auto',
  height: 'auto'
})

const ActionBoxStyled = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  gap: theme.spacing(2),
  display: 'flex'
}))

type ConfirmDeleteMediaModalProps = {
  open: boolean
  mediaOrFileUrl: string | null
  handleClose: () => void
  type: string | null
  onDeleteSuccess: () => void
}

const ConfirmDeleteMediaFilesModal = ({
  open,
  mediaOrFileUrl,
  handleClose,
  type,
  onDeleteSuccess
}: ConfirmDeleteMediaModalProps) => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setLoading(false)
    }
  }, [open])

  const getFileNameAndFolder = (url: string) => {
    const pathParts = url.split('/')
    const fileName = pathParts.pop() || ''
    const folder = pathParts.pop() || ''

    return { fileName, folder }
  }

  const handleDelete = async () => {
    if (!mediaOrFileUrl) return
    const { fileName, folder } = getFileNameAndFolder(mediaOrFileUrl || '')
    setLoading(true)
    try {
      await axios.delete(`/api/blob/delete`, { params: { folder, fileName } })
      onDeleteSuccess()
      handleClose()
    } catch (error) {
      console.error('Error deleting media:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFileName = (url: string) => {
    const nameWithExtension = url.split('/').pop() || ''
    const fileName = nameWithExtension.split('-').slice(0, -1).join('-')
    
return fileName
  }

  return (
    <CustomModal
      open={open}
      customWidth={500}
      handleClose={handleClose}
      title={`Confirm Delete ${type === 'file' ? 'File' : 'Media'}`}
    >
      <BoxStyled>
        {mediaOrFileUrl && (
          <>
            {type === 'file' ? (
              <FileIconWrapper>
                <Icon icon='tabler:file' fontSize={20} />
                <span>{getFileName(mediaOrFileUrl)}</span>
              </FileIconWrapper>
            ) : (
              <ImagePreviewWrapper>
                <ImagePreview src={mediaOrFileUrl} alt='Preview' />
              </ImagePreviewWrapper>
            )}
          </>
        )}
      </BoxStyled>
      <ActionBoxStyled>
        <Button variant='contained' onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleDelete} variant='contained' startIcon={<DeleteIcon />} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Delete'}
        </Button>
      </ActionBoxStyled>
    </CustomModal>
  )
}

export default ConfirmDeleteMediaFilesModal
