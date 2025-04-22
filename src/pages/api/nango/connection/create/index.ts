import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { nango } from '../../index'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, connectionId, connectionUserId, connectionUserEmail, providerConfigKey } = request.body

  if (!userId || !connectionId || !connectionUserId || !connectionUserEmail || !providerConfigKey) {
    return response.status(400).json({ ok: false, message: 'Missing required fields' })
  }

  try {
    const query = `
       SELECT * FROM external_integrations WHERE user_id = '${userId}' AND provider_config_key = '${providerConfigKey}'
     `

    const connections = await ExecuteQuery(query)

    if (connections[0].length) {
      const connectionIds = connections[0].map((item: any) => item.connection_id)

      if (connectionIds.includes(connectionId)) {
        return response.status(400).json({ ok: false, message: 'Connection already exists' })
      }
    }

    const nangoResponse = await nango.createConnectSession({
      end_user: {
        id: process.env.NEXT_PUBLIC_NANGO_USER_ID || '',
        email: process.env.NEXT_PUBLIC_NANGO_USER_EMAIL || ''
      },
      allowed_integrations: [providerConfigKey]
    })

    if (!nangoResponse.data.token) {
      return response.status(400).json({ ok: false, message: 'Nango error' })
    }

    const insertQuery = `
       INSERT INTO external_integrations (user_id, connection_id, connection_user_id, connection_user_email, provider_config_key)
       VALUES ('${userId}', '${connectionId}', '${connectionUserId}', '${connectionUserEmail}', '${providerConfigKey}');
     `

    await ExecuteQuery(insertQuery)

    response.status(200).json({ ok: true, message: 'User added successfully', sessionToken: nangoResponse.data.token })
  } catch (error) {
    console.error('Database error:', error)
    response.status(500).json({ ok: false, message: 'Internal server error' })
  }
}
