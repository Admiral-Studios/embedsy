import { Nango } from '@nangohq/node'
import ExecuteQuery from 'src/utils/db'

let nangoInstance: Nango | null = null

export const getNango = async (): Promise<Nango | null> => {
  if (nangoInstance) return nangoInstance

  try {
    const getSettingQuery = `
    SELECT * FROM portal_settings
    WHERE setting IN ('nango_secret_key');
  `
    const data = await ExecuteQuery(getSettingQuery)
    const secretKey = data[0].find((item: any) => item.setting === 'nango_secret_key')?.value_string

    if (!secretKey) throw new Error('Nango secret key not found')

    nangoInstance = new Nango({ secretKey })

    return nangoInstance
  } catch (error) {
    console.error(error)

    return null
  }
}
