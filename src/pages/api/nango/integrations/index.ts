import { NextApiRequest, NextApiResponse } from 'next/types'
import { getNango } from 'src/lib/nango'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const nango = await getNango()

  if (!nango) {
    return res.status(500).json({ message: 'Nango instance not found' })
  }

  try {
    const response = await nango.listIntegrations()

    res.status(200).json({ ok: true, integrations: response.configs })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Failed to fetch integrations' })
  }
}
