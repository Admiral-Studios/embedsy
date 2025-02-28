import { NextApiRequest, NextApiResponse } from 'next/types'
import { setCookie } from 'src/utils/cookies'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { viewAsCustomRole } = req.body

  if (viewAsCustomRole !== null) {
    setCookie(res, 'viewAsCustomRole', viewAsCustomRole, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',

      // sameSite: 'none',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })
  } else {
    setCookie(res, 'viewAsCustomRole', '', { maxAge: 0, path: '/' })
  }

  res.status(200).json({ message: 'Role updated successfully' })
}
