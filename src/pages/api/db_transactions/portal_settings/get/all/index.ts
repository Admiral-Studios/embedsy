// ** Utils
import ExecuteQuery from 'src/utils/db'

// ** Types
import { NextApiRequest, NextApiResponse } from 'next/types'
import { PortalSettingNames, PortalSetting } from 'src/@core/context/settingsContext'

// ** List of settings that need to have value_string replaced with null
export const nullifyPortalSettingsList: PortalSettingNames[] = [PortalSettingNames.service_principal_secret]

export const getAllPortalSettingsFromDB = async (): Promise<PortalSetting[]> => {
  const getAllSettingsQuery = `
    SELECT * FROM portal_settings;
  `

  const settingsResult = ((await ExecuteQuery(getAllSettingsQuery))?.[0] || []) as PortalSetting[]

  if (settingsResult?.length) {
    const modifiedSettings = settingsResult.map(item => {
      const { setting, value_type } = item

      if (nullifyPortalSettingsList.includes(setting as PortalSettingNames)) {
        const valueFieldName = `value_${value_type}`
        item[valueFieldName as keyof PortalSetting] = null as never
      }

      return item
    })

    return modifiedSettings
  }

  return []
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const settingsResult = await getAllPortalSettingsFromDB()

    if (settingsResult.length > 0) {
      res.status(200).json(settingsResult)
    } else {
      res.status(404).json({ message: 'No settings found' })
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
