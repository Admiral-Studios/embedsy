import { NextApiRequest, NextApiResponse } from 'next/types'
import axios from 'axios'

export default async function handler(_: NextApiRequest, response: NextApiResponse) {
  try {
    const appServiceName = process.env.NEXT_PUBLIC_AZURE_APP_SERVICE_NAME
    const portalUpstreamUrl = process.env.NEXT_PUBLIC_PORTAL_UPSTREAM_ADMIN_URL

    const result = await axios.post(
      `${portalUpstreamUrl}/api/status/check_active_status`,
      {
        appServiceName
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!result.data) {
      return response.status(200).json({ active: true })
    }

    return response.status(200).json({ active: result.data.active })
  } catch (error) {
    console.error('Error checking application status:', {
      error: error instanceof Error ? error.message : error,
      appServiceName: process.env.NEXT_PUBLIC_AZURE_APP_SERVICE_NAME,
      portalUpstreamUrl: process.env.NEXT_PUBLIC_PORTAL_UPSTREAM_ADMIN_URL
    })

    return response.status(200).json({
      active: true,
      error: error instanceof Error ? error.message : 'Unknown error occurred while checking application status'
    })
  }
}
