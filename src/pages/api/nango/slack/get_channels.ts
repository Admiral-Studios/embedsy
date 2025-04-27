import { NextApiRequest, NextApiResponse } from 'next/types'
import { getNango } from 'src/lib/nango'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { connectionId } = request.body

  const nango = await getNango()

  if (!nango) {
    return response.status(500).json({ message: 'Nango instance not found' })
  }

  try {
    const data = await nango.listRecords({
      providerConfigKey: 'slack',
      connectionId,
      model: 'SlackChannel'
    })

    return response.status(200).json({ channels: data.records })
  } catch (error) {
    console.error(error)

    return response.status(500).json({ message: 'Failed to get channels', error: error })
  }
}
