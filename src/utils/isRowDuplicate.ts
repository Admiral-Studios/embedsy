import { GridValidRowModel } from '@mui/x-data-grid'

const isRowDuplicate = (updatedRow: GridValidRowModel, existingRow: GridValidRowModel) => {
  const acceptedKeys = [
    'role',
    'can_refresh',
    'can_export',
    'workspace',
    'report',
    'row_level_role',
    'email',
    'preview_pages'
  ]

  for (const key of acceptedKeys) {
    if (key in updatedRow || key in existingRow) {
      if (updatedRow[key] !== existingRow[key]) {
        return false
      }
    }
  }

  return true
}

export default isRowDuplicate
