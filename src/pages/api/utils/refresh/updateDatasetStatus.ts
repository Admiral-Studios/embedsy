import ExecuteQuery from 'src/utils/db'

export async function updateDatasetStatus(
  workspaceId: string,
  datasetId: string,
  status: 'success' | 'failed' | 'unknown',
  lastRefreshDate: Date
) {
  const checkExistenceQuery = `
      SELECT COUNT(*) as count
      FROM datasets
      WHERE dataset_id = '${datasetId}'
    `

  try {
    const [result] = await ExecuteQuery(checkExistenceQuery)
    const exists = result[0].count > 0

    let query
    if (exists) {
      query = `
          UPDATE datasets
          SET last_refresh_date = '${lastRefreshDate}',
              last_refresh_status = '${status}'
          WHERE dataset_id = '${datasetId}'
        `
    } else {
      query = `
          INSERT INTO datasets (dataset_id, last_refresh_date, last_refresh_status)
          VALUES ('${datasetId}', '${lastRefreshDate}', '${status}')
        `
    }

    await ExecuteQuery(query)
    console.log(
      `Refresh for workspace: ${workspaceId}, dataset: ${datasetId} was: ${status}. ${
        exists ? 'Updated' : 'Added new'
      } record.`
    )
  } catch (error) {
    console.error('Error updating database:', error)
  }
}
