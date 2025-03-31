import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = request.query

  if (!userId) {
    return response.status(400).json({ ok: false, message: 'Missing required fields' })
  }

  try {
    const query = `
      SELECT * FROM external_integrations WHERE user_id = '${userId}'
    `

    const result = await ExecuteQuery(query)

    const message = result[0].length > 0 ? 'Connection found' : 'Connection not found'

    return response.status(200).json({ ok: true, message, result: result[0] })
  } catch (error) {
    response.status(500).json({ ok: false, message: 'Internal server error' })
  }
}
