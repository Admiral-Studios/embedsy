import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roleId } = req.query as { roleId: string }

  if (!roleId) {
    res.status(400).json({ message: 'Role ID is required' })
    
return
  }

  try {
    let query = `
      SELECT rb.*, r.role
      FROM role_branding rb
      INNER JOIN roles r ON rb.role_id = r.id
      WHERE rb.role_id = ${roleId};
    `

    let result = await ExecuteQuery(query)

    if (result[0]?.length === 0) {
      const adminQuery = `
        SELECT id FROM roles WHERE role = 'admin';
      `
      const adminResult = await ExecuteQuery(adminQuery)

      if (adminResult[0]?.length > 0) {
        const adminRoleId = adminResult[0][0].id
        query = `
          SELECT rb.*, r.role
          FROM role_branding rb
          INNER JOIN roles r ON rb.role_id = r.id
          WHERE rb.role_id = ${adminRoleId};
        `
        result = await ExecuteQuery(query)
      }
    }

    if (result[0]?.length > 0) {
      res.status(200).json(result[0][0])
    } else {
      res.status(200).json(null)
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve role branding data', error: error.message })
  }
}
