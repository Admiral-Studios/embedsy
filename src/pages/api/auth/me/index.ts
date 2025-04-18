import { NextApiRequest, NextApiResponse } from 'next/types'
import jwt, { JwtPayload } from 'jsonwebtoken'

import ExecuteQuery from 'src/utils/db'
import axios from 'axios'
import { serializeCookie } from 'src/utils/cookies'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    let id: number | undefined

    const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the environment variables.')
    }

    const accessToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken

    if (!accessToken && !refreshToken) {
      return res.status(204).json({})
    }

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, jwtSecret) as JwtPayload
        id = typeof decoded.id === 'number' ? decoded.id : parseInt(decoded.id, 10)
      } catch (error) {
        if (!refreshToken) {
          return res.status(204).json({})
        }
      }
    }

    if (!id && refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, jwtSecret) as JwtPayload
        id = typeof decoded.id === 'number' ? decoded.id : parseInt(decoded.id, 10)

        if (id) {
          const newAccessToken = jwt.sign({ id }, jwtSecret, { expiresIn: '15m' })

          const accessCookie = serializeCookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 900000,
            path: '/'
          })

          res.setHeader('Set-Cookie', accessCookie)
        }
      } catch (error) {
        return res.status(204).json({})
      }
    }

    if (!id) {
      return res.status(204).json({})
    }

    const query = `SELECT TOP 1 * FROM users WHERE id=@id`

    const findUser = await ExecuteQuery(query, { id })

    const viewAsCustomRole = req.cookies.viewAsCustomRole

    if (!findUser[0].length) {
      return res.status(404).json({ message: 'Invalid email or password' })
    }

    const user = findUser[0][0]

    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role/get/by_email`, {
      email: user.email
    })

    const { role, role_id, can_refresh, can_export, workspaces, iframes, hyperlinks, can_manage_own_account } = data

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
        workspaces: workspaces,
        iframes,
        hyperlinks,
        password_set: user.password_hash ? true : false
      }
    })
  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
