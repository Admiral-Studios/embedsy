import React, { useEffect, useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import { useAuth } from 'src/hooks/useAuth'
import { preloadPowerBI } from 'src/utils/powerbi/preloadPBI'
import { ReportTypes } from 'src/enums/pageTypes'
import { GetServerSidePropsContext } from 'next/types'
import { ReportType } from 'src/types/types'
import { getReportTypeFromSubRouteBy } from 'src/utils/powerbi/powerbiNavigation'

const ReportIdPage = ({ reportType }: { reportType: ReportType }) => {
  const { query, push } = useRouter()
  const { user } = useAuth()

  const [reportId, setReportId] = useState<string | string[] | undefined>(undefined)

  useEffect(() => {
    const checkAccessAndPreload = async () => {
      if (typeof window !== 'undefined' && query.reportId && query.workspaceId && user) {
        const reportId = query.reportId as string
        const workspaceId = query.workspaceId as string
        const hasAccess = user.workspaces?.some(workspace => workspace.reports.includes(reportId))

        if (!hasAccess) {
          push('/')
        } else {
          await preloadPowerBI(workspaceId, reportId)
        }
      }
    }

    checkAccessAndPreload()

    if (query.reportId && query.reportId !== reportId) {
      setReportId(query.reportId)
    }
  }, [query, user, push])

  const PowerBIIframe = useMemo(
    () => {
      switch (reportType) {
        case ReportTypes.PowerBiPaginatedReport: {
          return dynamic(
            () => import('../../../../../views/apps/powerbi/PaginatedReportIframe').then(iframe => iframe.default),
            { ssr: false }
          )
        }
        case ReportTypes.PowerBiReport:
        default: {
          return dynamic(
            () => import('../../../../../views/apps/powerbi/ReportIframe').then(iframe => iframe.default),
            {
              ssr: false
            }
          )
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reportId, reportType]
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

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { reportType } = ctx.query

  const pageReportType = getReportTypeFromSubRouteBy(reportType as string)

  if (pageReportType) {
    return {
      props: {
        reportType: pageReportType
      }
    }
  }

  return {
    redirect: {
      destination: '/dashboard',
      permanent: false
    }
  }
}

export default ReportIdPage
