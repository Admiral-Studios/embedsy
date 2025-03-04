// ** Custom Component Import
import CustomTextField, { TextFieldProps } from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import { UseFormReturn, useController } from 'react-hook-form'

// ** Utils
import { settingToLabel } from '../../../../utils/settingToLabel'

export type StringSettingProps = TextFieldProps & {
  label?: string
  name: string
  form: UseFormReturn<any>
}

const StringSetting = ({ label = '', name, form, ...props }: StringSettingProps) => {
  const {
    control,
    formState: { errors }
  } = form

  const { field } = useController({
    name,
    control: control
  })

  return (
    <CustomTextField
      fullWidth
      label={label || settingToLabel(name)}
      placeholder={settingToLabel(name)}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={!!errors?.[name]}
      {...(errors?.[name] && { helperText: errors?.[name]?.message as string })}
      {...props}
    />
  )
}

export default StringSetting
