import { NextApiRequest, NextApiResponse } from 'next/types'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import ExecuteQuery from 'src/utils/db'
import { serializeCookie } from 'src/utils/cookies'
import axios from 'axios'

const signToken = (id: number): string => {
  const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.')
  }

  return jwt.sign(
    {
      id
    },
    jwtSecret,
    { expiresIn: '15m' }
  )
}

const signRefreshToken = (id: number): string => {
  const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.')
  }

  return jwt.sign(
    {
      id
    },
    jwtSecret,
    { expiresIn: '7d' }
  )
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body as { email: string; password: string }
  const query = `SELECT TOP 1 * FROM users WHERE email='${email}'`
  const findUser = await ExecuteQuery(query)

  const viewAsCustomRole = req.cookies.viewAsCustomRole

  if (!findUser[0].length) {
    return res.status(404).json({ message: 'Invalid email or password' })
  }
  const user = findUser[0][0]

  const passwordIsValid: boolean = bcrypt.compareSync(password, user.password_hash)

  if (!passwordIsValid) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  if (!user.is_verified) {
    return res.status(401).json({ message: 'User is not verified' })
  }

  const { data } = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role/get/by_email`, {
    email: user.email
  })
  const { role, role_id, can_refresh, can_export, workspaces, iframes, can_manage_own_account, hyperlinks } = data

  const token = signToken(user.id)

  const refreshToken = signRefreshToken(user.id)

  const refreshCookie = serializeCookie('refreshToken', refreshToken, {
    httpOnly: true, // Make it an HttpOnly cookie
    secure: process.env.NODE_ENV === 'production', // Set 'secure' flag for HTTPS
    maxAge: 604800000, // Set an appropriate max age (e.g., 7 days)
    // maxAge: 1000,
    path: '/' // Set the cookie path as needed
  })

  const accessCookie = serializeCookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 900000,
    path: '/'
  })

  res.setHeader('Set-Cookie', [refreshCookie, accessCookie])

  const loginAt = new Date().toISOString().replace('T', ' ').replace('Z', '')

  const loginSessionQuery = `INSERT INTO user_activity (user_id, login_at, session_duration) VALUES ('${
    user.id
  }', '${loginAt}', ${0});`

  await ExecuteQuery(loginSessionQuery)

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
      custom_role_id: viewAsCustomRole,
      workspaces: workspaces,
      can_refresh: can_refresh,
      can_export: can_export,
      can_manage_own_account: !!can_manage_own_account,
      iframes,
      hyperlinks,
      password_set: user.password_hash ? true : false
    }
  })
}
