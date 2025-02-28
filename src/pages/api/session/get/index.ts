import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.body as { userId: string }

    const getCreatedSessionQuery = `SELECT TOP 1 * FROM user_activity WHERE user_id='${userId}' ORDER BY login_at DESC;`

    const createdSession = await ExecuteQuery(getCreatedSessionQuery)

    res
      .status(200)
      .json({ sessionDuration: createdSession[0][0].session_duration, loginAt: createdSession[0][0].login_at })
  } catch (error) {
    res.status(401).json({ message: 'Session not found' })
  }
}
