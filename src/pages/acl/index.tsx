// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

import useSWR from 'swr'
import { SubjectTypes } from 'src/types/acl/subjectTypes'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const ACLPage = () => {
  const { data } = useSWR(`/api/emails/get/by_role?role=super_admin`, fetcher)

  if (!data) return null

  return (
    <Grid container spacing={6}>
      <Grid item md={3} xs={12}></Grid>
      <Grid item md={6} xs={12}>
        <Card>
          <CardHeader title='No role assigned' />
          <CardContent>
            <Typography sx={{ color: 'error.main' }}>
              You have no role assigned yet by your administrator so you can't see any reports yet. Please contact your
              admin,
              {
                <span style={{ fontWeight: 'bold' }}>
                  &nbsp;
                  {data.emails.length > 0 ? data.emails.join(' or ') : data.emails[0]}
                  &nbsp;
                </span>
              }
              and request access to your reports.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item md={3} xs={12}></Grid>
    </Grid>
  )
}

ACLPage.acl = {
  action: 'read',
  subject: SubjectTypes.AclPage
}

export default ACLPage
