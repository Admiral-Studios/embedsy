import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '.'

const listIntegrations = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const response = await nango.listIntegrations()
    res.status(200).json({ integrations: response.configs })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integrations' })
  }
}

export default listIntegrations
