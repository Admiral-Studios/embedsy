export const csvToDataGrid = (csv: string | null) => {
  if (!csv || typeof csv !== 'string') return { columns: [], rows: [] }

  const lines = csv.trim().split('\n')
  const headers = lines[0].split(',')
  const rows = lines.slice(1)

  const columns = headers.map(field => ({
    field: field.trim().replace(/\s+/g, '_'),
    headerName: field.trim(),
    flex: 1
  }))

  const data = rows.map((line, index) => {
    const values = line.split(',')

    return {
      id: index + 1,
      ...Object.fromEntries(headers.map((key, i) => [key.trim().replace(/\s+/g, '_'), values[i] || '']))
    }
  })

  return { columns, rows: data }
}
