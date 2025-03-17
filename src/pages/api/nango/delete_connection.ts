import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '.'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { integrationId, connectionId } = request.body

  if (!integrationId || !connectionId) {
    return response.status(500).json({ ok: false, message: 'Internal server error' })
  }

  try {
    const res = await nango.deleteConnection(integrationId, connectionId)

    if (res.status === 200) {
      return response.status(200).json({ ok: true, message: 'Connection deleted' })
    } else {
      return response.status(500).json({ ok: false, message: 'Internal server error' })
    }
  } catch (error) {
    return response.status(500).json({ ok: false, message: 'Internal server error' })
  }
}
