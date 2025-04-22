import { NextApiRequest, NextApiResponse } from 'next/types'
import { getNango } from 'src/lib/nango'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider, providerConfigKey, oauth } = req.body as {
    provider: string
    providerConfigKey: string
    oauth: { oauth_client_id: string; oauth_client_secret: string; oauth_scopes: string }
  }

  const nango = await getNango()

  if (!nango) {
    return res.status(500).json({ message: 'Nango instance not found' })
  }

  try {
    const response = await nango.createIntegration(provider, providerConfigKey, oauth)

    console.log(response)

    res.status(200).json({ ok: true })
  } catch (error: any) {
    console.log(error.response)
    res.status(400).json({ ok: false, message: error?.response?.data?.error?.message })
  }
}
