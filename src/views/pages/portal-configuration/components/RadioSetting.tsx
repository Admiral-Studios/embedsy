// ** Component Import
import Radio, { RadioProps } from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import FormHelperText from '@mui/material/FormHelperText'

// ** Third Party Imports
import { UseFormReturn, useController } from 'react-hook-form'

export type RadioSettingProps = Omit<RadioProps, 'form'> & {
  label?: string
  name: string
  form: UseFormReturn<any>
}

const RadioSetting = ({ label = '', name, form }: RadioSettingProps) => {
  const {
    control,
    formState: { errors }
  } = form

  const { field } = useController({
    name,
    control: control
  })

  return (
    <>
      {/* Add the row prop here */}
      <FormLabel>{label}</FormLabel>
      <RadioGroup row>
        <FormControlLabel
          value={true}
          control={<Radio checked={field.value} onClick={() => field.onChange(true)} />}
          label='Show'
        />
        <FormControlLabel
          value={false}
          control={<Radio checked={!field.value} onClick={() => field.onChange(false)} />}
          label='Hide'
        />
      </RadioGroup>
      {errors?.[name] && <FormHelperText>{errors?.[name]?.message as string}</FormHelperText>}
    </>
  )
}

export default RadioSetting
