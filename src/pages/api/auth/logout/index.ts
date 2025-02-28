import { NextApiRequest, NextApiResponse } from 'next/types'

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    res.setHeader('Set-Cookie', [
      'refreshToken=; HttpOnly; Path=/; Max-Age=0',
      'accessToken=; HttpOnly; Path=/; Max-Age=0',
      'viewAsCustomRole=; HttpOnly; Path=/; Max-Age=0'
    ])
  }
  res.json({})
}
