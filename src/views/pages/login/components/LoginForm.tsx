// ** React Imports
import { useState, useEffect } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** Azure imports
import { useMsal } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'

// ** MUI Components
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useMsalAuth } from 'src/context/MsalAuthContext'

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: `${theme.palette.primary.main} !important`
}))

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(5).required()
})

const defaultValues = {
  password: '',
  email: ''
}

interface FormData {
  email: string
  password: string
}

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)

  // ** Hooks
  const auth = useAuth()
  const { hasMsalLoginActive } = useMsalAuth()
  const { instance, inProgress } = useMsal()
  const { appBranding, appPortalSettings } = useSettings()

  const {
    control,
    setError,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('loginEmail')
    const storedPassword = sessionStorage.getItem('loginPassword')
    if (storedEmail) {
      setValue('email', storedEmail)
    }
    if (storedPassword) {
      setValue('password', storedPassword)
    }
  }, [sessionStorage, setValue])

  const onSubmit = async (data: FormData) => {
    const { email, password } = data
    auth.login({ email, password }, err => {
      setError('email', {
        type: 'manual',
        message: err.message
      })
    })
  }

  const azureSignInHandler = async () => {
    try {
      const loginResponse = await instance.loginPopup()
      if (loginResponse) {
        auth.azureLogin({ email: loginResponse.account.username, username: loginResponse.account.name! }, err => {
          setError('email', {
            type: 'manual',
            message: err.message
          })
        })
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      <img
        width={appBranding?.main_logo_width || process.env.NEXT_PUBLIC_MAIN_LOGO_WIDTH || '295'}
        alt={process.env.NEXT_PUBLIC_BRAND_NAME ? process.env.NEXT_PUBLIC_BRAND_NAME : ''}
        src={appBranding?.appLogo || process.env.NEXT_PUBLIC_MAIN_LOGO_PATH || '/images/branding/main_logo.png'}
      />

      <Box sx={{ my: 6 }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          {appPortalSettings.landing_page_title}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>{appPortalSettings.landing_page_subtitle}</Typography>
      </Box>
      {hasMsalLoginActive && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton
            href='/'
            component={Link}
            sx={{ color: '#497ce2', borderRadius: 2 }}
            disabled={inProgress === InteractionStatus.Startup || inProgress === InteractionStatus.Login}
            onClick={() => azureSignInHandler()}
          >
            <Icon
              icon={
                inProgress === InteractionStatus.Startup || inProgress === InteractionStatus.Login
                  ? 'ion:logo-microsoft'
                  : 'logos:microsoft-icon'
              }
            />
            <Typography sx={{ ml: 2 }}>Log in with Microsoft</Typography>
          </IconButton>
        </Box>
      )}
      <form noValidate onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
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
        <Box sx={{ mb: 1.5 }}>
          <Controller
            name='password'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <CustomTextField
                fullWidth
                value={value}
                onBlur={onBlur}
                label='Password'
                onChange={onChange}
                error={Boolean(errors.password)}
                {...(errors.password && { helperText: errors.password.message })}
                type={showPassword ? 'text' : 'password'}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Icon fontSize='1.25rem' icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
        </Box>
        <Button fullWidth type='submit' variant='contained' sx={{ mb: 4 }}>
          Login
        </Button>
        {appPortalSettings.landing_page_show_create_account && (
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Typography sx={{ color: 'text.secondary', mr: 2 }}>New on our platform?</Typography>
            <Typography href='/register' component={LinkStyled}>
              Create an account
            </Typography>
          </Box>
        )}
      </form>
    </Box>
  )
}

export default LoginForm
