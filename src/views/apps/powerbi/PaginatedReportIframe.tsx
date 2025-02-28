import React, { useContext, useEffect, useMemo, useCallback, useRef } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import * as pbi from 'powerbi-client'
import { PowerBIEmbed } from 'powerbi-client-react'
import { models } from 'powerbi-client'
import { PowerBICredentials } from 'src/types/apps/powerbiTypes'
import { ReportContext } from 'src/context/ReportContext'
import { initializeTokenManager, stopTokenManager } from 'src/utils/powerbi/powerbiRefresh'
import { ReportPagesContext } from 'src/context/ReportPagesContext'
import { ReportTypes } from 'src/enums/pageTypes'

const fetcher = (url: string, email: string) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  }).then(res => res.json())

const PowerBiIframe = () => {
  const { setReport, report } = useContext(ReportContext) || {}
  const { setReport: setContextReport, initializePagination } = useContext(ReportPagesContext) || {}
  const tokenManagerInitialized = useRef(false)
  const currentReportId = useRef<any>('')

  const { query } = useRouter()
  const { user } = useAuth()

  const workspaceId = query.workspaceId as string

  const reportId = query.reportId as string

  const { data, isLoading } = useSWR<PowerBICredentials>(
    [
      `/api/powerbi?reportId=${reportId}&workspaceId=${workspaceId}&reportType=${ReportTypes.PowerBiPaginatedReport}`,
      user?.email
    ],
    ([url, email]: [string, string, string, string]) => fetcher(url, email),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      dedupingInterval: 10000
    }
  )

  const initializeToken = useCallback(async () => {
    if (report && !tokenManagerInitialized.current && reportId !== currentReportId.current) {
      tokenManagerInitialized.current = true
      currentReportId.current = reportId

      await initializeTokenManager(
        report,
        reportId,
        workspaceId,
        user?.email as string,
        '',
        '',
        ReportTypes.PowerBiPaginatedReport
      )

      if (initializePagination) {
        initializePagination(report, query.page as string)
      }
    }
  }, [report, reportId, workspaceId, user?.email, initializePagination, query.page])

  useEffect(() => {
    initializeToken()

    return () => {
      if (tokenManagerInitialized.current) {
        stopTokenManager()
      }
    }
  }, [initializeToken, reportId])

  const getEmbeddedComponent = useCallback(
    (embeddedReport: any) => {
      if (setReport && embeddedReport && setContextReport) {
        if (embeddedReport.config.id !== (report as any)?.config.id) {
          setReport(embeddedReport as pbi.Report)
          setContextReport(embeddedReport as pbi.Report)
        }
      }
    },
    [setReport, setContextReport, report]
  )

  const powerBiConfig = useMemo(() => {
    return {
      type: 'report',
      id: reportId,
      groupId: workspaceId,
      accessToken: data?.reportToken,
      embedUrl: data?.embedUrl,
      tokenType: models.TokenType.Embed,
      settings: {
        commands: {
          parameterPanel: {
            enabled: true,
            expanded: true
          }
        }
      }
    }
  }, [reportId, data?.reportToken, query.page])

  if (!data) return null

  return (
    <div className='power-bi-iframe'>
      <div
        style={
          isLoading
            ? {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }
            : { display: 'none' }
        }
      >
        <img src={'/images/branding/spinner.gif'} alt='spinner' width={process.env.NEXT_PUBLIC_SPINNER_WIDTH || 100} />
      </div>
      <div
        style={!isLoading ? { flex: 1, display: 'flex', flexDirection: 'column' } : { visibility: 'hidden', height: 0 }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <PowerBIEmbed
            embedConfig={powerBiConfig}
            cssClassName={'power-bi-iframe'}
            getEmbeddedComponent={getEmbeddedComponent}
          />
        </div>
      </div>
    </div>
  )
}

export default PowerBiIframe
