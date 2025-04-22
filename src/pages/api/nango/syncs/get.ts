import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '../index'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider, connectionId } = req.query as {
    provider: string
    connectionId: string
  }

  try {
    const resp = await nango.syncStatus(provider, '*')

    res.status(200).json({ syncs: resp.syncs })
  } catch (error) {
    console.error(error)

    res.status(500).json({ message: 'Internal server error' })
  }
}
