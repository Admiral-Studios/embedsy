import { NextApiRequest, NextApiResponse } from 'next/types'
import { getNango } from 'src/lib/nango'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider } = req.query as {
    provider: string
    connectionId: string
  }

  const nango = await getNango()

  if (!nango) {
    return res.status(500).json({ message: 'Nango instance not found' })
  }

  try {
    const resp = await nango.syncStatus(provider, '*')

    res.status(200).json({ syncs: resp.syncs })
  } catch (error) {
    console.error(error)

    res.status(500).json({ message: 'Internal server error' })
  }
}
