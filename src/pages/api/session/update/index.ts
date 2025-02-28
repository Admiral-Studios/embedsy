import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, currentDuration, loginAt } = req.body
  const currentTime = new Date().toISOString()

  const query = `
    UPDATE user_activity 
    SET 
      session_duration = '${currentDuration}',
      last_ping = '${currentTime}'
    WHERE user_id = '${userId}' 
    AND login_at = '${loginAt}';
  `

  await ExecuteQuery(query)
  res.status(200).json({ success: true })
}
