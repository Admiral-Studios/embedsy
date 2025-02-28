// ** Custom Component Import
import CustomDatePicker from 'src/@core/components/mui/date-picker'

// ** Third Party Imports
import { UseFormReturn, useController } from 'react-hook-form'
import isValid from 'date-fns/isValid'

// ** Utils
import { settingToLabel } from '../../../../utils/settingToLabel'

export interface DateSettingProps {
  label?: string
  name: string
  form: UseFormReturn<any>
}

const DateSetting = ({ label = '', name, form }: DateSettingProps) => {
  const {
    control,
    formState: { errors }
  } = form

  const { field } = useController({
    name,
    control: control
  })

  return (
    <CustomDatePicker
      label={label || settingToLabel(name)}
      value={field.value}
      onChange={date => {
        if (isValid(date)) {
          field.onChange(date?.toISOString())
        } else {
          field.onChange(null)
        }
      }}
      onClose={field.onBlur}
      slotProps={{
        textField: {
          onBlur: field.onBlur,
          error: !!errors?.[name],
          ...(errors?.[name] && { helperText: errors?.[name]?.message as string })
        }
      }}
    />
  )
}

export default DateSetting
