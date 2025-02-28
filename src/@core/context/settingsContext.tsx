// ** React Imports
import { createContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react'

// ** MUI Imports
import { Direction } from '@mui/material'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** ThemeConfig Import
import themeConfig from 'src/configs/themeConfig'

// ** Types Import
import { Skin, Mode, AppBar, Footer, ThemeColor, ContentWidth, VerticalNavToggle } from 'src/@core/layouts/types'
import axios from 'axios'
import useFavicon from 'src/hooks/useFavicon'

export type Settings = {
  skin: Skin
  mode: Mode
  appBar?: AppBar
  footer?: Footer
  navHidden?: boolean // navigation menu
  appBarBlur: boolean
  direction: Direction
  navCollapsed: boolean
  themeColor: ThemeColor
  contentWidth: ContentWidth
  layout?: 'vertical' | 'horizontal'
  lastLayout?: 'vertical' | 'horizontal'
  verticalNavToggleType: VerticalNavToggle
  toastPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

export type CustomBranding = {
  overwrite?: boolean
  main_logo?: string
  main_logo_on_dark?: string
  favicon?: string
  favicon_on_dark?: string
  main_logo_width?: number | string
  favicon_width?: number | string
  main_color?: string
  main_color_on_dark?: string
  loading_spinner?: string
  loading_spinner_on_dark?: string
  loading_spinner_width?: number | string
  powerbi_light_theme?: string
  powerbi_dark_theme?: string
  login_page_image?: string
  registration_page_image?: string
}

export type AppBranding = CustomBranding & {
  appLogo?: string
  appFavicon?: string
  appLoadingSpinner?: string
}

export enum PortalSettingNames {
  main_menu_name = 'main_menu_name',
  login_layout = 'login_layout',
  service_principal_expiry_date = 'service_principal_expiry_date',
  service_principal_client_id = 'service_principal_client_id',
  service_principal_secret = 'service_principal_secret',
  default_login_active = 'default_login_active',
  msal_login_active = 'msal_login_active',
  auth_service_principal_client_id = 'auth_service_principal_client_id',
  power_bi_capacity_name = 'power_bi_capacity_name',
  power_bi_capacity_resource_group_name = 'power_bi_capacity_resource_group_name',
  power_bi_capacity_subscription_id = 'power_bi_capacity_subscription_id',
  power_bi_capacity_type = 'power_bi_capacity_type',
  power_bi_trial_capacity = 'power_bi_trial_capacity',
  landing_page_title = 'landing_page_title',
  landing_page_subtitle = 'landing_page_subtitle',
  landing_page_show_create_account = 'landing_page_show_create_account',
  auto_managed_capacity = 'auto_managed_capacity',
  scheduled_capacity_enabled = 'scheduled_capacity_enabled',
  browser_tab_title = 'browser_tab_title',
  sender_email = 'sender_email'
}

export type PortalSettingValueType = 'string' | 'date' | 'boolean'

export type PortalSetting = {
  id?: number
  user_id?: number
  setting: keyof typeof PortalSettingNames
  value_type: PortalSettingValueType
  value_string?: string | null
  value_date?: string | null
  value_boolean?: boolean
  created_at?: string
  updated_at?: string
}

export type AppPortalSettings = Record<keyof typeof PortalSettingNames, string | boolean | null>

export type PageSpecificSettings = {
  skin?: Skin
  mode?: Mode
  appBar?: AppBar
  footer?: Footer
  navHidden?: boolean // navigation menu
  appBarBlur?: boolean
  direction?: Direction
  navCollapsed?: boolean
  themeColor?: ThemeColor
  contentWidth?: ContentWidth
  layout?: 'vertical' | 'horizontal'
  lastLayout?: 'vertical' | 'horizontal'
  verticalNavToggleType?: VerticalNavToggle
  toastPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}
export type SettingsContextValue = {
  settings: Settings
  appBranding: AppBranding | null
  customBrandingLoaded: boolean
  saveSettings: (updatedSettings: Settings) => void
  powerBIEmbedCapacityActive: boolean
  changeEmbedCapacity: () => void
  powerBICapacityExists: boolean
  isCapacityAutoManaged: boolean
  isCapacityScheduled: boolean
  capacitySchedules: any[]
  capacitySchedulesChanged: boolean
  setCapacitySchedules: (schedules: any[]) => void
  checkAndAutoManageCapacity: () => Promise<void>
} & PortalSettingsContextValue

export type PortalSettingsContextValue = {
  portalSettings: PortalSetting[]
  appPortalSettings: AppPortalSettings
  loadingPortalSettings: boolean
  getPortalSettings: () => Promise<PortalSetting[]>
  updatePortalSettings: (settings: PortalSetting[]) => Promise<void>
}

interface SettingsProviderProps {
  children: ReactNode
  pageSettings?: PageSpecificSettings | void
}

const initialSettings: Settings = {
  themeColor: 'primary',
  mode: themeConfig.mode,
  skin: themeConfig.skin,
  footer: themeConfig.footer,
  layout: themeConfig.layout,
  lastLayout: themeConfig.layout,
  direction: themeConfig.direction,
  navHidden: themeConfig.navHidden,
  appBarBlur: themeConfig.appBarBlur,
  navCollapsed: themeConfig.navCollapsed,
  contentWidth: themeConfig.contentWidth,
  toastPosition: themeConfig.toastPosition,
  verticalNavToggleType: themeConfig.verticalNavToggleType,
  appBar: themeConfig.layout === 'horizontal' && themeConfig.appBar === 'hidden' ? 'fixed' : themeConfig.appBar
}

const initialAppPortalSettings: Partial<AppPortalSettings> = {
  main_menu_name: 'Dashboard',
  landing_page_show_create_account: true,
  login_layout: 'IMAGE LEFT, LOGIN RIGHT',
  landing_page_title: themeConfig.templateName,
  landing_page_subtitle: process.env.NEXT_PUBLIC_LOGIN_MESSAGE
}

const staticSettings = {
  appBar: initialSettings.appBar,
  footer: initialSettings.footer,
  layout: initialSettings.layout,
  navHidden: initialSettings.navHidden,
  lastLayout: initialSettings.lastLayout,
  toastPosition: initialSettings.toastPosition
}

const restoreSettings = (): Settings | null => {
  let settings = null

  try {
    const storedData: string | null = window.localStorage.getItem('settings')

    if (storedData) {
      settings = { ...JSON.parse(storedData), ...staticSettings }
    } else {
      settings = initialSettings
    }
  } catch (err) {
    console.error(err)
  }

  return settings
}

// set settings in localStorage
const storeSettings = (settings: Settings) => {
  const initSettings = Object.assign({}, settings)

  delete initSettings.appBar
  delete initSettings.footer
  delete initSettings.layout
  delete initSettings.navHidden
  delete initSettings.lastLayout
  delete initSettings.toastPosition
  window.localStorage.setItem('settings', JSON.stringify(initSettings))
}

// ** Create Context
const initialSettingsContext = {
  saveSettings: () => null,
  appBranding: null,
  customBrandingLoaded: false,
  settings: initialSettings,
  powerBIEmbedCapacityActive: false,
  changeEmbedCapacity: () => null,
  portalSettings: [],
  appPortalSettings: initialAppPortalSettings as AppPortalSettings,
  loadingPortalSettings: false,
  getPortalSettings: async () => Promise.resolve([] as PortalSetting[]),
  updatePortalSettings: async () => Promise.resolve(),
  powerBICapacityExists: false,
  isCapacityAutoManaged: false,
  isCapacityScheduled: false,
  capacitySchedules: [] as any[],
  setCapacitySchedules: () => null,
  capacitySchedulesChanged: false,
  checkAndAutoManageCapacity: async () => Promise.resolve()
}
export const SettingsContext = createContext<SettingsContextValue>(initialSettingsContext)

export const SettingsProvider = ({ children, pageSettings }: SettingsProviderProps) => {
  // ** Auth Context
  const { user } = useAuth()
  const { id: user_id } = user || {}

  // ** State
  const [settings, setSettings] = useState<Settings>({ ...initialSettings })
  const [customBranding, setCustomBranding] = useState<CustomBranding | null>(null)
  const [customBrandingLoaded, setCustomBrandingLoaded] = useState(false)
  const [powerBIEmbedCapacityActive, setPowerBIEmbedCapacityActive] = useState(false)
  const [loadingChangingCapacity, setLoadingChangingCapacity] = useState(false)
  const [canChangeCapacity, setCanChangeCapacity] = useState(true)
  const [portalSettings, setPortalSettings] = useState<PortalSetting[]>([])
  const [appPortalSettingsLoaded, setAppPortalSettingsLoaded] = useState(false)
  const [loadingPortalSettings, setLoadingPortalSettings] = useState<boolean>(
    initialSettingsContext.loadingPortalSettings
  )
  const [initialCapacitySchedules, setInitialCapacitySchedules] = useState<any[]>([])
  const [capacitySchedules, setCapacitySchedules] = useState<any[]>([])
  const appPortalSettings: AppPortalSettings = useMemo(() => {
    return portalSettings.reduce(
      (acc, item: PortalSetting) => {
        const { setting, value_type } = item
        const valueFieldName = `value_${value_type}` as 'value_date' | 'value_string'

        acc[setting] = (item[valueFieldName] ?? null) as any

        return acc
      },
      { ...initialAppPortalSettings }
    ) as AppPortalSettings
  }, [portalSettings])

  const appLogo = useMemo(() => {
    return settings?.mode === 'light'
      ? customBranding?.main_logo
      : customBranding?.main_logo_on_dark || customBranding?.main_logo
  }, [settings?.mode, customBranding])

  const appFavicon = useMemo(() => {
    return settings?.mode === 'light'
      ? customBranding?.favicon
      : customBranding?.favicon_on_dark || customBranding?.favicon
  }, [settings?.mode, customBranding])

  const appLoadingSpinner = useMemo(() => {
    return settings?.mode === 'light'
      ? customBranding?.loading_spinner
      : customBranding?.loading_spinner_on_dark || customBranding?.loading_spinner
  }, [settings?.mode, customBranding])

  const appBranding = useMemo(() => {
    return { ...customBranding, appLogo: appLogo, appFavicon: appFavicon, appLoadingSpinner: appLoadingSpinner }
  }, [customBranding, appLogo, appFavicon, appLoadingSpinner])

  const powerBICapacityExists = useMemo(() => {
    return appPortalSettings?.power_bi_capacity_name ? true : false
  }, [appPortalSettings])

  const isCapacityAutoManaged = useMemo(() => {
    return appPortalSettings?.auto_managed_capacity === true
  }, [appPortalSettings])

  const isCapacityScheduled = useMemo(() => {
    return appPortalSettings?.scheduled_capacity_enabled === true
  }, [appPortalSettings])

  const capacitySchedulesChanged = useMemo(() => {
    if (!initialCapacitySchedules || !capacitySchedules) return false

    return JSON.stringify(initialCapacitySchedules) !== JSON.stringify(capacitySchedules)
  }, [initialCapacitySchedules, capacitySchedules])

  useFavicon(appBranding?.appFavicon, process.env.NEXT_PUBLIC_FAVICON_PATH || '/images/branding/favicon.png')

  useEffect(() => {
    if (appPortalSettingsLoaded) {
      getCapacitySchedules()
    }
  }, [appPortalSettingsLoaded, isCapacityAutoManaged, isCapacityScheduled])

  useEffect(() => {
    if (appPortalSettingsLoaded && user?.id && powerBICapacityExists && isCapacityAutoManaged) {
      const checkCapacity = async () => {
        await checkAndAutoManageCapacity()
      }

      checkCapacity()
    }
  }, [user?.id, powerBICapacityExists, appPortalSettingsLoaded, isCapacityAutoManaged])

  useEffect(() => {
    const getCustomBranding = async () => {
      try {
        let roleCustomBranding
        if (user) {
          const roleIdToUse = user.custom_role_id || user.role_id
          const response = await axios.get('/api/db_transactions/role_branding/get/by_role_id', {
            params: { roleId: roleIdToUse }
          })
          roleCustomBranding = response.data
        } else {
          const response = await axios.get('/api/db_transactions/role_branding/get/default')
          roleCustomBranding = response.data
        }

        if (roleCustomBranding && roleCustomBranding.overwrite) {
          setCustomBranding(roleCustomBranding)
        } else if (!user) {
          setCustomBranding(null)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setCustomBrandingLoaded(true)
      }
    }

    getCustomBranding()
  }, [user])

  const getCapacitySchedules = async () => {
    const response = await axios.get('/api/db_transactions/portal_settings/get/schedules')
    setInitialCapacitySchedules(response.data)
    setCapacitySchedules(response.data)
  }

  const checkAndAutoManageCapacity = async () => {
    if (!powerBICapacityExists || powerBIEmbedCapacityActive || !isCapacityAutoManaged) return

    try {
      const { data } = await axios.get('/api/session/get_active_users')
      const activeUsers = data.activeUsers

      if (activeUsers === 0) {
        await autoResumePowerBICapacity()
      }
    } catch (error) {
      console.error('Failed to manage capacity:', error)
    }
  }

  const changeEmbedCapacity = async () => {
    if (powerBIEmbedCapacityActive) {
      await suspendPowerBICapacity()
    } else {
      await resumePowerBICapacity()
    }
  }

  const getCapacityDetails = useCallback(async () => {
    if (!powerBICapacityExists) return

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/capacity/details`)
      const state = response.data.state

      switch (state) {
        case 'Active':
        case 'Resumed':
          setPowerBIEmbedCapacityActive(true)
          break
        case 'Resuming':
          setPowerBIEmbedCapacityActive(false)
          setTimeout(() => {
            getCapacityDetails()
          }, 5000)
          break
        case 'Paused':
          setPowerBIEmbedCapacityActive(false)
          break
        case 'Unavailable':
          setCanChangeCapacity(false)
          break
        default:
          break
      }
    } catch (error) {
      setCanChangeCapacity(false)
      setPowerBIEmbedCapacityActive(false)
      console.error(error)
    }
  }, [powerBICapacityExists])

  useEffect(() => {
    if (appPortalSettingsLoaded) {
      getCapacityDetails()
      const interval = setInterval(getCapacityDetails, 300000)

      return () => clearInterval(interval)
    }
  }, [appPortalSettingsLoaded, getCapacityDetails])

  const suspendPowerBICapacity = async () => {
    if (!loadingChangingCapacity && canChangeCapacity) {
      setLoadingChangingCapacity(true)
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/capacity/suspend`)
        setPowerBIEmbedCapacityActive(false)
      } catch (error) {
        setPowerBIEmbedCapacityActive(true)
        console.error(error)
      } finally {
        setLoadingChangingCapacity(false)
      }
    }
  }

  const resumePowerBICapacity = async () => {
    if (!loadingChangingCapacity && canChangeCapacity) {
      setLoadingChangingCapacity(true)
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/capacity/resume`)
        setPowerBIEmbedCapacityActive(true)
      } catch (error) {
        setPowerBIEmbedCapacityActive(false)
        console.error(error)
      } finally {
        setLoadingChangingCapacity(false)
      }
    }
  }

  const autoResumePowerBICapacity = async () => {
    let attempts = 0
    const maxAttempts = 10
    const retryInterval = 5000

    const checkCapacityState = async (): Promise<any> => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/capacity/manage`, {
        action: 'resume'
      })

      if (response.data.newState === 'Active' || response.data.newState === 'Resumed') {
        setPowerBIEmbedCapacityActive(true)

        return true
      }

      if (response.data.newState === 'Resuming' || response.data.newState === 'Pausing') {
        attempts++
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryInterval))

          return checkCapacityState()
        }
      }

      return false
    }

    await checkCapacityState()
  }

  const getPortalSettings: PortalSettingsContextValue['getPortalSettings'] = async () => {
    setLoadingPortalSettings(true)
    try {
      const response = await axios.get('/api/db_transactions/portal_settings/get/all')
      const settingsObj = response?.data

      setPortalSettings(response?.data)
      setAppPortalSettingsLoaded(true)

      return settingsObj
    } catch (error) {
      throw error
    } finally {
      setLoadingPortalSettings(false)
    }
  }

  const updatePortalSettings: PortalSettingsContextValue['updatePortalSettings'] = async (
    settings: PortalSetting[]
  ) => {
    const changedSettings = settings
      .map(item => {
        return { ...item, user_id }
      })
      .filter(item => {
        // Don't update service principal secret if it wasn't changed at portal configuration
        if (item.setting === PortalSettingNames.service_principal_secret && !item.value_string) {
          return false
        }

        return true
      })

    const updatedSettings = (await axios.put(`/api/db_transactions/portal_settings/update`, changedSettings))?.data

    const prevAutoManaged = portalSettings.find(s => s.setting === 'auto_managed_capacity')?.value_boolean
    const newAutoManaged = updatedSettings?.find(
      (s: PortalSetting) => s.setting === 'auto_managed_capacity'
    )?.value_boolean

    if (prevAutoManaged === false && newAutoManaged === true) {
      await autoResumePowerBICapacity()
    }

    if (updatedSettings?.length) {
      setPortalSettings((prevSettings: PortalSetting[]) => {
        return prevSettings.map(item => {
          const updatedSetting = updatedSettings.find((updatedSetting: PortalSetting) => updatedSetting.id === item.id)

          return updatedSetting || item
        })
      })
    }

    if (capacitySchedulesChanged) {
      await axios.put('/api/db_transactions/portal_settings/update/schedules', capacitySchedules)
    }

    await getCapacityDetails()

    if (capacitySchedulesChanged) {
      await getCapacitySchedules()
    }
  }

  useEffect(() => {
    getPortalSettings()
  }, [])

  useEffect(() => {
    const restoredSettings = restoreSettings()

    if (restoredSettings) {
      setSettings({ ...restoredSettings })
    }
    if (pageSettings) {
      setSettings({ ...settings, ...pageSettings })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSettings])

  useEffect(() => {
    if (settings.layout === 'horizontal' && settings.mode === 'semi-dark') {
      saveSettings({ ...settings, mode: 'light' })
    }
    if (settings.layout === 'horizontal' && settings.appBar === 'hidden') {
      saveSettings({ ...settings, appBar: 'fixed' })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.layout])

  const saveSettings = (updatedSettings: Settings) => {
    storeSettings(updatedSettings)
    setSettings(updatedSettings)
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        appBranding,
        customBrandingLoaded,
        saveSettings,
        powerBIEmbedCapacityActive,
        changeEmbedCapacity,
        portalSettings,
        appPortalSettings,
        getPortalSettings,
        updatePortalSettings,
        loadingPortalSettings,
        powerBICapacityExists,
        isCapacityAutoManaged,
        isCapacityScheduled,
        capacitySchedules,
        setCapacitySchedules,
        capacitySchedulesChanged,
        checkAndAutoManageCapacity
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const SettingsConsumer = SettingsContext.Consumer
