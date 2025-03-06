// ** React Imports
import React, { useState } from 'react'

// ** MUI Imports
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

// ** Hooks
import { useEffect } from 'react'
import { useAuth } from 'src/hooks/useAuth'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Custom Component Import
import StringSetting from './StringSetting'
import DateSetting from './DateSetting'
import LoginLayoutSetting from './LoginLayoutSetting'
import CheckboxSetting from './RadioSetting'

// ** Third Party Imports
import { useForm } from 'react-hook-form'
import parseISO from 'date-fns/parseISO'
import startOfToday from 'date-fns/startOfToday'

// ** Icon Imports
import { useSettings } from 'src/@core/hooks/useSettings'
import { PortalSettingNames, type AppPortalSettings } from 'src/@core/context/settingsContext'
import toast from 'react-hot-toast'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import axios from 'axios'
import { IconButton, Tooltip } from '@mui/material'
import Icon from 'src/@core/components/icon'

// ** Validation schema
const schema = yup.object().shape({
  [PortalSettingNames.main_menu_name]: yup.string().required('Main menu name is required'),
  [PortalSettingNames.login_layout]: yup.string().required('Login layout is required'),
  [PortalSettingNames.service_principal_client_id]: yup.string().required('Service principal client ID is required'),
  [PortalSettingNames.auth_service_principal_client_id]: yup.string(),
  [PortalSettingNames.service_principal_expiry_date]: yup
    .date()
    .required('Service principal expiry date is required')
    .min(startOfToday(), 'Service principal expiry date must be today or a future date')
    .transform((value, originalValue) => (originalValue ? parseISO(originalValue) : value)),
  [PortalSettingNames.landing_page_title]: yup.string().required('Login page title is required'),
  [PortalSettingNames.landing_page_subtitle]: yup.string().required('Login page subtitle is required')
})

const PortalConfiguration = () => {
  const { isSuperAdmin } = useAuth()
  const { portalSettings, appPortalSettings, updatePortalSettings } = useSettings()
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
      console.log(response)
      if (response.status === 200 && response.data.capacities.length) {
        setCapacities(response.data.capacities)
      }
    }

    getCapacities()
  }, [])

  const submitHandler = async (values: AppPortalSettings) => {
    try {
      const changedPortalSettings = portalSettings.map(item => {
        const valueFieldName = `value_${item.value_type}`

        return {
          ...item,
          [valueFieldName]: values[item.setting]
        }
      })

      await updatePortalSettings(changedPortalSettings)

      toast.success('Portal setting have been successfully updated')
      reset({ ...values, [PortalSettingNames.service_principal_secret]: '' })
    } catch (error) {
      toast.error('An error occurred while updating portal settings')
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Portal Configuration' />
          <form onSubmit={handleSubmit(submitHandler)}>
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={6}>
                  <StringSetting name={PortalSettingNames.main_menu_name} form={form} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LoginLayoutSetting name={PortalSettingNames.login_layout} form={form} />
                </Grid>

                {isSuperAdmin && (
                  <>
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
                    <Grid item xs={12} />
                    <Grid item xs={12} sm={6}>
                      <StringSetting
                        label='Microsoft Authentication Service Principal Client ID'
                        name={PortalSettingNames.auth_service_principal_client_id}
                        form={form}
                      />
                    </Grid>
                    <Grid item xs={12} />
                    <Grid item xs={12} sm={6}>
                      <StringSetting
                        label='Landing Page Title'
                        name={PortalSettingNames.landing_page_title}
                        form={form}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StringSetting
                        label='Landing Page Subtitle'
                        name={PortalSettingNames.landing_page_subtitle}
                        form={form}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CheckboxSetting
                        label='Landing Page Show Create Account'
                        name={PortalSettingNames.landing_page_show_create_account}
                        form={form}
                      />
                    </Grid>
                    <Grid item xs={12} />
                    <Grid item xs={12} sm={6}>
                      <div style={{ display: 'flex', gap: 2, alignItems: 'center', paddingBottom: 8 }}>
                        <InputLabel>Power BI Capacity Name</InputLabel>
                        <Tooltip
                          title={
                            <>
                              In order to see the available Power BI capacities & manage them in the portal, follow
                              these{' '}
                              <a
                                href='https://embedsy.io'
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
                        <InputLabel>Power BI Capacity Name</InputLabel>
                        <Select
                          label='Power BI Capacity Name'
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
                  disabled={!isValid || !isDirty || isSubmitting}
                >
                  Save Changes
                </Button>

                <Button disabled={isSubmitting || !isDirty} onClick={() => reset()} variant='tonal' color='secondary'>
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
