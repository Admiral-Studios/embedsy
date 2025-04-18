import axios from 'axios'
import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { basicEmailConfiguration } from 'src/configs/emails'
import { createForgotTemplate } from 'src/layouts/email-templates/forgotPassword'

import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the environment variables.')
    }

    const { email } = req.body as {
      email: string
    }

    const roleRes = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role/get/by_email`, {
      method: 'POST',
      body: JSON.stringify({ email })
    })

    const role = await roleRes.json()

    const brandingRes = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role_branding/get/by_role_id?roleId=${role.role_id}`,
      {}
    )

    const branding = await brandingRes.json()

    const query = `SELECT TOP 1 * FROM users WHERE email='${email}'`

    const foundedUser = await ExecuteQuery(query)

    if (!foundedUser[0].length) {
      return res.status(403).json({ message: 'Account with this email not found' })
    }

    if (!foundedUser[0][0].password_hash) {
      return res
        .status(403)
        .json({ message: "Password reset functionality isn't available if you registered with Microsoft" })
    }

    const token = jwt.sign({ email, id: foundedUser[0][0].id }, jwtSecret, { expiresIn: '1h' })

    const magicLink = `${req.headers.origin}/recovery-password?token=${token}`

    const { mainColor, logo, logoWidth } = basicEmailConfiguration(branding)

    await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/email/send`, {
      to: email,
      subject: 'Forgot password?',
      html: createForgotTemplate(magicLink, mainColor, logo, logoWidth)
    })

    res.status(200).json({})
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
