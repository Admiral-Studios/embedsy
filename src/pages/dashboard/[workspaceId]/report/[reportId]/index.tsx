import React, { useEffect, useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import { useAuth } from 'src/hooks/useAuth'

const ReportIdPage = () => {
  const { query, push } = useRouter()
  const { user } = useAuth()
  const [reportId, setReportId] = useState<string | string[] | undefined>(undefined)

  useEffect(() => {
    const checkAccess = () => {
      if (query.reportId && user) {
        const reportId = query.reportId as string
        const hasAccess = user.workspaces?.some(workspace => workspace.reports.includes(reportId))
        if (!hasAccess) {
          push('/')
        }
      }
    }

    checkAccess()

    if (query.reportId && query.reportId !== reportId) {
      setReportId(query.reportId)
    }
  }, [query, user, push])

  const PowerBIIframe = useMemo(
    () => dynamic(() => import('../../../../../views/apps/powerbi/PowerBiIframe').then(iframe => iframe.default)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reportId]
  )

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <PowerBIIframe />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

ReportIdPage.acl = {
  action: 'read',
  subject: SubjectTypes.ReportIdPage
}

export default ReportIdPage
