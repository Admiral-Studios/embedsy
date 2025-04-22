import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { role, can_refresh, can_export, can_manage_own_account } = req.body

    if (role) {
      const canRefresh = can_refresh == null ? 0 : can_refresh ? 1 : 0
      const canManage = can_manage_own_account == null ? 0 : can_manage_own_account ? 1 : 0
      const canExport = can_export == null ? 0 : can_export ? 1 : 0

      const query = `INSERT INTO roles (role, can_refresh, can_export, can_manage_own_account) VALUES ('${role}', ${canRefresh}, ${canExport}, ${canManage}); SELECT SCOPE_IDENTITY() AS id;`

      try {
        const result = await ExecuteQuery(query)
        const roleId = result[0][0].id

        if (roleId) {
          try {
            const brandingResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role_branding/insert`,
              { role_id: roleId }
            )

            if (brandingResponse.status !== 200) {
              res.status(400).json({ message: 'User role inserted successfully. Role branding creation failed' })

              return
            }
          } catch (error) {
            console.error('Error creating role branding:', error)
            res.status(400).json({ message: 'User role inserted successfully. Role branding creation failed' })

            return
          }
        }

        res.status(200).json({
          id: roleId,
          role,
          can_refresh: Boolean(canRefresh),
          can_export: Boolean(canExport),
          can_manage_own_account: Boolean(canManage)
        })
      } catch (error) {
        console.error('Error inserting role:', error)
        res.status(500).json({ message: 'Failed to insert user role' })
      }
    } else {
      res.status(400).json({ message: 'Invalid input data' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
