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
import { preloadThemes } from 'src/utils/powerbi/preloadPBI'
import { ReportTypes } from 'src/enums/pageTypes'
import { exportVisual } from 'src/utils/powerbi/exportVisual'
import { takeSnapshotCustomCommand } from 'src/utils/powerbi/takeSnapshotCustomCommand'
import { powerBiConfigSettings } from 'src/configs/powerbi'
import toast from 'react-hot-toast'
import VisualModal from 'src/components/shared/Powerbi/VisualModal'

const fetcher = (url: string, email: string, datasetId: string, rowLevelRole: string) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, datasetId, rowLevelRole })
  }).then(res => res.json())

const PowerBiIframe = () => {
  const { setReport, report, isFullscreen, setIframeLoaded } = useContext(ReportContext) || {}
  const { setReport: setContextReport, initializePagination, setActivePage } = useContext(ReportPagesContext) || {}
  const [isLoaded, setIsLoaded] = useState(false)
  const [isDisplayed, setDisplay] = useState(false)
  const [darkThemeConfig, setDarkThemeConfig] = useState(null)
  const [lightThemeConfig, setLightThemeConfig] = useState(null)
  const [isPageChangingFromReport, setIsPageChangingFromReport] = useState(false)
  const [isThemeInitialized, setIsThemeInitialized] = useState(false)
  const [visualData, setVisualData] = useState<{ url: any; visualName: string } | null>(null)

  const tokenManagerInitialized = useRef(false)
  const currentReportId = useRef<any>('')
  const currentPageRef = useRef<string | undefined>(undefined)

  const { query, push, pathname } = useRouter()
  const { user } = useAuth()
  const theme = useTheme()
  const { appBranding, appPortalSettings } = useSettings()

  const isTakeSnapshotEnabled = Boolean(appPortalSettings.power_bi_snapshot_extension)

  useEffect(() => {
    const preloadReportThemes = async () => {
      if (appBranding?.powerbi_dark_theme || appBranding?.powerbi_light_theme) {
        await preloadThemes(appBranding?.powerbi_dark_theme, appBranding?.powerbi_light_theme)
      }
    }

    preloadReportThemes()
  }, [appBranding])

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
    [
      `/api/powerbi?reportId=${reportId}&workspaceId=${workspaceId}&reportType=${ReportTypes.PowerBiReport}`,
      user?.email,
      datasetId,
      rowLevelRole
    ],
    ([url, email, datasetId, rowLevelRole]: [string, string, string, string]) =>
      fetcher(url, email, datasetId, rowLevelRole),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      dedupingInterval: 60000
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

  useEffect(() => {
    if (report && !isThemeInitialized) {
      const initializeTheme = async () => {
        const currentTheme = theme.palette.mode === 'dark' ? darkThemeConfig : lightThemeConfig
        if (currentTheme) {
          try {
            await report.applyTheme({ themeJson: currentTheme })
            setIsThemeInitialized(true)
          } catch (error) {
            console.error('Error initializing theme:', error)
          }
        }
      }

      const initializeSnapshotTrigger = async (
        event: pbi.service.ICustomEvent<{
          command: string
          visual: {
            name: string
          }
          page: {
            name: string
          }
        }>
      ) => {
        if (event?.detail?.command === 'snapshot') {
          const exportPromise = exportVisual(
            workspaceId,
            reportId,
            'PNG',
            event.detail.visual.name,
            event.detail.page.name
          )

          const visualData = await toast.promise(exportPromise, {
            loading: 'Loading snapshot',
            success: 'Successfully',
            error: 'Snapshot loading error'
          })

          setVisualData(visualData)
        }
      }

      report.on('loaded', initializeTheme)

      report.on<{
        command: string
        visual: {
          name: string
        }
        page: {
          name: string
        }
      }>('commandTriggered', initializeSnapshotTrigger)

      return () => {
        report.off('loaded', initializeTheme)
      }
    }
  }, [report, theme.palette.mode, darkThemeConfig, lightThemeConfig, isThemeInitialized])

  useEffect(() => {
    if (report && isThemeInitialized) {
      const updateTheme = async () => {
        const currentTheme = theme.palette.mode === 'dark' ? darkThemeConfig : lightThemeConfig
        if (currentTheme) {
          try {
            await report.applyTheme({ themeJson: currentTheme })
          } catch (error) {
            console.error('Error updating theme:', error)
          }
        }
      }

      updateTheme()
    }
  }, [report, theme.palette.mode, darkThemeConfig, lightThemeConfig, isThemeInitialized])

  useEffect(() => {
    if (!report) {
      setIsThemeInitialized(false)
    }
  }, [report])

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
    if (report && query && setActivePage && query.page !== currentPageRef.current) {
      setActivePage(query.page as string)
      currentPageRef.current = query.page as string
    }
  }, [report, query.page, setActivePage])

  useEffect(() => {
    setDisplay(true)

    return () => setDisplay(false)
  }, [])

  const handleLoaded = useCallback(() => {
    setIsLoaded(true)
    if (setIframeLoaded) {
      setIframeLoaded(true)
    }
  }, [setIframeLoaded])

  const getEmbeddedComponent = useCallback(
    (embeddedReport: any) => {
      if (setReport && embeddedReport && setContextReport) {
        if (embeddedReport.config.id !== (report as any)?.config.id) {
          setReport(embeddedReport as pbi.Report)
          setContextReport(embeddedReport as pbi.Report)

          if (isTakeSnapshotEnabled) takeSnapshotCustomCommand(embeddedReport as pbi.Report)
        }
      }
    },
    [setReport, setContextReport, report]
  )

  const powerBiConfig = useMemo(() => {
    const config: any = {
      type: 'report',
      id: reportId,
      accessToken: data?.reportToken,
      tokenType: models.TokenType.Embed,
      permissions: models.Permissions.All,
      pageName: query.page ? query.page : undefined,
      theme: {
        themeJson: theme.palette.mode === 'dark' ? darkThemeConfig || {} : lightThemeConfig || {}
      },

      settings: {
        ...powerBiConfigSettings,
        navContentPaneEnabled: isFullscreen,
        layoutType: models.LayoutType.Master
      }
    }

    return config
  }, [reportId, data?.reportToken, query.page, theme.palette.mode, darkThemeConfig, lightThemeConfig, isFullscreen])

  if (!data) return null

  return (
    <div className='power-bi-iframe'>
      <div
        style={
          !isLoaded || isPageChangingFromReport
            ? {
                position: isFullscreen ? 'fixed' : 'relative',
                top: isFullscreen ? 0 : 'auto',
                left: isFullscreen ? 0 : 'auto',
                width: isFullscreen ? '100vw' : '100%',
                height: isFullscreen ? '100vh' : '100%',
                zIndex: isFullscreen ? 9999 : 'auto',
                backgroundColor: isFullscreen ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
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
        style={
          isLoaded && !isPageChangingFromReport
            ? { flex: 1, display: 'flex', flexDirection: 'column' }
            : { visibility: 'hidden', height: 0 }
        }
      >
        <div style={isDisplayed ? { flex: 1, display: 'flex', flexDirection: 'column' } : { display: 'none' }}>
          <PowerBIEmbed
            embedConfig={powerBiConfig}
            eventHandlers={
              new Map([
                ['loaded', handleLoaded],
                [
                  'rendered',
                  (_: any, r: any) => {
                    if (isTakeSnapshotEnabled) {
                      const renderExtensions = async () => {
                        await takeSnapshotCustomCommand(r)
                      }

                      renderExtensions()
                    }
                  }
                ],
                [
                  'pageChanged',
                  (event: any) => {
                    if (event && event.type === 'pageChanged') {
                      const newPageName = event.detail?.newPage?.name
                      if (newPageName && newPageName !== query.page && newPageName !== currentPageRef.current) {
                        setIsPageChangingFromReport(true)
                        currentPageRef.current = newPageName
                        push({
                          pathname,
                          query: { ...query, page: newPageName }
                        }).then(() => {
                          setTimeout(() => {
                            setIsPageChangingFromReport(false)
                          }, 500)
                        })
                      }
                    }
                  }
                ]
              ])
            }
            cssClassName={'power-bi-iframe'}
            getEmbeddedComponent={getEmbeddedComponent}
          />
        </div>
      </div>

      <VisualModal visualData={visualData} setVisualData={v => setVisualData(v)} />
    </div>
  )
}

export default PowerBiIframe
