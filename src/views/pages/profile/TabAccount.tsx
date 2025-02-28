// ** React Imports
import { useMemo, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Dialog from '@mui/material/Dialog'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormHelperText from '@mui/material/FormHelperText'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import { useController, useForm } from 'react-hook-form'
import * as yup from 'yup'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'

interface Data {
  email?: string
  username?: string
  company?: string
  title?: string
  name?: string
}

const schema = yup.object().shape({
  email: yup.string().email().required(),
  username: yup.string().min(3),
  company: yup.string().required(),
  name: yup.string(),
  title: yup.string()
})

const TabAccount = () => {
  const { user, changeUser, delete: deleteHandler } = useAuth()

  const canManage = user?.can_manage_own_account

  // ** State
  const [open, setOpen] = useState<boolean>(false)
  const [userInput, setUserInput] = useState<string>('yes')
  const [secondDialogOpen, setSecondDialogOpen] = useState<boolean>(false)
  const [isConfirm, setIsConfirm] = useState(false)

  // const [controlledIsDirty, setControlledIsDirty] = useState(true)

  // ** Hooks

  const defaultValues: Data = useMemo(
    () => ({
      email: user?.email || '',
      username: user?.username || '',
      company: user?.company || '',
      title: user?.title || '',
      name: user?.name || ''
    }),
    [user]
  )

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid, isDirty }
  } = useForm({ defaultValues, mode: 'onChange', resolver: yupResolver(schema) as any })

  const { field: email } = useController({
    name: 'email',
    control: control
  })

  const { field: username } = useController({
    name: 'username',
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

  const handleClose = () => setOpen(false)

  const handleSecondDialogClose = () => setSecondDialogOpen(false)

  const submitHandler = (data: Data) => {
    const callback = () => {
      toast.success('Profile details have been successfully updated')
      reset()

      Object.keys(data).forEach(key =>
        setValue(
          key as 'email' | 'username' | 'company' | 'name' | 'title',
          data[key as 'email' | 'username' | 'company' | 'name' | 'title']
        )
      )
    }

    changeUser(data, callback)
  }

  const handleConfirmation = (value: string) => {
    handleClose()
    setUserInput(value)
    setSecondDialogOpen(true)

    if (value === 'yes') {
      deleteHandler()
    }
  }

  return (
    <Grid container spacing={6}>
      {/* Account Details Card */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Profile Details' />
          <form onSubmit={handleSubmit(submitHandler)}>
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label='Username'
                    placeholder='John Doe'
                    value={username.value}
                    onChange={username.onChange}
                    error={Boolean(errors.username)}
                    {...(errors.username && { helperText: errors.username.message })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label='Email'
                    placeholder='john.doe@example.com'
                    value={email.value}
                    onChange={email.onChange}
                    error={Boolean(errors.email)}
                    required
                    {...(errors.email && { helperText: errors.email.message })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label='Company'
                    value={company.value}
                    placeholder='company name'
                    onChange={company.onChange}
                    error={Boolean(errors.company)}
                    required
                    {...(errors.company && { helperText: errors.company.message })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label='Name'
                    value={name.value}
                    placeholder='your name'
                    onChange={name.onChange}
                    error={Boolean(errors.name)}
                    {...(errors.name && { helperText: errors.name.message })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    label='Title'
                    value={title.value}
                    placeholder='your name'
                    onChange={title.onChange}
                    error={Boolean(errors.title)}
                    {...(errors.title && { helperText: errors.title.message })}
                  />
                </Grid>
              </Grid>

              <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6.5)} !important` }}>
                <Button type='submit' variant='contained' sx={{ mr: 4 }} disabled={!isValid || !isDirty}>
                  Save Changes
                </Button>

                <Button onClick={() => reset()} variant='tonal' color='secondary'>
                  Reset
                </Button>
              </Grid>
            </CardContent>
          </form>
        </Card>
      </Grid>
      {/* Delete Account Card */}

      <Grid item xs={12}>
        <Card>
          {canManage ? (
            <>
              <CardHeader title='Delete Account' />

              <CardContent>
                <Box sx={{ mb: 4 }}>
                  <FormControl>
                    <FormControlLabel
                      onChange={() => setIsConfirm(prev => !prev)}
                      label='I confirm my account deactivation'
                      sx={{ '& .MuiTypography-root': { color: 'text.secondary' } }}
                      disabled={!canManage}
                      control={
                        <Checkbox
                          checked={isConfirm}
                          size='small'
                          name='validation-basic-checkbox'
                          sx={true ? { color: 'error.main' } : null}
                        />
                      }
                    />

                    {false && (
                      <FormHelperText
                        id='validation-basic-checkbox'
                        sx={{ mx: 0, color: 'error.main', fontSize: theme => theme.typography.body2.fontSize }}
                      >
                        Please confirm you want to delete account
                      </FormHelperText>
                    )}
                  </FormControl>
                </Box>
                <Button
                  onClick={() => setOpen(true)}
                  variant='contained'
                  color='error'
                  disabled={!isConfirm || !canManage}
                >
                  Delete Account
                </Button>
              </CardContent>
            </>
          ) : (
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color='warning.main'>
                You can't delete this account because your administrator disabled this feature
              </Typography>
            </CardContent>
          )}
        </Card>
      </Grid>

      {/* Deactivate Account Dialogs */}
      <Dialog fullWidth maxWidth='xs' open={open} onClose={handleClose}>
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(6)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Box
            sx={{
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
              '& svg': { mb: 6, color: 'warning.main' }
            }}
          >
            <Icon icon='tabler:alert-circle' fontSize='5.5rem' />
            <Typography>Are you sure you would like to delete your account?</Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button variant='contained' sx={{ mr: 2 }} onClick={() => handleConfirmation('yes')}>
            Yes
          </Button>
          <Button variant='tonal' color='secondary' onClick={() => handleConfirmation('cancel')}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog fullWidth maxWidth='xs' open={secondDialogOpen} onClose={handleSecondDialogClose}>
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(6)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              '& svg': {
                mb: 8,
                color: userInput === 'yes' ? 'success.main' : 'error.main'
              }
            }}
          >
            <Icon fontSize='5.5rem' icon={userInput === 'yes' ? 'tabler:circle-check' : 'tabler:circle-x'} />
            <Typography variant='h4' sx={{ mb: 5 }}>
              {userInput === 'yes' ? 'Deleted!' : 'Cancelled'}
            </Typography>
            <Typography>
              {userInput === 'yes' ? 'Your account deleted successfully.' : 'Deleting Cancelled!!'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button variant='contained' color='success' onClick={handleSecondDialogClose}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default TabAccount
