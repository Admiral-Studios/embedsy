import { NextApiRequest, NextApiResponse } from 'next/types'
import bcrypt from 'bcryptjs'

import ExecuteQuery from 'src/utils/db'
import { PermanentRoles } from 'src/context/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, user_name, password, company, title, name } = req.body as {
      email: string
      user_name: string
      password: string
      company: string
      title: string
      name: string
    }

    const query = `SELECT TOP 1 * FROM users WHERE email='${email}'`

    const findUser = await ExecuteQuery(query)

    const password_hash = bcrypt.hashSync(password, 8)

    if (findUser[0].length) {
      return res.status(200).json({ message: 'This email is already is use' })
    }

    const currentDate = new Date().toISOString().replace('T', ' ').replace('Z', '')

    const querySave = `INSERT INTO Users (user_name, email, password_hash, company, name, title, is_verified, created_at, updated_at) VALUES ('${user_name}', '${email}', '${password_hash}', '${company}', '${name}', '${title}', '${true}', '${currentDate}', '${currentDate}');`
    await ExecuteQuery(querySave)

    const getGuestRoleQuery = `SELECT TOP 1 id FROM roles WHERE role = '${PermanentRoles.guest}'`
    const guestRoleResult = await ExecuteQuery(getGuestRoleQuery)

    if (!guestRoleResult?.length) {
      return res.status(404).json({ message: 'Guest role not found' })
    }

    const guestRoleId = guestRoleResult[0][0].id

    const assignRoleQuery = `INSERT INTO user_roles (email, role_id) VALUES ('${email}', ${guestRoleId});`
    await ExecuteQuery(assignRoleQuery)

    res.status(200).json({})
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
