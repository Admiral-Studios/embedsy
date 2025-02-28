import { NextApiRequest, NextApiResponse } from 'next/types'
import jwt from 'jsonwebtoken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.body

  const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.')
  }

  if (!token) {
    return res.status(403).json({ message: 'No token provided!', isValid: false })
  }

  const payload = jwt.decode(token) as { email: string; id: string }

  jwt.verify(token, jwtSecret, function (err: any) {
    if (err) {
      return res.status(401).json({ message: 'Token is expired!', payload, isValid: false })
    }
  })

  return res.status(200).json({ message: `Token is valid!`, payload, isValid: true })
}
