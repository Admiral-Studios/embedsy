import { NextApiRequest, NextApiResponse } from 'next/types'
import bcrypt from 'bcryptjs'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    try {
      const { password, newPassword, id } = req.body as { password: string; newPassword: string; id: string }

      if (id) {
        const query = `SELECT TOP 1 * FROM users WHERE id='${id}'`
        const findUser = await ExecuteQuery(query)

        const user = findUser[0][0]

        const passwordIsValid: boolean = bcrypt.compareSync(password, user.password_hash)

        if (!passwordIsValid) {
          return res.status(401).json({ message: 'Invalid current password' })
        }

        const password_hash = bcrypt.hashSync(newPassword, 8)

        const updateQuery = `UPDATE users SET password_hash = '${password_hash}' WHERE id = '${id}';`

        await ExecuteQuery(updateQuery)

        res.status(200).json('Password successfully changed!')
      }
    } catch (error) {
      res.status(403).json({ message: 'Failed to delete user' })
    }
  }
}
