import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = `
      SELECT COUNT(*) as count 
      FROM user_activity 
      WHERE last_ping >= DATEADD(MINUTE, -5, GETUTCDATE())
    `
    const result = await ExecuteQuery(query)
    const activeUsers = result[0][0].count

    res.status(200).json({ activeUsers })
  } catch (error) {
    console.error('Failed to get active users:', error)
    res.status(500).json({ error: 'Failed to get active users' })
  }
}
