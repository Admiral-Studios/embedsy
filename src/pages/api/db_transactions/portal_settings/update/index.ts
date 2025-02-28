import { NextApiRequest, NextApiResponse } from 'next/types'
import axios from 'axios'

// ** Utils
import ExecuteQuery from 'src/utils/db'

// ** Types
import { PortalSetting } from 'src/@core/context/settingsContext'

// ** Constants
import { nullifyPortalSettingsList } from '../get/all'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const settings = req.body

    if (!settings?.length) {
      return res.status(400).json({ message: 'No settings provided' })
    }

    const trialCapacitySetting = settings.find((s: PortalSetting) => s.setting === 'power_bi_trial_capacity')
    if (trialCapacitySetting?.value_boolean) {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/capacity/manage`, {
          action: 'suspend'
        })
      } catch (error) {
        console.error('Failed to suspend capacity:', error)
      }
    }

    const updatePromises = settings.map(async (item: PortalSetting) => {
      const { id, value_type, value_date, value_string, value_boolean } = item

      let updateSettingQuery = `
        UPDATE portal_settings
        SET updated_at = SYSUTCDATETIME()
      `

      switch (value_type) {
        case 'string':
          updateSettingQuery += `, value_string = '${
            typeof value_string === 'string' ? value_string.replace(/'/g, "''") : value_string
          }'`
          break
        case 'date':
          updateSettingQuery += `, value_date = '${value_date}'`
          break
        case 'boolean':
          updateSettingQuery += `, value_boolean = ${Number(value_boolean)}`
          break
        default:
          throw new Error(`Unsupported value_type: ${value_type}`)
      }

      updateSettingQuery += ` WHERE id = ${id};`

      await ExecuteQuery(updateSettingQuery)

      // Fetch the updated setting from the database
      const updatedSettingQuery = `
        SELECT *
        FROM portal_settings
        WHERE id = ${id};
      `

      const updatedSetting = (await ExecuteQuery(updatedSettingQuery))?.[0]?.[0]

      if (nullifyPortalSettingsList.includes(updatedSetting?.setting)) {
        const valueFieldName = `value_${updatedSetting.value_type}`

        return { ...updatedSetting, [valueFieldName]: null }
      }

      return updatedSetting
    })

    const updatedSettings = await Promise.all(updatePromises)

    const capacitySettingsUpdated = settings.some(
      (setting: PortalSetting) =>
        setting.setting === 'scheduled_capacity_enabled' || setting.setting === 'auto_managed_capacity'
    )

    if (capacitySettingsUpdated) {
      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/cron/setup`)
    }

    res.status(200).json(updatedSettings)
  } catch (error) {
    console.error('Error updating settings:', error)
    res.status(500).json({ message: 'Internal server error', error })
  }
}
