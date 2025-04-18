import ExecuteQuery from 'src/utils/db'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { PortalSettingNames, PortalSetting } from 'src/@core/context/settingsContext'

const basicPortalSettings: PortalSettingNames[] = [
  PortalSettingNames.main_menu_name,
  PortalSettingNames.login_layout,
  PortalSettingNames.auth_service_principal_client_id,
  PortalSettingNames.default_login_active,
  PortalSettingNames.msal_login_active,
  PortalSettingNames.landing_page_title,
  PortalSettingNames.landing_page_subtitle,
  PortalSettingNames.landing_page_show_create_account,
  PortalSettingNames.browser_tab_title
]

export const getBasicPortalSettingsFromDB = async (): Promise<PortalSetting[]> => {
  const placeholders = basicPortalSettings.map((_, index) => `@setting${index}`).join(', ')

  const getBasicSettingsQuery = `
    SELECT * FROM portal_settings
    WHERE setting IN (${placeholders});
  `

  const params: Record<string, string> = {}
  basicPortalSettings.forEach((setting, index) => {
    params[`setting${index}`] = setting
  })

  const settingsResult = ((await ExecuteQuery(getBasicSettingsQuery, params))?.[0] || []) as PortalSetting[]

  return settingsResult
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const settingsResult = await getBasicPortalSettingsFromDB()

    if (settingsResult.length > 0) {
      res.status(200).json(settingsResult)
    } else {
      res.status(404).json({ message: 'No basic settings found' })
    }
  } catch (error) {
    console.error('Error fetching basic settings:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
