import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '..'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { connectionId, channel, text } = request.body

  console.log('sending message')
  try {
    const resp = await nango.triggerAction('slack', connectionId, 'send-message', {
      channel,
      text
    })

    console.log(resp?.data)

    return response.status(200).json({ message: 'Message sent' })
  } catch (error: any) {
    console.log(error.data.error)

    return response.status(500).json({ message: 'Failed to send message', error: error })
  }
}
