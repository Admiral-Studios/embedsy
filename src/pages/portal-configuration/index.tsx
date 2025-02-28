// Components
import Grid from '@mui/material/Grid'
import PortalConfiguration from 'src/views/pages/portal-configuration/components/PortalConfiguration'

const PortalConfigurationPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PortalConfiguration />
      </Grid>
    </Grid>
  )
}

export default PortalConfigurationPage
