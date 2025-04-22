import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '..'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { searchTerm } = req.query as { searchTerm: string }

  try {
    const response = await nango.listProviders(searchTerm ? { search: searchTerm } : {})

    res.status(200).json({ ok: true, providers: response.data })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Failed to fetch providers' })
  }
}
