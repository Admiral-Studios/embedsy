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
}

const defaultGetOptionLabel = (option: any) => option

const AutocompleteInput = ({
  onChange,
  value,
  label,
  placeholder,
  options = [],
  error,
  multiple = false,
  freeSolo = false,
  getOptionLabel
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
        const { key, ...otherProps } = getTagsProps({ index })

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
        onChange={(_, newValue) => onChange(newValue)}
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
