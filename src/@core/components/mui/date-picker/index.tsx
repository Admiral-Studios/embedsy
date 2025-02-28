// ** React Import
import React, { forwardRef } from 'react'

// ** MUI Imports
import CustomTextField from '../text-field'
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker'

// ** Utils
import parseISO from 'date-fns/parseISO'

const CustomDatePicker = forwardRef<HTMLInputElement, DatePickerProps<Date>>(
  ({ value, ...props }: DatePickerProps<Date>, ref) => {
    return (
      <DatePicker
        inputRef={ref}
        value={typeof value === 'string' ? parseISO(value) : value}
        slots={{
          textField: CustomTextField
        }}
        {...props}
      />
    )
  }
)

export default CustomDatePicker
