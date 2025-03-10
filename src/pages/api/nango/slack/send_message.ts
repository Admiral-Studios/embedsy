import { NextApiRequest, NextApiResponse } from 'next/types'
import { nango } from '..'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  //   const { connectionId, channel, text } = request.body

  console.log('sending message')
  try {
    const resp = await nango.triggerAction('slack', '633e2f64-d180-4825-9d03-30df6eb37a66', 'send-message', {
      channel: 'social',
      text: 'test message 1'
    })

    console.log(resp)

    return response.status(200).json({ message: 'Message sent' })
  } catch (error) {
    console.log(error)

    return response.status(500).json({ message: 'Failed to send message', error: error })
  }
}
