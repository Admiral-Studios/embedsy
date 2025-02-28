// ** Custom Component Import
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import { UseFormReturn, useController } from 'react-hook-form'

// ** Utils
import { settingToLabel } from '../../../../utils/settingToLabel'

export interface SelectSettingProps {
  label?: string
  name: string
  form: UseFormReturn<any>
  options: Array<{ label: string; value: string }>
}

const SelectSetting = ({ label = '', options, name, form }: SelectSettingProps) => {
  const {
    control,
    formState: { errors }
  } = form

  const { field } = useController({
    name,
    control: control
  })

  return (
    <CustomAutocomplete
      fullWidth
      options={options}
      onChange={(e, option) => {
        field.onChange(option?.value)
      }}
      onBlur={field.onBlur}
      value={options?.find?.(option => option.value === field.value) || null}
      renderInput={params => (
        <CustomTextField
          label={label || settingToLabel(name)}
          placeholder={label || settingToLabel(name)}
          error={!!errors?.[name]}
          {...(errors?.[name] && { helperText: errors?.[name]?.message as string })}
          {...params}
        />
      )}
    />
  )
}

export default SelectSetting
