import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { PermanentRoles } from 'src/context/types'
import { withRole } from 'src/pages/api/middleware/authMiddleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = `
                SELECT rb.*, r.role 
                FROM role_branding rb
                INNER JOIN roles r ON rb.role_id = r.id;
            `

    const result = await ExecuteQuery(query)

    const formattedResult = result[0].map((item: any) => ({
      ...item,
      id: item.role_id
    }))

    res.status(200).json(formattedResult)
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve role branding data', error: error.message })
  }
}

export default withRole(handler, [PermanentRoles.admin, PermanentRoles.super_admin])
