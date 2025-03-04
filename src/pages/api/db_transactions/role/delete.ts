import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.body
      if (id) {
        const brandingDeleteResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role_branding/delete`,
          { role_id: id }
        )

        if (brandingDeleteResponse.status !== 200) {
          return res.status(500).json({ message: 'Role branding deletion failed' })
        }

        const query = `DELETE FROM roles WHERE id = '${id}'`
        await ExecuteQuery(query)

        res.status(200).json({ message: 'User role deleted successfully' })
      } else {
        res.status(400).json({ message: 'Role ID is required' })
      }
    } catch (error: any) {
      res.status(500).json({ message: 'An error has occured on role deletion.', error: error.message })
    }
  }
}
