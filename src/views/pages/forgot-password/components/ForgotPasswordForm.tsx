// ** MUI Components
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'
import { useState } from 'react'

const FormButton = styled(Button)(({ theme }) => ({
  '&.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-disableElevation.MuiButton-fullWidth':
    {
      color: `${theme.palette.customColors.contrastTextColor} !important`
    }
}))

const schema = yup.object().shape({
  email: yup.string().email().required()
})

const defaultValues = {
  email: ''
}

interface FormData {
  email: string
}

const ForgotPasswordForm = () => {
  // ** Hooks

  const { appBranding } = useSettings()

  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const submit = async (data: FormData) => {}

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      <img
        width={appBranding?.main_logo_width || process.env.NEXT_PUBLIC_MAIN_LOGO_WIDTH || '295'}
        alt={process.env.NEXT_PUBLIC_BRAND_NAME ? process.env.NEXT_PUBLIC_BRAND_NAME : ''}
        src={appBranding?.appLogo || process.env.NEXT_PUBLIC_MAIN_LOGO_PATH || '/images/branding/main_logo.png'}
      />

      <Box sx={{ my: 6 }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          Forgot Password? 🔒
        </Typography>

        <Typography sx={{ color: 'text.secondary' }}>
          Enter your email and we′ll send you instructions to reset your password
        </Typography>
      </Box>

      <form noValidate onSubmit={handleSubmit(submit)} autoComplete='off'>
        <Box sx={{ mb: 4 }}>
          <Controller
            name='email'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <CustomTextField
                fullWidth
                label='Email'
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder='Email'
                required
                error={Boolean(errors.email)}
                {...(errors.email && { helperText: errors.email.message })}
              />
            )}
          />
        </Box>

        <FormButton fullWidth type='submit' variant='contained' sx={{ mb: 4 }} disabled={isLoading}>
          Login
        </FormButton>
      </form>
    </Box>
  )
}

export default ForgotPasswordForm
