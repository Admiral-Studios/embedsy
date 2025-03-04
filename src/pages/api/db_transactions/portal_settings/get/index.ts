import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { PortalSetting, PortalSettingNames } from 'src/@core/context/settingsContext'

// Get single portal setting from the database
export const getPortalSettingFromDB = async (setting: string): Promise<PortalSetting> => {
  const getSettingQuery = `
    SELECT * FROM portal_settings
    WHERE setting = '${setting}';
  `

  return (await ExecuteQuery(getSettingQuery))?.[0]?.[0]
}

// Get client ID and client secret from the database
export const getPortalClientSettingsFromDB = async (): Promise<{ client_id: string; client_secret: string }> => {
  const client_id = (await getPortalSettingFromDB(PortalSettingNames.service_principal_client_id))?.value_string

  const client_secret = (await getPortalSettingFromDB(PortalSettingNames.service_principal_secret))?.value_string

  return { client_id, client_secret } as { client_id: string; client_secret: string }
}

export const getPortalCapacitySettingsFromDB = async (): Promise<
  | false
  | {
      capacity_name: string | null | undefined
      capacity_resource_group_name: string | null | undefined
      capacity_subscription_id: string | null | undefined
      capacity_type: string | null | undefined
    }
> => {
  const capacity_name = (await getPortalSettingFromDB(PortalSettingNames.power_bi_capacity_name))?.value_string

  if (!capacity_name) {
    return false
  }

  const capacity_resource_group_name = (
    await getPortalSettingFromDB(PortalSettingNames.power_bi_capacity_resource_group_name)
  )?.value_string

  const capacity_subscription_id = (await getPortalSettingFromDB(PortalSettingNames.power_bi_capacity_subscription_id))
    ?.value_string

  const capacity_type = (await getPortalSettingFromDB(PortalSettingNames.power_bi_capacity_type))?.value_string

  return { capacity_name, capacity_resource_group_name, capacity_subscription_id, capacity_type }
}

// Endpoint to get a single portal setting
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { setting } = req.query

    const settingResult = await getPortalSettingFromDB(setting as string)

    if (settingResult) {
      res.status(200).json(settingResult)
    } else {
      res.status(404).json({ message: 'Setting not found' })
    }
  } catch (error) {
    console.error('Error fetching setting:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
