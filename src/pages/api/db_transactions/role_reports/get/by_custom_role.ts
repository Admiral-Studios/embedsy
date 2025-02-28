import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { roleId } = req.body

  if (!roleId) {
    return res.status(400).json({ message: 'Invalid request: Role id is required' })
  }

  try {
    const getRoleQuery = `
      SELECT rr.report_id
      FROM roles r
      JOIN role_reports rr ON r.id = rr.role_id
      WHERE r.id = ${roleId};`

    const roleQueryResult = await ExecuteQuery(getRoleQuery)

    if (roleQueryResult.length > 0) {
      const reportIds = roleQueryResult[0].map((row: any) => row.report_id)
      res.status(200).json({ reportIds })
    } else {
      res.status(404).json({ message: 'No reports found for the given role' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
