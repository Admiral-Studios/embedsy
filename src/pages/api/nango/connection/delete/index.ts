import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '../../index'
import ExecuteQuery from 'src/utils/db'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { providerConfigKey, connectionId } = request.body

  if (request.method !== 'DELETE') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  if (!providerConfigKey || !connectionId) {
    return response.status(400).json({ ok: false, message: 'Missing required fields' })
  }

  try {
    const nangoResponse = await nango.deleteConnection(providerConfigKey, connectionId)

    if (nangoResponse.status !== 200) {
      return response.status(500).json({ ok: false, message: 'Internal server error' })
    }

    const query = `
      DELETE FROM external_integrations WHERE connection_id = '${connectionId}' AND provider_config_key = '${providerConfigKey}'
    `
    await ExecuteQuery(query)

    return response.status(200).json({ ok: true, message: 'Connection deleted' })
  } catch (error) {
    return response.status(500).json({ ok: false, message: 'Internal server error' })
  }
}
