import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '..'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const records = await nango.listRecords({
      providerConfigKey: 'slack',
      connectionId: '633e2f64-d180-4825-9d03-30df6eb37a66',
      model: 'SlackChannel'
    })

    return response.status(200).json({ channels: records })
  } catch (error) {
    console.log(error)

    return response.status(500).json({ message: 'Failed to get channels', error: error })
  }
}
