import { NextApiRequest, NextApiResponse } from 'next/types'
import { NangoSync } from 'src/context/types'
import { getNango } from 'src/lib/nango'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  const nango = await getNango()

  if (!nango) {
    return res.status(500).json({ message: 'Nango instance not found' })
  }

  const { syncs } = req.body

  if (!syncs) {
    return res.status(400).json({ ok: false, message: 'Missing syncs' })
  }

  const syncsPromises = syncs.map((sync: NangoSync) => {
    if (sync.status === 'PAUSED') {
      return nango.pauseSync('slack', [sync.name])
    } else {
      return nango.startSync('slack', [sync.name])
    }
  })

  try {
    await Promise.all(syncsPromises)

    res.status(200).json({ ok: true, message: 'Syncs updated successfully' })
  } catch (error) {
    console.error(error)
  }
}
