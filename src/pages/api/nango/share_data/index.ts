import { NextApiRequest, NextApiResponse } from 'next/types'
import { getNango } from 'src/lib/nango'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { connectionId, provider, body, actionName } = request.body

  const nango = await getNango()

  if (!nango) {
    return response.status(500).json({ message: 'Nango instance not found' })
  }

  try {
    const resp = await nango.triggerAction(provider, connectionId, actionName, body)

    return response.status(200).json({ ...resp, message: 'Message sent successfully' })
  } catch (error: any) {
    console.error(error.data.error)

    return response.status(500).json({ message: 'Failed to send message', error: error })
  }
}
