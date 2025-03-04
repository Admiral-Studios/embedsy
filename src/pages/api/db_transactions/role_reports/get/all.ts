import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = `SELECT rr.*, r.role FROM role_reports rr
    INNER JOIN roles r
     ON rr.role_id = r.id`

    const dbResult = await ExecuteQuery(query)
    const [innerArray] = dbResult

    for (let i = 0; i < innerArray.length; i++) {
      const datasetQuery = `SELECT last_refresh_date, last_refresh_status FROM datasets WHERE dataset_id = '${innerArray[i].dataset_id}'`
      const [datasetResult] = await ExecuteQuery(datasetQuery)

      if (datasetResult && datasetResult.length > 0) {
        innerArray[i] = { ...innerArray[i], ...datasetResult[0] }
      }
    }

    res.status(200).json(innerArray)
  } catch (error) {
    res.status(403).json({ message: 'Failed to get reports' })
  }
}
