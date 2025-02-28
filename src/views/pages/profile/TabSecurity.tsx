// ** React Imports
// ** MUI Imports

import Grid from '@mui/material/Grid'

import ChangePasswordCard from './components/ChangePasswordCard'

const TabSecurity = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ChangePasswordCard />
      </Grid>
    </Grid>
  )
}
export default TabSecurity
