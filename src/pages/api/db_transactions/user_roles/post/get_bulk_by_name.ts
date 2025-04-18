import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { PermanentRoles } from 'src/context/types'
import { withRole } from 'src/pages/api/middleware/authMiddleware'

async function bulkByNameHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const roleNames: string[] = req.body

    if (!Array.isArray(roleNames) || !roleNames.every(name => typeof name === 'string')) {
      return res.status(400).json({ message: 'Invalid input format. Role names could not be inferred.' })
    }

    const placeholders = roleNames.map((_, index) => `@role${index}`).join(', ')
    const query = `
      SELECT id, role
      FROM roles
      WHERE role IN (${placeholders})
    `

    const params: Record<string, string> = {}
    roleNames.forEach((name, index) => {
      params[`role${index}`] = name
    })

    const dbResult = await ExecuteQuery(query, params)

    if (!dbResult[0].length || (dbResult[0].length === 1 && Object.keys(dbResult[0][0]).length === 0)) {
      return res.status(404).json({ message: 'No roles found matching the provided role names.' })
    }

    const roles = dbResult[0].map((row: { role: string; id: number }) => ({
      roleName: row.role,
      roleId: row.id
    }))

    res.status(200).json(roles)
  } catch (error) {
    console.error('Failed to get role IDs:', error)
    res.status(500).json({ message: 'Failed to generate role IDs for the provided user role names. Upload failed.' })
  }
}

export default withRole(bulkByNameHandler, [PermanentRoles.admin, PermanentRoles.super_admin])
