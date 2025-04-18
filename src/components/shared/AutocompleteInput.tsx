import { Autocomplete, AutocompleteRenderGetTagProps, Box, IconButton } from '@mui/material'
import { ReactNode, useCallback, useState } from 'react'
import IconifyIcon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import ChipItem from './ChipItem'

type Props = {
  onChange: (value: any) => void
  value: any
  label?: ReactNode
  placeholder: string
  options?: string[]
  error?: string
  multiple?: boolean
  freeSolo?: boolean
  getOptionLabel?: (option: any) => string
  getOptionValue?: (option: string) => string
}

const defaultGetOptionLabel = (option: any) => option
const defaultGetOptionValue = (option: string) => option

const AutocompleteInput = ({
  onChange,
  value,
  label,
  placeholder,
  options = [],
  error,
  multiple = false,
  freeSolo = false,
  getOptionLabel,
  getOptionValue = defaultGetOptionValue
}: Props) => {
  const [inputValue, setInputValue] = useState('')
  const [editableValue, setEditableValue] = useState<{ index: number; value: string } | null>(null)

  const handleInputChange = (_: any, newInputValue: string, reason: string) => {
    setInputValue(newInputValue)

    if (reason === 'clear') {
      onChange(multiple ? [] : null)
    }

    if (editableValue) {
      setEditableValue(null)
    }
  }

  const handleEditableChipChange = (updatedValue: string, index: number) => {
    const updatedList = [...value]
    updatedList[index] = updatedValue
    onChange(updatedList)
    setEditableValue(null)
  }

  const renderEditableChip = useCallback(
    (value: string[], getTagsProps: AutocompleteRenderGetTagProps) => {
      return value.map((option, index) => {
        const tagProps = getTagsProps({ index })
        const { key, ...otherProps } = tagProps

        return (
          <ChipItem
            key={key}
            {...otherProps}
            label={
              editableValue?.index === index ? (
                <CustomTextField
                  size='small'
                  value={editableValue.value}
                  onChange={e => setEditableValue({ ...editableValue, value: e.target.value })}
                  autoFocus
                  fullWidth
                  onMouseDown={e => e.stopPropagation()}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleEditableChipChange(editableValue.value, index)

                    if (e.key === 'Backspace') {
                      e.stopPropagation()
                    }
                  }}
                  sx={{
                    '.MuiInputBase-root': {
                      padding: '0 !important',
                      border: 'none',
                      boxShadow: 'none !important',
                      minWidth: 'auto'
                    },
                    padding: 0
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        sx={{ p: 0 }}
                        onClick={e => {
                          e.stopPropagation()
                          setEditableValue(null)
                        }}
                      >
                        <IconifyIcon icon='mdi:cancel-circle' />
                      </IconButton>
                    )
                  }}
                />
              ) : (
                option
              )
            }
            clickable
            onDelete={editableValue ? undefined : otherProps.onDelete}
            onClick={e => {
              e.stopPropagation()
              if (!editableValue) setEditableValue({ index, value: option })
            }}
            sx={
              editableValue?.index === index
                ? {
                    width: '100%',
                    '.MuiChip-label': {
                      width: '100%'
                    }
                  }
                : undefined
            }
          />
        )
      })
    },
    [editableValue]
  )

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
      <Autocomplete
        size='small'
        fullWidth
        multiple={multiple}
        freeSolo={freeSolo}
        options={options}
        value={value}
        inputValue={inputValue}
        getOptionLabel={getOptionLabel || defaultGetOptionLabel}
        onChange={(_, newValue) => {
          if (multiple && Array.isArray(newValue)) {
            const processedValues = newValue.map(item => {
              if (value.includes(item)) return item

              return typeof item === 'string' ? getOptionValue(item) : item
            })
            onChange(processedValues)
          } else {
            onChange(newValue ? (typeof newValue === 'string' ? getOptionValue(newValue) : newValue) : newValue)
          }
        }}
        onInputChange={handleInputChange}
        renderInput={params => (
          <CustomTextField
            {...params}
            variant='outlined'
            label={label}
            placeholder={placeholder}
            error={!!error}
            helperText={error || ''}
            sx={{
              '.MuiFormLabel-root': {
                overflow: 'visible'
              }
            }}
          />
        )}
        renderOption={(props, option) => {
          const displayText = getOptionLabel ? getOptionLabel(option) : defaultGetOptionLabel(option)

          return (
            <li key={option} {...props}>
              {displayText}
            </li>
          )
        }}
        sx={{
          '.Mui-focusVisible': {
            backgroundColor: 'rgba(47, 43, 61, 0.06) !important'
          }
        }}
        renderTags={multiple ? renderEditableChip : undefined}
      />
    </Box>
  )
}

export default AutocompleteInput
