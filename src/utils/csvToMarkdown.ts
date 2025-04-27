import { GridColumnVisibilityModel } from '@mui/x-data-grid'
import { csvToDataGrid } from 'src/utils/csvToDataGrid'

type Column = { field: string; headerName: string }
type Row = Record<string, string | number | undefined>

export function csvToMarkdown(
  csv: string | null,
  chunkSize = 3500,
  columnVisibility: GridColumnVisibilityModel
): string[] {
  const { columns, rows }: { columns: Column[]; rows: Row[] } = csvToDataGrid(csv)

  const filteredColumns = columns.filter(({ field }) => columnVisibility[field] !== false)
  const filteredRows = rows.map(row => {
    const newRow = { ...row }

    Object.entries(columnVisibility).forEach(([key, value]) => {
      if (!value) {
        delete newRow[key]
      }
    })

    return newRow
  })

  const headers = filteredColumns.map(col => col.headerName)

  const dataRows: string[][] = filteredRows.map(row =>
    filteredColumns.map(col => {
      const value = row[col.field]

      return value !== undefined && value !== null ? String(value).replace(/\r/g, '') : ''
    })
  )

  const fullTable = [headers, ...dataRows]

  const colWidths = headers.map((_, colIndex) => Math.max(...fullTable.map(row => row[colIndex].length)))

  const formatRow = (row: string[]) => row.map((cell, i) => cell.padEnd(colWidths[i], ' ')).join(' | ')

  const divider = colWidths.map(w => '-'.repeat(w)).join('-|-')

  const formattedRows = [formatRow(headers), divider, ...dataRows.map(row => formatRow(row))]

  const chunks: string[] = []
  let buffer: string[] = []

  for (const row of formattedRows) {
    const nextRow = row + '\n'
    const bufferLength = buffer.join('\n').length + nextRow.length

    if (bufferLength > chunkSize) {
      chunks.push('```\n' + buffer.join('\n') + '\n```')
      buffer = []
    }

    buffer.push(row)
  }

  if (buffer.length > 0) {
    chunks.push('```\n' + buffer.join('\n') + '\n```')
  }

  return chunks
}
