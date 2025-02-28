import { NextApiRequest, NextApiResponse } from 'next/types'
import axios from 'axios'
import { getPortalCapacitySettingsFromDB } from 'src/pages/api/db_transactions/portal_settings/get'
import { getCapacityAPIVersion, CapacityType } from 'src/utils/powerbi/powerbiCapacityTypes'

export default async function handler(_: NextApiRequest, response: NextApiResponse) {
  const authenticationToken = await axios
    .get(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token-management`)
    .then(res => res.data.access_token)

  const capacityDetails = await getPortalCapacitySettingsFromDB()

  if (
    !capacityDetails ||
    !capacityDetails.capacity_type ||
    !capacityDetails.capacity_name ||
    !capacityDetails.capacity_resource_group_name ||
    !capacityDetails.capacity_subscription_id
  ) {
    return response.status(200).json({ state: 'Unavailable' })
  }

  const capacityApiVersion = getCapacityAPIVersion(capacityDetails.capacity_type as CapacityType)

  const detailsUrl = `https://management.azure.com/subscriptions/${capacityDetails.capacity_subscription_id}/resourceGroups/${capacityDetails.capacity_resource_group_name}/providers/Microsoft.${capacityDetails.capacity_type}/capacities/${capacityDetails.capacity_name}/?api-version=${capacityApiVersion}`

  try {
    const details = await axios.get(detailsUrl, {
      headers: {
        Authorization: `Bearer ${authenticationToken}`
      }
    })

    const currentState = details.data?.properties?.state

    if (!currentState) {
      return response.status(200).json({ state: 'Unavailable' })
    } else {
      return response.status(200).json({ state: currentState })
    }
  } catch (error: any) {
    console.error(error)

    return response.status(error.response?.status || 500).json({ error: 'Failed to get capacity details' })
  }
}
