import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '..'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { connectionId } = request.body

  try {
    const data = await nango.listRecords({
      providerConfigKey: 'slack',
      connectionId,
      model: 'SlackUser'
    })

    return response.status(200).json({ users: data.records })
  } catch (error) {
    console.error(error)

    return response.status(500).json({ message: 'Failed to get channels', error: error })
  }
}
