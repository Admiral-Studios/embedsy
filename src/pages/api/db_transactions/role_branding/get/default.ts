import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' })
    
return
  }

  try {
    const adminRoleQuery = `
      SELECT id FROM roles WHERE role = 'admin';
    `
    const adminRoleResult = await ExecuteQuery(adminRoleQuery)

    if (adminRoleResult[0]?.length === 0) {
      res.status(404).json({ message: 'Admin role not found' })
      
return
    }

    const adminRoleId = adminRoleResult[0][0].id

    const roleBrandingQuery = `
      SELECT rb.*, r.role
      FROM role_branding rb
      INNER JOIN roles r ON rb.role_id = r.id
      WHERE rb.role_id = ${adminRoleId};
    `
    const roleBrandingResult = await ExecuteQuery(roleBrandingQuery)

    if (roleBrandingResult[0]?.length > 0) {
      res.status(200).json(roleBrandingResult[0][0])
    } else {
      res.status(404).json({ message: 'Default role branding not found' })
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve default role branding data', error: error.message })
  }
}
