import { NextApiRequest, NextApiResponse } from 'next/types'
import axios from 'axios'
import { getPortalCapacitySettingsFromDB } from 'src/pages/api/db_transactions/portal_settings/get'
import { getCapacityAPIVersion, CapacityType } from 'src/utils/powerbi/powerbiCapacityTypes'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const getToken = async () => {
    return axios
      .get(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token-management`)
      .then(res => res.data.access_token)
  }

  const getCapacityDetails = async (token: string, capacityDetails: any) => {
    const capacityApiVersion = getCapacityAPIVersion(capacityDetails.capacity_type as CapacityType)
    const detailsUrl = `https://management.azure.com/subscriptions/${capacityDetails.capacity_subscription_id}/resourceGroups/${capacityDetails.capacity_resource_group_name}/providers/Microsoft.${capacityDetails.capacity_type}/capacities/${capacityDetails.capacity_name}/?api-version=${capacityApiVersion}`

    return axios.get(detailsUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  const manageCapacity = async (action: 'resume' | 'suspend', token: string, capacityDetails: any) => {
    const capacityApiVersion = getCapacityAPIVersion(capacityDetails.capacity_type as CapacityType)
    const manageUrl = `https://management.azure.com/subscriptions/${capacityDetails.capacity_subscription_id}/resourceGroups/${capacityDetails.capacity_resource_group_name}/providers/Microsoft.${capacityDetails.capacity_type}/capacities/${capacityDetails.capacity_name}/${action}?api-version=${capacityApiVersion}`

    return axios.post(
      manageUrl,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
  }

  try {
    const capacityDetails = await getPortalCapacitySettingsFromDB()

    if (
      !capacityDetails ||
      !capacityDetails.capacity_type ||
      !capacityDetails.capacity_name ||
      !capacityDetails.capacity_resource_group_name ||
      !capacityDetails.capacity_subscription_id ||
      !capacityDetails.auto_managed_capacity
    ) {
      return res.status(200).json({ state: 'Unavailable' })
    }

    const token = await getToken()
    const details = await getCapacityDetails(token, capacityDetails)
    const currentState = details.data?.properties?.state

    if (!currentState) {
      return res.status(200).json({ state: 'Unavailable' })
    }

    if (req.method === 'POST') {
      if (req.body.action === 'resume') {
        if (currentState === 'Resuming' || currentState === 'Pausing') {
          return res.status(200).json({ state: currentState, newState: currentState })
        }

        if (currentState !== 'Resumed' && currentState !== 'Active') {
          await manageCapacity('resume', token, capacityDetails)

          return res.status(200).json({
            message: 'Capacity resumed successfully',
            newState: 'Active'
          })
        } else {
          return res.status(200).json({ state: currentState })
        }
      } else if (req.body.action === 'suspend') {
        if (currentState === 'Pausing' || currentState === 'Resuming') {
          return res.status(200).json({ state: currentState, newState: currentState })
        }

        if (currentState !== 'Paused') {
          await manageCapacity('suspend', token, capacityDetails)

          return res.status(200).json({ message: 'Capacity suspended successfully', newState: 'Paused' })
        } else {
          return res.status(200).json({ state: currentState })
        }
      } else {
        return res.status(400).json({ error: 'Invalid action' })
      }
    } else {
      return res.status(200).json({ state: currentState })
    }
  } catch (error: any) {
    console.error(error)

    return res.status(error.response?.status || 500).json({ error: 'Failed to manage capacity' })
  }
}
