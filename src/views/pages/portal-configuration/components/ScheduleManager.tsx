import { useState } from 'react'
import { Box, Typography, Grid } from '@mui/material'
import { TimePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import Icon from 'src/@core/components/icon'
import { format, parse } from 'date-fns'

type TimeSlot = {
  day: string
  startTime: string
  endTime: string
}

type ScheduleManagerProps = {
  value: TimeSlot[]
  onChange: (slots: TimeSlot[]) => void
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

const dayOffBoxStyles = {
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 45,
  px: 2,
  bgcolor: 'action.hover',
  borderRadius: 1
}

const actionButtonStyles = {
  bgcolor: 'action.hover',
  borderRadius: 1,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 45,
  height: 45,
  '&:hover': {
    bgcolor: 'action.focus'
  }
}

const timePickerStyles = {
  '& .MuiInputBase-root': {
    height: 45
  },
  '& .MuiPickersPopper-root': {
    '& .MuiPickersLayout-contentWrapper': {
      overflowY: 'hidden'
    }
  }
}

const spacerStyles = {
  width: 45,
  height: 45
}

const ScheduleManager = ({ value, onChange }: ScheduleManagerProps) => {
  const [slots, setSlots] = useState<TimeSlot[]>(value)

  const addSlot = (day: string) => {
    const newSlot = {
      day,
      startTime: '09:00',
      endTime: '17:00'
    }

    const newSlots = [...slots, newSlot]
    setSlots(newSlots)
    onChange(newSlots)
  }

  const removeSlot = (day: string, slotIndex: number) => {
    const daySlots = slots.filter(slot => slot.day === day)
    const otherSlots = slots.filter(slot => slot.day !== day)
    daySlots.splice(slotIndex, 1)
    const newSlots = [...otherSlots, ...daySlots]
    setSlots(newSlots)
    onChange(newSlots)
  }

  const updateSlot = (day: string, slotIndex: number, field: keyof TimeSlot, value: string) => {
    const daySlots = slots.filter(slot => slot.day === day)
    const otherSlots = slots.filter(slot => slot.day !== day)

    daySlots[slotIndex] = { ...daySlots[slotIndex], [field]: value }

    const newSlots = [...otherSlots, ...daySlots]
    setSlots(newSlots)
    onChange(newSlots)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ pt: 4 }}>
        {DISPLAY_ORDER.map(dayIndex => {
          const day = DAYS[dayIndex]
          const daySlots = slots.filter(slot => slot.day === day)

          return (
            <Box key={day} sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={2} sx={{ alignSelf: 'flex-start' }}>
                  <Typography sx={{ pt: 2.5 }}>{day}</Typography>
                </Grid>
                <Grid item xs={10}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {daySlots.length === 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={dayOffBoxStyles}>
                          <Typography color='text.secondary'>Day off</Typography>
                        </Box>
                        <Box onClick={() => addSlot(day)} sx={actionButtonStyles}>
                          <Icon icon='mdi:plus' color='primary' />
                        </Box>
                      </Box>
                    ) : (
                      daySlots.map((slot, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <TimePicker
                            value={parse(slot.startTime, 'HH:mm', new Date())}
                            onChange={newValue => {
                              if (newValue) {
                                updateSlot(day, index, 'startTime', format(newValue, 'HH:mm'))
                              }
                            }}
                            ampm={false}
                            views={['hours', 'minutes']}
                            slotProps={{
                              textField: {
                                sx: timePickerStyles
                              }
                            }}
                          />
                          <TimePicker
                            value={parse(slot.endTime, 'HH:mm', new Date())}
                            onChange={newValue => {
                              if (newValue) {
                                updateSlot(day, index, 'endTime', format(newValue, 'HH:mm'))
                              }
                            }}
                            ampm={false}
                            views={['hours', 'minutes']}
                            slotProps={{
                              textField: {
                                sx: timePickerStyles
                              }
                            }}
                          />
                          <Box onClick={() => removeSlot(day, index)} sx={actionButtonStyles}>
                            <Icon icon='mdi:delete' color='error' />
                          </Box>
                          {index === daySlots.length - 1 ? (
                            <Box onClick={() => addSlot(day)} sx={actionButtonStyles}>
                              <Icon icon='mdi:plus' color='primary' />
                            </Box>
                          ) : (
                            <Box sx={spacerStyles} />
                          )}
                        </Box>
                      ))
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )
        })}
      </Box>
    </LocalizationProvider>
  )
}

export default ScheduleManager
