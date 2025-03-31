import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '.'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { connectionId, providerConfigKey } = request.body

  if (connectionId || providerConfigKey) {
    try {
      const res = await nango.createReconnectSession({
        connection_id: connectionId,
        integration_id: providerConfigKey
      })

      return response.status(200).json({ sessionToken: res.data.token })
    } catch (error) {
      return response.status(500).json({ message: 'Internal server error' })
    }
  }

  try {
    const res = await nango.createConnectSession({
      end_user: {
        id: '3',
        email: 'admiraldeveloper12@gmail.com'
      },
      allowed_integrations: ['slack']
    })

    return response.status(200).json({ sessionToken: res.data.token })
  } catch (error) {
    return response.status(500).json({ message: 'Internal server error' })
  }
}
