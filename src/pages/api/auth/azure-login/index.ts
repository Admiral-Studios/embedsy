import { NextApiRequest, NextApiResponse } from 'next/types'
import jwt from 'jsonwebtoken'

import ExecuteQuery from 'src/utils/db'
import { serializeCookie } from 'src/utils/cookies'
import axios from 'axios'
import { PermanentRoles } from 'src/context/types'

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

const currentDate = new Date().toISOString().replace('T', ' ').replace('Z', '')

const registerNewUser = async (email: string, user_name: string) => {
  const querySave = `INSERT INTO Users (user_name, email, name, is_verified, created_at, updated_at) VALUES ('${user_name}', '${email}', '${user_name}', '${true}', '${currentDate}', '${currentDate}');`
  await ExecuteQuery(querySave)

  const getGuestRoleQuery = `SELECT TOP 1 id FROM roles WHERE role = '${PermanentRoles.guest}'`
  const guestRoleResult = await ExecuteQuery(getGuestRoleQuery)

  if (!guestRoleResult[0]?.length) {
    throw new Error('Guest role not found')
  }

  const guestRoleId = guestRoleResult[0][0].id

  const assignRoleQuery = `INSERT INTO user_roles (email, role_id) VALUES ('${email}', ${guestRoleId});`
  await ExecuteQuery(assignRoleQuery)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, username } = req.body as { email: string; username: string }
  const query = `SELECT TOP 1 * FROM users WHERE email='${email}'`
  let findUser = await ExecuteQuery(query)

  const viewAsCustomRole = req.cookies.viewAsCustomRole

  if (!findUser[0].length) {
    await registerNewUser(email, username)
    findUser = await ExecuteQuery(query)
  }
  const user = findUser[0][0]

  if (!user.is_verified) {
    return res.status(401).json({ message: 'User is not verified' })
  }

  const { data } = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role/get/by_email`, {
    email: user.email
  })

  const { role, role_id, can_refresh, workspaces, iframes, can_manage_own_account, can_export } = data

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
      can_refresh: can_refresh,
      can_export: can_export,
      can_manage_own_account: !!can_manage_own_account,
      custom_role_id: viewAsCustomRole,
      workspaces: workspaces || [],
      iframes,
      password_set: user.password_hash ? true : false
    }
  })
}
