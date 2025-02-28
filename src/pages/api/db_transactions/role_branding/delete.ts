import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { role_id } = req.body

    if (role_id) {
      try {
        const query = `DELETE FROM role_branding WHERE role_id = '${role_id}'`
        await ExecuteQuery(query)
        res.status(200).json({ message: 'Role branding deleted successfully' })
      } catch (error: any) {
        res.status(500).json({ message: 'Failed to delete role branding', error: error.message })
      }
    } else {
      res.status(400).json({ message: 'Role ID is required for branding deletion' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
