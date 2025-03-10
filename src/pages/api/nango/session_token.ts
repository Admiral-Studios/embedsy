import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '.'

// const result = await nango.getConnection(providerConfigKey, connectionId)

// if (result) return response.status(200).json({ sessionToken: result.connection_config })

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { connectionId, providerConfigKey } = request.body

  if (connectionId || providerConfigKey) {
    const res = await nango.createReconnectSession({
      connection_id: connectionId,
      integration_id: providerConfigKey
    })

    return response.status(200).json({ sessionToken: res.data.token })
  }

  try {
    const res = await nango.createConnectSession({
      end_user: {
        id: '2',
        email: 'admiraldeveloper12@gmail.com'
      },
      allowed_integrations: ['slack']
    })

    return response.status(200).json({ sessionToken: res.data.token })
  } catch (error) {
    return response.status(500).json({ message: 'Internal server error' })
  }
}
