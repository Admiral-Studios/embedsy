import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '.'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { id, email, connectionId, providerConfigKey } = request.body

  if (connectionId || providerConfigKey) {
    const result = await nango.getConnection(providerConfigKey, connectionId)

    if (result) return response.status(200).json({ sessionToken: result.connection_config })
  }

  if (!id || !email) {
    return response.status(400).json({ message: 'Missing id or email' })
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
