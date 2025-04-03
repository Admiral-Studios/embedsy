import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '..'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { connectionId, channel, text } = request.body

  try {
    const resp = await nango.triggerAction('slack', connectionId, 'send-message', {
      channel,
      text
    })

    return response.status(200).json({ ...resp, message: 'Message sent successfully' })
  } catch (error: any) {
    console.error(error.data.error)

    return response.status(500).json({ message: 'Failed to send message', error: error })
  }
}
