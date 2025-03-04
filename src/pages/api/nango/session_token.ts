import { NextApiRequest, NextApiResponse } from 'next/types'
import { Nango } from '@nangohq/node'

const nango = new Nango({
  secretKey: process.env.NEXT_PUBLIC_NANGO_SECRET_KEY ? process.env.NEXT_PUBLIC_NANGO_SECRET_KEY : ''
})

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const res = await nango.createConnectSession({
      end_user: {
        id: '160',
        email: 'vlad@embedsy.io'
      },
      allowed_integrations: ['microsoft-teams']
    })

    return response.status(200).json(res.data.token)
  } catch (error) {
    console.log(error)
  }
}
