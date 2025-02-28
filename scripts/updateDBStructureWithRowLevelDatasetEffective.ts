// Updates DB role_reports table with
// `dataset_id`, `is_effective_identity_required` and `row_level_role` columns.

import ExecuteQuery from './db'

const updateScript = `
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'role_reports' AND COLUMN_NAME = 'dataset_id'
)
BEGIN
    ALTER TABLE role_reports
    ADD dataset_id NVARCHAR(50);
END;

IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'role_reports' AND COLUMN_NAME = 'is_effective_identity_required'
)
BEGIN
    ALTER TABLE role_reports
    ADD is_effective_identity_required BIT;
END;

IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'role_reports' AND COLUMN_NAME = 'row_level_role'
)
BEGIN
    ALTER TABLE role_reports
    ADD row_level_role NVARCHAR(50);
END;
`

const updateDatabaseStructure = async () => {
  try {
    console.log('Updating database structure...')
    await ExecuteQuery(updateScript)
    console.log('Database structure updated successfully')
  } catch (error) {
    console.error('Error updating database structure:', error)
  }
}

updateDatabaseStructure().then(() => {
  return
})
