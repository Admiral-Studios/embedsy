import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { withAuth } from 'src/pages/api/middleware/authMiddleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    const user = req.body as {
      email: string
      username: string
      title: string
      name: string
      company: string
      id: string
    }

    const id = user.id

    if (id) {
      const findUserQuery = `SELECT TOP 1 * FROM users WHERE email=@email`

      const userExists = await ExecuteQuery(findUserQuery, { email: user.email })

      const me = userExists[0].find((dbUser: any) => dbUser.id === +id)

      if (userExists[0].length && !me) {
        return res.status(401).json({ message: 'This email is already is use' })
      }

      const query = `UPDATE users SET user_name = @username, email = @email, company = @company, name = @name, title = @title WHERE id = @id;`

      await ExecuteQuery(query, {
        username: user.username,
        email: user.email,
        company: user.company,
        name: user.name,
        title: user.title,
        id
      })

      res.status(200).json(req.body)
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed123' })
  }
}

export default withAuth(handler)
