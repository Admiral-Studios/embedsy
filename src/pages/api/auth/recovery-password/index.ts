import { NextApiRequest, NextApiResponse } from 'next/types'
import bcrypt from 'bcryptjs'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { newPassword, id } = req.body as { newPassword: string; id: string }

      if (id) {
        const password_hash = bcrypt.hashSync(newPassword, 8)

        const updateQuery = `UPDATE users SET password_hash = '${password_hash}' WHERE id = '${id}';`

        await ExecuteQuery(updateQuery)

        res.status(200).json('Password successfully changed!')
      }
    } catch (error) {
      res.status(403).json({ message: 'Failed to change user' })
    }
  }
}
