import { Nango } from '@nangohq/node'
import { NextApiRequest, NextApiResponse } from 'next/types'

const nango = new Nango({
  secretKey: process.env.NEXT_PUBLIC_NANGO_SECRET_KEY ? process.env.NEXT_PUBLIC_NANGO_SECRET_KEY : ''
})

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const records = await nango.listRecords({
      providerConfigKey: 'microsoft-teams',
      connectionId: '9ccd5782-5cdd-42bc-a461-a5827987e210',
      model: 'User'
    })

    return response.status(200).json(records)
  } catch (error) {
    console.log(error)
  }
}
