import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '../../index'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider, providerConfigKey, oauth } = req.body as {
    provider: string
    providerConfigKey: string
    oauth: { oauth_client_id: string; oauth_client_secret: string; oauth_scopes: string }
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
