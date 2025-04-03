import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { identifierString } = req.body as { identifierString: string }

      if (!identifierString) {
        return res.status(400).json({ message: 'Identifier string is required' })
      }

      const appServiceName = process.env.NEXT_PUBLIC_AZURE_APP_SERVICE_NAME || ''
      const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET || ''

      const expectedIdentifier = Buffer.from(appServiceName + jwtSecret).toString('base64')

      if (identifierString !== expectedIdentifier) {
        return res.status(401).json({ message: 'Invalid identifier' })
      }

      const countQuery = 'SELECT COUNT(*) as total FROM user_roles'
      const result = await ExecuteQuery(countQuery)

      const totalActiveUsers = result[0][0].total

      res.status(200).json({ totalActiveUsers })
    } catch (error) {
      console.error('Error fetching active users:', error)
      res.status(500).json({ message: 'Failed to get active users count' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
