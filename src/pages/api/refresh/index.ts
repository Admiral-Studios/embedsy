import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { setCookie } from 'src/utils/cookies'
import ExecuteQuery from 'src/utils/db'

const secret = process.env.NEXT_PUBLIC_JWT_SECRET
const accessTokenExpiresIn = '15m'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const refreshToken = req.cookies.refreshToken

    try {
      if (refreshToken) {
        if (secret) {
          const decoded = jwt.verify(refreshToken, secret) as JwtPayload

          const userExists = await ExecuteQuery(`SELECT TOP 1 * FROM users WHERE id='${decoded.id}'`)

          if (userExists[0][0].id === decoded.id) {
            const accessToken = jwt.sign({ id: decoded.id }, secret, { expiresIn: accessTokenExpiresIn })

            setCookie(res, 'accessToken', accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 900000,
              sameSite: 'lax',
              path: '/'
            })
          } else {
            res.status(403).json({ error: 'User not found' })
          }

          res.json({})
        }
      }
    } catch (error) {
      res.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0')
      res.status(401).json({ error: 'Invalid refresh token' })
    }
  } else {
    res.status(405).end() // Method not allowed
  }
}
