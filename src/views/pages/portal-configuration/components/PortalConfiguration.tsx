import React, { useState } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { styled } from '@mui/material/styles'
import { useEffect } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import StringSetting from './StringSetting'
import DateSetting from './DateSetting'
import LoginLayoutSetting from './LoginLayoutSetting'
import CheckboxSetting from './RadioSetting'
import { useForm } from 'react-hook-form'
import parseISO from 'date-fns/parseISO'
import startOfToday from 'date-fns/startOfToday'
import { useSettings } from 'src/@core/hooks/useSettings'
import { PortalSettingNames, type AppPortalSettings } from 'src/@core/context/settingsContext'
import toast from 'react-hot-toast'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import axios from 'axios'
import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material'
import Icon from 'src/@core/components/icon'
import Switch from 'react-switch'
import ScheduleManager from './ScheduleManager'

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(() => ({
  '& .MuiToggleButton-root': {
    padding: '1px',
    fontSize: '14px',
    letterSpacing: '-0.2px',
    fontWeight: 600,
    borderRadius: '8px !important',
    '&:first-of-type': {
      borderTopRightRadius: '0px !important',
      borderBottomRightRadius: '0px !important'
    },
    '&:last-of-type': {
      borderTopLeftRadius: '0px !important',
      borderBottomLeftRadius: '0px !important'
    }
  }
}))

const StyledCapacityBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(4),
  marginTop: theme.spacing(3)
}))

const schema = yup.object().shape({
  [PortalSettingNames.main_menu_name]: yup.string().required('Main menu name is required'),
  [PortalSettingNames.browser_tab_title]: yup.string().required('Browser tab title is required'),
  [PortalSettingNames.login_layout]: yup.string().required('Login layout is required'),
  [PortalSettingNames.service_principal_client_id]: yup.string().required('Service principal client ID is required'),
  [PortalSettingNames.auth_service_principal_client_id]: yup.string(),
  [PortalSettingNames.service_principal_expiry_date]: yup
    .date()
    .required('Service principal expiry date is required')
    .min(startOfToday(), 'Service principal expiry date must be today or a future date')
    .transform((value, originalValue) => (originalValue ? parseISO(originalValue) : value)),
  [PortalSettingNames.landing_page_title]: yup.string(),
  [PortalSettingNames.landing_page_subtitle]: yup.string(),
  [PortalSettingNames.sender_email]: yup.string().email('Must be a valid email').required('Sender email is required')
})

const PortalConfiguration = () => {
  const { isSuperAdmin } = useAuth()
  const {
    portalSettings,
    appPortalSettings,
    updatePortalSettings,
    powerBIEmbedCapacityActive,
    capacitySchedules,
    setCapacitySchedules,
    capacitySchedulesChanged,
    changeEmbedCapacity
  } = useSettings()
  const [capacities, setCapacities] = useState([])

  const form = useForm({
    defaultValues: appPortalSettings,
    mode: 'onBlur',
    resolver: yupResolver(schema) as any
  })

  const {
    handleSubmit,
    reset,
    formState: { isValid, isDirty, isSubmitting }
  } = form

  useEffect(() => {
    if (!isDirty) {
      reset(appPortalSettings)
    }
  }, [appPortalSettings, isDirty, reset])

  useEffect(() => {
    const getCapacities = async () => {
      const response = await axios.get('/api/powerbi/capacity/get/all')
      if (response.status === 200 && response.data.capacities.length) {
        setCapacities(response.data.capacities)
      }
    }

    getCapacities()
  }, [])

  const checkFormValidity = (values: AppPortalSettings) => {
    if (values[PortalSettingNames.msal_login_active] && !values[PortalSettingNames.auth_service_principal_client_id]) {
      toast.error('Microsoft Authentication Service Principal Client ID is required when Microsoft Login is active')

      return false
    }

    if (!values[PortalSettingNames.power_bi_trial_capacity] && !values[PortalSettingNames.power_bi_capacity_name]) {
      toast.error('You must either select the trial capacity, or use a premium capacity.')

      return false
    }

    return true
  }
  const checkOverlappingTimes = (schedules: any) => {
    const schedulesByDay: { [key: string]: any[] } = {}

    for (const key in schedules) {
      const schedule = schedules[key]
      const day = schedule.day
      if (!schedulesByDay[day]) {
        schedulesByDay[day] = []
      }
      schedulesByDay[day].push(schedule)
    }

    for (const day in schedulesByDay) {
      const daySchedules = schedulesByDay[day]

      for (let i = 0; i < daySchedules.length; i++) {
        const slot = daySchedules[i]
        const currentStart = slot.startTime.split(':').map(Number)
        const currentStartMins = currentStart[0] * 60 + currentStart[1]
        const currentEnd = slot.endTime.split(':').map(Number)
        const currentEndMins = currentEnd[0] * 60 + currentEnd[1]

        if (currentStartMins >= currentEndMins) {
          toast.error('Start time must be earlier than end time for all schedules')

          return true
        }

        for (let j = i + 1; j < daySchedules.length; j++) {
          const otherSlot = daySchedules[j]
          const otherStart = otherSlot.startTime.split(':').map(Number)
          const otherStartMins = otherStart[0] * 60 + otherStart[1]
          const otherEnd = otherSlot.endTime.split(':').map(Number)
          const otherEndMins = otherEnd[0] * 60 + otherEnd[1]

          if (otherStartMins >= otherEndMins) {
            toast.error('Start time must be earlier than end time for all schedules')

            return true
          }

          if (
            (currentStartMins >= otherStartMins && currentStartMins <= otherEndMins) ||
            (otherStartMins >= currentStartMins && otherStartMins <= currentEndMins) ||
            (currentEndMins >= otherStartMins && currentEndMins <= otherEndMins) ||
            (otherEndMins >= currentStartMins && otherEndMins <= currentEndMins)
          ) {
            toast.error('Some days have overlapped scheduled times for capacity. Scheduled times must not overlap.')

            return true
          }
        }
      }
    }

    return false
  }

  const submitHandler = async (values: AppPortalSettings) => {
    try {
      const isFormValid = checkFormValidity(values)
      if (!isFormValid) {
        return
      }

      if (capacitySchedulesChanged && checkOverlappingTimes(capacitySchedules)) {
        return
      }

      const changedPortalSettings = portalSettings.map(item => {
        const valueFieldName = `value_${item.value_type}`

        return {
          ...item,
          [valueFieldName]: values[item.setting]
        }
      })

      await updatePortalSettings(changedPortalSettings)

      toast.success('Portal setting have been successfully updated')
    } catch (error) {
      toast.error('An error occurred while updating portal settings')
    }
  }

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader variant='h6' title='Portal Configuration' />
          <form onSubmit={handleSubmit(submitHandler)} onKeyDown={handleFormKeyDown}>
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <Typography variant='h5'>General</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StringSetting name={PortalSettingNames.main_menu_name} form={form} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StringSetting
                    label='Browser Tab Title'
                    name={PortalSettingNames.browser_tab_title}
                    form={form}
                    required={false}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LoginLayoutSetting name={PortalSettingNames.login_layout} form={form} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StringSetting label='Sender Email Address' name={PortalSettingNames.sender_email} form={form} />
                </Grid>

                {isSuperAdmin && (
                  <>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant='h5'>Portal Service Principal</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StringSetting
                        label='Service Principal Client ID'
                        name={PortalSettingNames.service_principal_client_id}
                        form={form}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StringSetting
                        label='Service Principal Client ID Secret'
                        placeholder='**********'
                        type='password'
                        name={PortalSettingNames.service_principal_secret}
                        form={form}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DateSetting name={PortalSettingNames.service_principal_expiry_date} form={form} />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant='h5'>Users & Authentication</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(form.watch(PortalSettingNames.default_login_active)) || false}
                            onChange={e => {
                              const isDefaultActive = Boolean(form.watch(PortalSettingNames.default_login_active))
                              const isMsalActive = Boolean(form.watch(PortalSettingNames.msal_login_active))

                              if (isDefaultActive && !isMsalActive) {
                                toast.error(
                                  'Before de-selecting a login option, make sure the other one is active, so that portal access is not lost.'
                                )

                                return
                              }

                              form.setValue(PortalSettingNames.default_login_active, e.target.checked, {
                                shouldDirty: true
                              })
                            }}
                          />
                        }
                        label='Default Login'
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(form.watch(PortalSettingNames.msal_login_active)) || false}
                            onChange={e => {
                              const isDefaultActive = Boolean(form.watch(PortalSettingNames.default_login_active))
                              const isMsalActive = Boolean(form.watch(PortalSettingNames.msal_login_active))

                              if (isMsalActive && !isDefaultActive) {
                                toast.error(
                                  'Before de-selecting a login option, make sure the other one is active, so that portal access is not lost.'
                                )

                                return
                              }

                              form.setValue(PortalSettingNames.msal_login_active, e.target.checked, {
                                shouldDirty: true
                              })
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Icon icon='logos:microsoft-icon' fontSize={16} />
                            Microsoft Login
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ pt: '0px !important' }} />
                    {Boolean(form.watch(PortalSettingNames.msal_login_active)) && (
                      <Grid item xs={12} sm={6}>
                        <StringSetting
                          label='Microsoft Authentication Service Principal Client ID'
                          name={PortalSettingNames.auth_service_principal_client_id}
                          form={form}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant='h5'>Landing Page</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StringSetting
                        label='Landing Page Title'
                        name={PortalSettingNames.landing_page_title}
                        form={form}
                        required={false}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StringSetting
                        label='Landing Page Subtitle'
                        name={PortalSettingNames.landing_page_subtitle}
                        form={form}
                        required={false}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CheckboxSetting
                        label='Landing Page Show Create Account'
                        name={PortalSettingNames.landing_page_show_create_account}
                        form={form}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant='h5'>Capacity</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <div style={{ display: 'flex', gap: 2, alignItems: 'center', paddingBottom: 8 }}>
                        <InputLabel>Power BI Capacity</InputLabel>
                        <Tooltip
                          title={
                            <>
                              In order to see the available Power BI capacities & manage them in the portal, follow
                              these{' '}
                              <a
                                href='https://embedsy.io/documentation/installation/capacity_settings'
                                target='_blank'
                                rel='noopener noreferrer'
                                style={{ color: 'inherit', fontWeight: 'bold', textDecoration: 'underline' }}
                              >
                                steps
                              </a>
                              .
                            </>
                          }
                        >
                          <IconButton>
                            <Icon icon='tabler:info-circle' fontSize={20} />
                          </IconButton>
                        </Tooltip>
                      </div>
                      <FormControl fullWidth>
                        <InputLabel>Power BI Capacity</InputLabel>
                        <Select
                          label='Power BI Capacity'
                          value={form.watch(PortalSettingNames.power_bi_capacity_name)}
                          renderValue={() => {
                            return form.watch(PortalSettingNames.power_bi_capacity_name) || ''
                          }}
                          onChange={e => {
                            const selectedCapacity: any = capacities.find((c: any) => c.name === e.target.value)
                            if (selectedCapacity) {
                              form.setValue(PortalSettingNames.power_bi_capacity_name, selectedCapacity.name, {
                                shouldDirty: true
                              })
                              form.setValue(PortalSettingNames.power_bi_capacity_type, selectedCapacity.type, {
                                shouldDirty: true
                              })
                              form.setValue(
                                PortalSettingNames.power_bi_capacity_subscription_id,
                                selectedCapacity.capacity_subscription,
                                { shouldDirty: true }
                              )
                              form.setValue(
                                PortalSettingNames.power_bi_capacity_resource_group_name,
                                selectedCapacity.capacity_resource_group,
                                { shouldDirty: true }
                              )
                              form.setValue(PortalSettingNames.power_bi_trial_capacity, false, { shouldDirty: true })

                              form.setValue(PortalSettingNames.auto_managed_capacity, true, { shouldDirty: true })
                            }
                          }}
                        >
                          {capacities.map((capacity: any) => (
                            <MenuItem key={capacity.name} value={capacity.name}>
                              {`${capacity.name} (${capacity.type_label})`}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {form.watch(PortalSettingNames.power_bi_capacity_name) && (
                        <StyledToggleButtonGroup
                          exclusive
                          value={form.watch(PortalSettingNames.auto_managed_capacity)}
                          onChange={(_, value) => {
                            if (value !== null) {
                              form.setValue(PortalSettingNames.auto_managed_capacity, value, { shouldDirty: true })
                              form.setValue(PortalSettingNames.scheduled_capacity_enabled, false, {
                                shouldDirty: true
                              })
                            }
                          }}
                          sx={{ mt: 2 }}
                          fullWidth
                        >
                          <ToggleButton value={true}>
                            <span>Auto Managed Capacity</span>
                            <Tooltip title='The capacity will turn automatically on/off depending on active users on the platform'>
                              <IconButton>
                                <Icon icon='tabler:info-circle' fontSize={16} />
                              </IconButton>
                            </Tooltip>
                          </ToggleButton>
                          <ToggleButton value={false}>
                            <span>Self Managed Capacity</span>
                            <Tooltip title="The capacity can be started and stopped by admins from the settings, but won't automatically turn itself on/off">
                              <IconButton>
                                <Icon icon='tabler:info-circle' fontSize={16} />
                              </IconButton>
                            </Tooltip>
                          </ToggleButton>
                        </StyledToggleButtonGroup>
                      )}
                      {form.watch(PortalSettingNames.power_bi_capacity_name) &&
                        !form.watch(PortalSettingNames.auto_managed_capacity) && (
                          <StyledCapacityBox>
                            <Switch
                              height={22}
                              width={44}
                              handleDiameter={19}
                              checked={powerBIEmbedCapacityActive}
                              onChange={() => changeEmbedCapacity()}
                              checkedIcon={false}
                              uncheckedIcon={false}
                              onColor='#11955f'
                            />
                            Capacity Status {powerBIEmbedCapacityActive ? '(ON)' : '(OFF)'}
                          </StyledCapacityBox>
                        )}
                      {form.watch(PortalSettingNames.power_bi_capacity_name) &&
                        form.watch(PortalSettingNames.auto_managed_capacity) && (
                          <Grid item xs={12} sx={{ pt: 2 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={Boolean(form.watch(PortalSettingNames.scheduled_capacity_enabled)) || false}
                                  onChange={e => {
                                    form.setValue(PortalSettingNames.scheduled_capacity_enabled, e.target.checked, {
                                      shouldDirty: true
                                    })
                                  }}
                                />
                              }
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <span>Scheduled Capacity</span>
                                  <Tooltip title='All times are in UTC timezone'>
                                    <IconButton>
                                      <Icon icon='tabler:info-circle' fontSize={16} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              }
                            />
                          </Grid>
                        )}
                      {form.watch(PortalSettingNames.auto_managed_capacity) &&
                        form.watch(PortalSettingNames.scheduled_capacity_enabled) && (
                          <ScheduleManager
                            onChange={slots => {
                              setCapacitySchedules(slots)
                            }}
                            value={capacitySchedules}
                          />
                        )}
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(form.watch(PortalSettingNames.power_bi_trial_capacity)) || false}
                            onChange={e => {
                              if (e.target.checked) {
                                form.setValue(PortalSettingNames.power_bi_capacity_name, '', { shouldDirty: true })
                                form.setValue(PortalSettingNames.power_bi_capacity_type, '', { shouldDirty: true })
                                form.setValue(PortalSettingNames.power_bi_capacity_resource_group_name, '', {
                                  shouldDirty: true
                                })
                                form.setValue(PortalSettingNames.power_bi_capacity_subscription_id, '', {
                                  shouldDirty: true
                                })
                                form.setValue(PortalSettingNames.auto_managed_capacity, false, { shouldDirty: true })
                                form.setValue(PortalSettingNames.power_bi_trial_capacity, true, { shouldDirty: true })
                              } else {
                                form.setValue(PortalSettingNames.power_bi_trial_capacity, false, { shouldDirty: true })
                              }
                            }}
                          />
                        }
                        label='Trial Capacity'
                      />
                    </Grid>
                  </>
                )}
              </Grid>

              <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6.5)} !important` }}>
                <Button
                  type='submit'
                  variant='contained'
                  sx={{ mr: 4 }}
                  disabled={!isValid || (!isDirty && !capacitySchedulesChanged) || isSubmitting}
                >
                  Save Changes
                </Button>

                <Button
                  disabled={isSubmitting || (!isDirty && !capacitySchedulesChanged)}
                  onClick={() => reset()}
                  variant='tonal'
                  color='secondary'
                >
                  Reset
                </Button>
              </Grid>
            </CardContent>
          </form>
        </Card>
      </Grid>
    </Grid>
  )
}

PortalConfiguration.acl = {
  action: 'read',
  subject: SubjectTypes.PortalConfiguration
}

export default PortalConfiguration
