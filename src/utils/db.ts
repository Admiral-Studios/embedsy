import sql, { ConnectionPool, Request, VarChar } from 'mssql'
import * as process from 'process'

export const dbConfig: any = {
  user: process.env.NEXT_PUBLIC_DB_USER,
  password: process.env.NEXT_PUBLIC_DB_PASS,
  server: process.env.NEXT_PUBLIC_DB_HOST,
  database: process.env.NEXT_PUBLIC_DN_NAME,
  options: {
    encrypt: true,
    enableArithAbort: true
  }
}

export default async function ExecuteQuery(query: string): Promise<any> {
  try {
    const pool: ConnectionPool = await sql.connect(dbConfig)
    const request: Request = pool.request()
    request.input('input_parameter', VarChar, 'value') // Add this line if you have parameters in your query.

    const result = await request.query(query)

    return result.recordsets
  } catch (error) {
    console.error(error)
    throw error
  }
}
