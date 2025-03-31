import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import axios from 'axios'
import { Fragment, useEffect, useRef, useState } from 'react'
import { NangoSync } from 'src/context/types'
import Paper from '@mui/material/Paper'
import toast from 'react-hot-toast'

const SyncsSettingsModal = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [syncs, setSyncs] = useState<NangoSync[]>([])
  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const initialSyncsRef = useRef<any[]>([])

  const handleSave = async () => {
    if (JSON.stringify(initialSyncsRef.current) === JSON.stringify(syncs)) {
      handleClose()

      return
    }

    try {
      setLoading(true)
      const resp = await axios.post('/api/nango/syncs/update', {
        syncs: syncs.filter((s, i) => s.status !== initialSyncsRef.current[i].status)
      })

      if (resp.data.ok) {
        toast.success(resp.data.message)
        initialSyncsRef.current = [...syncs]
      } else {
        toast.error('Failed to save syncs')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      handleClose()
    }
  }

  const handleSwitch = (sync: NangoSync) => {
    const newSyncs = syncs.map(s => {
      if (s.id === sync.id) {
        return { ...s, status: sync.status === 'SUCCESS' ? 'PAUSED' : 'SUCCESS' }
      }

      return s
    })
    setSyncs(newSyncs)
  }

  const getSyncs = async () => {
    try {
      setLoading(true)
      const resp = await axios.get('/api/nango/syncs/get')
      setSyncs(resp.data.syncs)

      if (initialSyncsRef.current.length === 0) {
        initialSyncsRef.current = [...resp.data.syncs]
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSyncs()
  }, [])

  return (
    <Fragment>
      <Button variant='contained' sx={{ height: '100%' }} onClick={handleClickOpen}>
        Syncs settings
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth={'md'} sx={{ overflow: 'hidden' }}>
        <DialogTitle id='alert-dialog-title'>Syncs settings</DialogTitle>

        <DialogContent sx={{ gap: '10px', display: 'flex', flexDirection: 'column', minWidth: '800px' }}>
          {loading ? (
            <DialogContentText
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '180px' }}
            >
              <CircularProgress size={35} />
            </DialogContentText>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table sx={{ width: '800px' }} size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell align='left' width={150}>
                        Sync Name
                      </TableCell>

                      <TableCell align='left' width={200}>
                        Status
                      </TableCell>

                      <TableCell align='left' width={150}>
                        Frequency
                      </TableCell>

                      <TableCell align='left' width={200}>
                        Last Sync Start
                      </TableCell>

                      <TableCell align='left' width={100}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {syncs.map(sync => (
                      <TableRow key={sync.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component='th' scope='row'>
                          {sync.name}
                        </TableCell>
                        <TableCell align='left'>{sync.status}</TableCell>
                        <TableCell align='left'>{sync.frequency}</TableCell>
                        <TableCell align='left'>{new Date(sync.finishedAt).toLocaleString()}</TableCell>

                        <TableCell align='right'>
                          <Switch checked={sync.status === 'SUCCESS'} onChange={() => handleSwitch(sync)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={handleSave} autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

export default SyncsSettingsModal
