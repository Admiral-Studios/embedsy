// ** React Imports
import { useState } from 'react'

// ** Next Import
import Link from 'next/link'
import * as yup from 'yup'

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

// ** Demo Imports
import axios from 'axios'
import { useRouter } from 'next/router'
import { useController, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'
import { checkIfEmailPersonal } from 'src/utils/personalEmailValidator'
import { useSettings } from 'src/@core/hooks/useSettings'

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: `${theme.palette.primary.main} !important`
}))

const RegisterButton = styled(Button)(({ theme }) => ({
  '&.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-disableElevation.MuiButton-fullWidth':
    {
      color: `${theme.palette.customColors.contrastTextColor} !important`
    }
}))

const schema = yup.object().shape({
  email: yup.string().email().required(),
  user_name: yup.string().min(3),
  password: yup.string().min(5).required(),
  company: yup.string().required(),
  name: yup.string(),
  title: yup.string()
})

const defaultValues = {
  email: '',
  user_name: '',
  password: '',
  company: '',
  title: '',
  name: ''
}

const RegisterForm = () => {
  const router = useRouter()

  // ** States
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [userData, setUserData] = useState({
    email: '',
    user_name: '',
    password: '',
    company: '',
    title: '',
    name: ''
  })
  const [errorText, setErrorText] = useState('')
  const { appBranding, appPortalSettings } = useSettings()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const { field: email } = useController({
    name: 'email',
    control: control
  })

  const { field: user_name } = useController({
    name: 'user_name',
    control: control
  })

  const { field: password } = useController({
    name: 'password',
    control: control
  })

  const { field: company } = useController({
    name: 'company',
    control: control
  })

  const { field: name } = useController({
    name: 'name',
    control: control
  })

  const { field: title } = useController({
    name: 'title',
    control: control
  })

  // ** Vars

  const signUp = async () => {
    const emailDomain = userData.email.split('@')[1]

    if (checkIfEmailPersonal(emailDomain)) {
      setErrorText('Registration is only available for corporate accounts')

      return
    }

    try {
      const response = await axios.post('/api/auth/register', userData)
      if (response.data?.message) {
        setErrorText(response.data?.message)

        return
      }

      toast.success('The account has been successfully created. Please sign in with your credentials.', {
        duration: 10000
      })

      router.push('/login')
    } catch (e) {
      toast.error('An error occurred during registration. Please try again.')
      console.log(e)
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
        {appPortalSettings.landing_page_title && (
          <Typography variant='h3' sx={{ mb: 1.5 }}>
            {appPortalSettings.landing_page_title}
          </Typography>
        )}
        {appPortalSettings.landing_page_subtitle && (
          <Typography sx={{ color: 'text.secondary' }}>{appPortalSettings.landing_page_subtitle}</Typography>
        )}
      </Box>
      <form noValidate autoComplete='off' onSubmit={handleSubmit(signUp)}>
        <CustomTextField
          autoFocus
          fullWidth
          value={user_name.value}
          sx={{ mb: 4 }}
          label='Username'
          placeholder='johndoe'
          onChange={e => {
            setUserData({ ...userData, ...{ user_name: e.target.value } })
            user_name.onChange(e.target.value)
          }}
          error={Boolean(errors.user_name)}
          {...(errors.user_name && { helperText: errors.user_name.message })}
        />

        <CustomTextField
          fullWidth
          label='Name'
          value={name.value}
          sx={{ mb: 4 }}
          placeholder='your name'
          onChange={e => {
            setUserData({ ...userData, ...{ name: e.target.value } })
            name.onChange(e.target.value)
          }}
          error={Boolean(errors.name)}
          {...(errors.name && { helperText: errors.name.message })}
        />

        <CustomTextField
          fullWidth
          label='Email'
          value={email.value}
          sx={{ mb: 4 }}
          placeholder='user@email.com'
          required
          onChange={e => {
            setUserData({ ...userData, ...{ email: e.target.value } })
            email.onChange(e.target.value)
          }}
          error={Boolean(errors.email)}
          {...(errors.email && { helperText: errors.email.message })}
        />

        <CustomTextField
          fullWidth
          label='Company'
          value={company.value}
          sx={{ mb: 4 }}
          placeholder='company name'
          required
          onChange={e => {
            setUserData({ ...userData, ...{ company: e.target.value } })
            company.onChange(e.target.value)
          }}
          error={Boolean(errors.company)}
          {...(errors.company && { helperText: errors.company.message })}
        />

        <CustomTextField
          fullWidth
          label='Title'
          value={title.value}
          sx={{ mb: 4 }}
          placeholder='title'
          onChange={e => {
            setUserData({ ...userData, ...{ title: e.target.value } })
            title.onChange(e.target.value)
          }}
          error={Boolean(errors.title)}
          {...(errors.title && { helperText: errors.title.message })}
        />

        <CustomTextField
          onChange={e => {
            setUserData({ ...userData, ...{ password: e.target.value } })
            password.onChange(e.target.value)
          }}
          value={password.value}
          fullWidth
          sx={{ mb: 4 }}
          error={Boolean(errors.password)}
          {...(errors.password && { helperText: errors.password.message })}
          label='Password'
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

        <RegisterButton fullWidth type='submit' variant='contained' sx={{ mb: 4 }}>
          Sign up
        </RegisterButton>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Typography sx={{ color: 'text.secondary', mr: 2 }}>Already have an account?</Typography>
          <Typography component={LinkStyled} href='/login'>
            Sign in instead
          </Typography>
        </Box>
        {errorText ? (
          <Typography
            sx={{
              color: 'red',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: 2
            }}
          >
            {errorText}
          </Typography>
        ) : null}
      </form>
    </Box>
  )
}

export default RegisterForm
