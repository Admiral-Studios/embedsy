import React, { useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react'
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
import { useTheme } from '@mui/material'
import { usePBITheme } from 'src/hooks/powerbi/usePBITheme'
import { useSettings } from 'src/@core/hooks/useSettings'

const fetcher = (url: string, email: string, datasetId: string, rowLevelRole: string) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, datasetId, rowLevelRole })
  }).then(res => res.json())

const PowerBiIframe = () => {
  const { setReport, report } = useContext(ReportContext) || {}
  const { setReport: setContextReport, initializePagination, setActivePage } = useContext(ReportPagesContext) || {}
  const [isLoaded, setIsLoaded] = useState(false)
  const [isDisplayed, setDisplay] = useState(false)
  const [darkThemeConfig, setDarkThemeConfig] = useState(null)
  const [lightThemeConfig, setLightThemeConfig] = useState(null)
  const tokenManagerInitialized = useRef(false)
  const currentReportId = useRef<any>('')

  const { query } = useRouter()
  const { user } = useAuth()
  const theme = useTheme()
  const { appBranding } = useSettings()

  const { workspaceId, reportId, datasetId, rowLevelRole } = useMemo(() => {
    const workspaceIndex =
      typeof query.workspaceId === 'string' && user
        ? user.workspaces?.findIndex(workspace => workspace.workspaceID === query.workspaceId)
        : 0
    const reportIndex =
      typeof query.reportId === 'string' && user ? user.workspaces?.[workspaceIndex].reports.indexOf(query.reportId) : 0

    return {
      workspaceId: query.workspaceId as string,
      reportId: query.reportId as string,
      datasetId: user?.workspaces?.[workspaceIndex].datasets[reportIndex],
      rowLevelRole: user?.workspaces?.[workspaceIndex].rowLevelRoles[reportIndex]
    }
  }, [query.workspaceId, query.reportId, user])

  const { data } = useSWR<PowerBICredentials>(
    [`/api/powerbi?reportId=${reportId}&workspaceId=${workspaceId}`, user?.email, datasetId, rowLevelRole],
    ([url, email, datasetId, rowLevelRole]: [string, string, string, string]) =>
      fetcher(url, email, datasetId, rowLevelRole),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      dedupingInterval: 10000
    }
  )

  useEffect(() => {
    const fetchThemes = async () => {
      if (appBranding?.powerbi_dark_theme) {
        try {
          const response = await fetch(appBranding.powerbi_dark_theme)
          const data = await response.json()
          setDarkThemeConfig(data)
        } catch (error) {
          console.error('Error fetching dark theme:', error)
        }
      }
      if (appBranding?.powerbi_light_theme) {
        try {
          const response = await fetch(appBranding.powerbi_light_theme)
          const data = await response.json()
          setLightThemeConfig(data)
        } catch (error) {
          console.error('Error fetching light theme:', error)
        }
      }
    }
    fetchThemes()
  }, [appBranding])

  usePBITheme({ darkThemeConfig, lightThemeConfig })

  const initializeToken = useCallback(async () => {
    if (report && !tokenManagerInitialized.current && reportId !== currentReportId.current) {
      tokenManagerInitialized.current = true
      currentReportId.current = reportId

      await initializeTokenManager(
        report,
        reportId,
        workspaceId,
        user?.email as string,
        datasetId as string,
        rowLevelRole as string
      )

      if (initializePagination) {
        initializePagination(report, query.page as string)
      }
    }
  }, [report, reportId, workspaceId, user?.email, datasetId, rowLevelRole, initializePagination, query.page])

  useEffect(() => {
    initializeToken()

    return () => {
      if (tokenManagerInitialized.current) {
        stopTokenManager()
      }
    }
  }, [initializeToken, reportId])

  useEffect(() => {
    if (report && query && setActivePage) {
      setActivePage(query.page as string)
    }
  }, [report, query.page, setActivePage])

  useEffect(() => {
    setDisplay(true)

    return () => setDisplay(false)
  }, [])

  const handleLoaded = useCallback(() => {
    setIsLoaded(true)
  }, [])

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

  const powerBiConfig = useMemo(
    () => ({
      type: 'report',
      id: reportId,
      accessToken: data?.reportToken,
      tokenType: models.TokenType.Embed,
      pageName: query.page ? query.page : undefined,
      theme: {
        themeJson: theme.palette.mode === 'dark' ? darkThemeConfig || {} : lightThemeConfig || {}
      },
      settings: {
        navContentPaneEnabled: false,
        layoutType: models.LayoutType.Master
      }
    }),
    [reportId, data?.reportToken, query.page, theme.palette.mode, darkThemeConfig, lightThemeConfig]
  )

  if (!data) return null

  return (
    <div className='power-bi-iframe'>
      <div
        style={
          !isLoaded
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
        <img
          src={appBranding?.appLoadingSpinner || '/images/branding/spinner.gif'}
          alt='spinner'
          width={appBranding?.loading_spinner_width || process.env.NEXT_PUBLIC_SPINNER_WIDTH || 100}
        />
      </div>
      <div
        style={isLoaded ? { flex: 1, display: 'flex', flexDirection: 'column' } : { visibility: 'hidden', height: 0 }}
      >
        <div style={isDisplayed ? { flex: 1, display: 'flex', flexDirection: 'column' } : { display: 'none' }}>
          <PowerBIEmbed
            embedConfig={powerBiConfig}
            eventHandlers={new Map([['loaded', handleLoaded]])}
            cssClassName={'power-bi-iframe'}
            getEmbeddedComponent={getEmbeddedComponent}
          />
        </div>
      </div>
    </div>
  )
}

export default PowerBiIframe
