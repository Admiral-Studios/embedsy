import { GridColumnVisibilityModel } from '@mui/x-data-grid'
import { csvToDataGrid } from 'src/utils/csvToDataGrid'

type Column = { field: string; headerName: string }
type Row = Record<string, string | number | undefined>

export function csvToHtmlTable(csv: string | null, columnVisibility: GridColumnVisibilityModel): string {
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

  let tableHTML = '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">'

  tableHTML += '<thead><tr>'
  filteredColumns.forEach(column => {
    tableHTML += `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4;">${column.headerName}</th>`
  })
  tableHTML += '</tr></thead>'

  tableHTML += '<tbody>'
  filteredRows.forEach(row => {
    tableHTML += '<tr>'
    columns.forEach(column => {
      const cellValue = row[column.field] ? row[column?.field]?.toString().replace(/\r/g, '') : ''
      tableHTML += `<td style="border: 1px solid #ddd; padding: 8px;">${cellValue}</td>`
    })
    tableHTML += '</tr>'
  })
  tableHTML += '</tbody>'

  tableHTML += '</table>'

  return tableHTML
}
