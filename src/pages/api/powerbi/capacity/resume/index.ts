import { NextApiRequest, NextApiResponse } from 'next/types'
import axios from 'axios'
import {
  getPortalCapacitySettingsFromDB,
  getPortalClientSettingsFromDB
} from 'src/pages/api/db_transactions/portal_settings/get'
import { getCapacityAPIVersion, CapacityType } from 'src/utils/powerbi/powerbiCapacityTypes'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  let authenticationToken = request.body.authenticationToken

  if (!authenticationToken) {
    const { client_id, client_secret } = await getPortalClientSettingsFromDB()

    if (!client_id || !client_secret) {
      return response.status(200).json({ message: 'Capacity could not be resumed' })
    }

    authenticationToken = await axios
      .get(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token-management`)
      .then(res => res.data.access_token)
  }

  const capacityDetails = await getPortalCapacitySettingsFromDB()

  if (
    !capacityDetails ||
    !capacityDetails.capacity_type ||
    !capacityDetails.capacity_name ||
    !capacityDetails.capacity_resource_group_name ||
    !capacityDetails.capacity_subscription_id
  ) {
    return response.status(200).json({ message: 'Capacity does not exist' })
  }

  const capacityApiVersion = getCapacityAPIVersion(capacityDetails.capacity_type as CapacityType)

  const resumeUrl = `https://management.azure.com/subscriptions/${capacityDetails.capacity_subscription_id}/resourceGroups/${capacityDetails.capacity_resource_group_name}/providers/Microsoft.${capacityDetails.capacity_type}/capacities/${capacityDetails.capacity_name}/resume?api-version=${capacityApiVersion}`

  try {
    await axios.post(
      resumeUrl,
      {},
      {
        headers: {
          Authorization: `Bearer ${authenticationToken}`
        }
      }
    )

    return response.status(200).json({ message: 'Capacity resumed successfully' })
  } catch (error: any) {
    console.log(error)

    return response.status(error.response?.status || 500).json({ error: 'Failed to resume capacity' })
  }
}
