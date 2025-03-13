import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '..'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { connectionId } = request.body

  try {
    const records = await nango.listRecords({
      providerConfigKey: 'slack',
      connectionId,
      model: 'SlackChannel'
    })

    return response.status(200).json({ channels: records })
  } catch (error) {
    console.log(error)

    return response.status(500).json({ message: 'Failed to get channels', error: error })
  }
}
