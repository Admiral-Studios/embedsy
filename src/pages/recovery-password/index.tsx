import { NextPage } from 'next'
import React, { ReactNode, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next/types'

import { Box, Button, CardContent, CardHeader, Grid, IconButton, InputAdornment, Typography } from '@mui/material'

import * as yup from 'yup'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Controller, useForm } from 'react-hook-form'

import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { yupResolver } from '@hookform/resolvers/yup'

interface IProps {
  isValid: boolean
  message: string
  payload: {
    email: string
    id: number
  }
}

interface State {
  showNewPassword: boolean
  showConfirmNewPassword: boolean
}

const defaultValues = {
  newPassword: '',
  confirmNewPassword: ''
}

const schema = yup.object().shape({
  newPassword: yup.string().min(5).required(),
  confirmNewPassword: yup
    .string()
    .min(5)
    .required()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
})

const RecoveryPage: NextPage<IProps> = ({ isValid, payload }) => {
  const { push } = useRouter()

  const [values, setValues] = useState<State>({
    showNewPassword: false,
    showConfirmNewPassword: false
  })

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues, resolver: yupResolver(schema) })

  const goToLogin = () => {
    push('/login')
  }

  const resendRecoveryLink = async () => {
    try {
      await axios.post('/api/auth/forgot-password', { email: payload.email })
      toast.success('Recovery password link resent successfully')
    } catch (error) {
      toast.error('Failed to resend recovery password link. Please try again!')
    }
  }

  const handleClickShowNewPassword = () => {
    setValues({ ...values, showNewPassword: !values.showNewPassword })
  }

  const handleClickShowConfirmNewPassword = () => {
    setValues({ ...values, showConfirmNewPassword: !values.showConfirmNewPassword })
  }

  const onPasswordFormSubmit = async (values: typeof defaultValues) => {
    try {
      await axios.post('/api/auth/recovery-password', { ...values, id: payload.id })
      reset(defaultValues)
      toast.success('Password successfully changed!')
      push('/login')
    } catch (error) {
      toast.error('Failed to change password. Please try again!')
    }
  }

  return (
    <Box className='content-center'>
      <Box
        sx={{
          textAlign: 'center'
        }}
      >
        {isValid ? (
          <>
            <CardHeader title='Change Password' />

            <CardContent sx={{ boxShadow: '10px 2px 10px 3px rgba(0, 0, 0, 0.05)' }}>
              <form onSubmit={handleSubmit(onPasswordFormSubmit)}>
                <Grid container spacing={5} sx={{ mt: 0 }}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='newPassword'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <CustomTextField
                          fullWidth
                          value={value}
                          onChange={onChange}
                          label='New Password'
                          id='input-new-password'
                          placeholder='············'
                          required
                          error={Boolean(errors.newPassword)}
                          type={values.showNewPassword ? 'text' : 'password'}
                          {...(errors.newPassword && { helperText: errors.newPassword.message })}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  edge='end'
                                  onClick={handleClickShowNewPassword}
                                  onMouseDown={e => e.preventDefault()}
                                >
                                  <Icon
                                    fontSize='1.25rem'
                                    icon={values.showNewPassword ? 'tabler:eye' : 'tabler:eye-off'}
                                  />
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='confirmNewPassword'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <CustomTextField
                          fullWidth
                          value={value}
                          onChange={onChange}
                          placeholder='············'
                          label='Confirm New Password'
                          id='input-confirm-new-password'
                          required
                          error={Boolean(errors.confirmNewPassword)}
                          type={values.showConfirmNewPassword ? 'text' : 'password'}
                          {...(errors.confirmNewPassword && { helperText: errors.confirmNewPassword.message })}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton
                                  edge='end'
                                  onMouseDown={e => e.preventDefault()}
                                  onClick={handleClickShowConfirmNewPassword}
                                >
                                  <Icon
                                    fontSize='1.25rem'
                                    icon={values.showConfirmNewPassword ? 'tabler:eye' : 'tabler:eye-off'}
                                  />
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button variant='contained' type='submit' sx={{ mr: 4 }}>
                      Save Changes
                    </Button>
                    <Button type='reset' variant='tonal' color='secondary' onClick={() => reset()}>
                      Reset
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <Icon fontSize='84px' icon='fxemoji:crossmark' />
            <Typography
              component='h2'
              sx={{
                fontSize: '22px',
                marginTop: '16px'
              }}
            >
              Recovery password link expired
            </Typography>
          </>
        )}

        {isValid ? (
          <Button onClick={goToLogin} variant='contained' sx={{ mt: 4 }}>
            Go To Login
          </Button>
        ) : (
          <Button onClick={resendRecoveryLink} variant='contained' sx={{ mt: 4 }}>
            Resend recovery link
          </Button>
        )}
      </Box>
    </Box>
  )
}

export const getServerSideProps: GetServerSideProps = async context => {
  const token = context.query.token

  const protocol = context.req.headers['x-forwarded-proto'] || 'http'
  const origin = context.req.headers.host

  if (token) {
    const response = await fetch(`${protocol}://${origin}/api/auth/check-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    }).then(res => res.json())

    return {
      props: { ...response }
    }
  }

  return {
    props: {
      isValid: false,
      message: 'No token provided'
    }
  }
}

RecoveryPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

RecoveryPage.guestGuard = true

export default RecoveryPage
