import { NextApiRequest, NextApiResponse } from 'next/types'
import { getPortalSettingFromDB } from '../../db_transactions/portal_settings/get'
import { PortalSettingNames } from 'src/@core/context/settingsContext'

interface EmailRequest {
  to: string | string[]
  subject: string
  html: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { to, subject, html } = req.body as EmailRequest

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const senderEmailSetting = await getPortalSettingFromDB(PortalSettingNames.sender_email)
    const from = senderEmailSetting?.value_string

    if (!from) {
      return res.status(400).json({ error: 'Sender email not configured' })
    }

    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/email/auth-token`)
    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      throw new Error('Failed to get access token')
    }

    const graphResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${from}/sendMail`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          subject,
          body: {
            contentType: 'HTML',
            content: html
          },
          toRecipients: Array.isArray(to)
            ? to.map(email => ({ emailAddress: { address: email } }))
            : [{ emailAddress: { address: to } }],
          from: {
            emailAddress: {
              address: from
            }
          }
        },
        saveToSentItems: true
      })
    })

    if (!graphResponse.ok) {
      const errorData = await graphResponse.json()
      throw new Error(JSON.stringify(errorData))
    }

    return res.status(200).json({
      message: 'Email sent successfully'
    })
  } catch (error: any) {
    console.error('Error sending email:', error)

    return res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    })
  }
}
