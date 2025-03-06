import { NextApiRequest, NextApiResponse } from 'next/types'
import jwt from 'jsonwebtoken'

import ExecuteQuery from 'src/utils/db'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  let id

  const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.')
  }

  const token = req.cookies.refreshToken

  if (!token) {
    return res.status(403).json({ auth: false, message: 'No token provided' })
  }

  jwt.verify(token, jwtSecret, function (err: any, decoded: any) {
    if (err) {
      return res.status(401).json({ auth: false, message: 'Failed to authenticate token' })
    }
    id = decoded.id
  })

  const query = `SELECT TOP 1 * FROM users WHERE id='${id}'`

  const findUser = await ExecuteQuery(query)

  const viewAsCustomRole = req.cookies.viewAsCustomRole

  if (!findUser[0].length) {
    return res.status(404).json({ message: 'Invalid email or password' })
  }

  const user = findUser[0][0]

  const { data } = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role/get/by_email`, {
    email: user.email
  })

  const { role, role_id, can_refresh, workspaces } = data

  res.status(200).json({
    userData: {
      id: user.id,
      user_name: user.user_name,
      email: user.email,
      company: user.company,
      name: user.name,
      title: user.title,
      role: role,
      role_id: role_id,
      can_refresh: can_refresh,
      custom_role_id: viewAsCustomRole,
      workspaces: workspaces,
      password_set: user.password_hash ? true : false
    }
  })
}
