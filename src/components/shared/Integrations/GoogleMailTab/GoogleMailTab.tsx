import { Box, Button, DialogActions, Typography } from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import AutocompleteInput from '../../AutocompleteInput'
import { NangoContext } from 'src/context/NangoContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { GridColumnVisibilityModel } from '@mui/x-data-grid'
import { csvToHtmlTable } from 'src/utils/csvToHtmlTable'

interface GoogleMailTabProps {
  onClose: () => void
  sharedData: string | null
  setIsLoading: (isLoading: boolean) => void
  rows: { [key: string]: number | string }[]
  columnVisibility: GridColumnVisibilityModel
}

const GoogleMailTab = ({ onClose, sharedData, rows, columnVisibility }: GoogleMailTabProps) => {
  const { connections } = useContext(NangoContext)
  const [isUseColumn, setIsUseColumn] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const emailKeywords = ['email', 'emails', 'user email', 'user emails', 'email address', 'email addresses']

  const emails = useMemo(() => {
    return rows.reduce((acc, cur) => {
      const rowEntries = Object.entries(cur)

      rowEntries.forEach(entry => {
        const isEmail = emailKeywords.some(keyword => entry[0].toLowerCase().includes(keyword))

        if (isEmail) {
          acc.push(entry[1].toString())
        }
      })

      return acc
    }, [] as string[])
  }, [rows])

  const shareData = async () => {
    try {
      const connectionId = connections.find(c => c.providerConfigKey === 'google-mail')?.connectionId

      if (!connectionId) {
        throw new Error('Failed to find connection')
      }

      const data = csvToHtmlTable(sharedData, columnVisibility)

      await axios.post('/api/nango/share_data', {
        connectionId,
        provider: 'google-mail',
        body: {
          from,
          to,
          subject,
          body: data
        },
        actionName: 'send-email'
      })
    } catch (e) {
      console.error(e)
      toast.error('Failed to share data')
    } finally {
      onClose()
      setFrom('')
      setTo([])
      setSubject('')
    }
  }

  const handleAddColumn = (key: string) => {
    const newTo = [...to, ...rows.map(row => String(row[key]))]
    const uniqueTo = Array.from(new Set(newTo))
    setTo(uniqueTo)
  }

  return (
    <>
      <Box display='flex' position='relative' gap='20px'>
        <Box sx={{ width: '100%' }}>
          <CustomTextField label='From' fullWidth sx={{ py: 2 }} value={from} onChange={e => setFrom(e.target.value)} />

          {!!emails.length ? (
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
              <AutocompleteInput
                multiple
                freeSolo
                label='Emails to share data'
                options={emails}
                placeholder='Add emails to share data. Press "Enter" after each email.'
                onChange={newEmails => setTo(newEmails)}
                value={to}
                getOptionLabel={option => option}
              />

              {isUseColumn ? (
                <Button
                  variant='outlined'
                  onClick={() => setIsUseColumn(false)}
                  sx={{ height: '40px', width: '180px' }}
                >
                  Hide
                </Button>
              ) : (
                <Button
                  variant='contained'
                  onClick={() => setIsUseColumn(true)}
                  sx={{ height: '40px', width: '180px' }}
                >
                  Use column
                </Button>
              )}
            </Box>
          ) : (
            <CustomTextField
              label='To'
              fullWidth
              sx={{ py: 2 }}
              value={to[0]}
              onChange={e => setTo([e.target.value])}
            />
          )}

          <CustomTextField
            fullWidth
            label='Subject'
            sx={{ py: 2 }}
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
        </Box>

        {isUseColumn && (
          <Box
            sx={{
              display: 'flex',
              pt: 7,
              minWidth: '200px',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '20px'
            }}
          >
            {Object.keys(rows[0]).map(key => {
              const isEmail = emailKeywords.some(keyword => key.toLowerCase().includes(keyword))
              if (!isEmail) return null

              return (
                <Box
                  key={key}
                  sx={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px'
                  }}
                >
                  <Typography>{key}</Typography>

                  <Button variant='contained' color='primary' onClick={() => handleAddColumn(key)}>
                    Add
                  </Button>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>

      <DialogActions sx={{ paddingRight: 0 }}>
        <Button color='error' onClick={onClose}>
          Close
        </Button>

        <Button variant='contained' color='primary' onClick={shareData}>
          Share
        </Button>
      </DialogActions>
    </>
  )
}

export default GoogleMailTab
