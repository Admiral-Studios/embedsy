import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '..'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const resp = await nango.syncStatus('slack', '*', '7ac74b64-509b-47e8-98f8-410d58fb5fcf')

    res.status(200).json({ syncs: resp.syncs })
  } catch (error) {
    console.error(error)

    res.status(500).json({ message: 'Internal server error' })
  }
}
