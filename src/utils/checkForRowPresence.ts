import { GridValidRowModel } from '@mui/x-data-grid'
import isRowDuplicate from './isRowDuplicate'

const checkForRowPresence = (updatedRow: GridValidRowModel, existingRows: GridValidRowModel[]) => {
  for (const row of existingRows) {
    if (updatedRow.id === row.id) continue
    if (isRowDuplicate(updatedRow, row)) {
      return true
    }
  }

  return false
}

export default checkForRowPresence
