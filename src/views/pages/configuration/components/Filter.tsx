import { Autocomplete, Checkbox } from '@mui/material'
import React from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'

type Props = {
  value: string[]
  onChange: (v: string[]) => void
  label: string
  options: string[]
}

const Filter = ({ value, onChange, label, options }: Props) => {
  return (
    <Autocomplete
      id='filter-select'
      size='small'
      value={value}
      multiple
      fullWidth
      disableCloseOnSelect
      options={options}
      getOptionLabel={option => option}
      onChange={(_, newValue) => {
        onChange(newValue)
      }}
      onInputChange={(_, __, reason) => {
        if (reason === 'clear') {
          onChange([])
        }
      }}
      renderOption={(props, option, { selected }) => (
        <li {...props} key={option} data-option={option}>
          <Checkbox sx={{ marginRight: 8 }} checked={selected} />
          {option}
        </li>
      )}
      renderInput={params => <CustomTextField {...params} variant='outlined' label={label} />}
    />
  )
}

export default Filter
