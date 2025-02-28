import { NextApiRequest, NextApiResponse } from 'next/types'
import axios from 'axios'
import { CapacityType, CapacityTypeLabel, getCapacityAPIVersion } from 'src/utils/powerbi/powerbiCapacityTypes'

async function fetchCapacities(subscriptionId: string, token: string): Promise<any[]> {
  const fabricApiVersion = getCapacityAPIVersion(CapacityType.Fabric)
  const powerBIDedicatedApiVersion = getCapacityAPIVersion(CapacityType.PowerBIDedicated)

  const fabricEndpoint = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Fabric/capacities?api-version=${fabricApiVersion}`
  const powerBIDedicatedEndpoint = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.PowerBIDedicated/capacities?api-version=${powerBIDedicatedApiVersion}`

  const [fabricResponse, powerBIDedicatedResponse] = await Promise.all([
    axios.get(fabricEndpoint, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    axios.get(powerBIDedicatedEndpoint, {
      headers: { Authorization: `Bearer ${token}` }
    })
  ])

  const mapCapacities = (response: any, isFabric: boolean) =>
    (response.data.value || []).map((item: any) => ({
      name: item.name,
      type: isFabric ? CapacityType.Fabric : CapacityType.PowerBIDedicated,
      type_label: isFabric ? CapacityTypeLabel.Fabric : CapacityTypeLabel.PowerBIDedicated,
      capacity_api_version: isFabric ? fabricApiVersion : powerBIDedicatedApiVersion,
      capacity_subscription: subscriptionId,
      capacity_resource_group: item.id.includes('resourceGroups/')
        ? item.id.split('resourceGroups/')[1].split('/')[0]
        : ''
    }))

  return [...mapCapacities(fabricResponse, true), ...mapCapacities(powerBIDedicatedResponse, false)]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authenticationToken = await axios
      .get(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token-management`)
      .then(res => res.data.access_token)

    try {
      const subscriptionsResponse = await axios.get(
        'https://management.azure.com/subscriptions?api-version=2020-01-01',
        {
          headers: {
            Authorization: `Bearer ${authenticationToken}`
          }
        }
      )

      if (subscriptionsResponse.status === 200) {
        const capacitiesList: any[] = []

        const subscriptionIds = new Set<string>(subscriptionsResponse.data.value.map((sub: any) => sub.subscriptionId))

        if (process.env.NEXT_PUBLIC_AZURE_RESOURCES_SUBSCRIPTION_ID) {
          subscriptionIds.add(process.env.NEXT_PUBLIC_AZURE_RESOURCES_SUBSCRIPTION_ID)
        }

        for (const subscriptionId of subscriptionIds) {
          const capacities = await fetchCapacities(subscriptionId, authenticationToken)
          capacitiesList.push(...capacities)
        }

        res.status(200).json({ capacities: capacitiesList })
      } else {
        throw new Error('Failed to fetch subscriptions')
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return res.status(204).end()
      }
      throw error
    }
  } catch (error) {
    console.error('Error fetching capacities:', error)
    res.status(500).send('Error fetching capacities')
  }
}
