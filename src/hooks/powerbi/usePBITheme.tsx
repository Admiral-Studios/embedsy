import { useContext, useEffect, useRef, useState } from 'react'
import { useSettings } from 'src/@core/hooks/useSettings'
import { ReportContext } from 'src/context/ReportContext'

type Props = {
  darkThemeConfig?: JSON | null
  lightThemeConfig?: JSON | null
}

export const usePBITheme = ({ darkThemeConfig, lightThemeConfig }: Props) => {
  const { report } = useContext(ReportContext) || {}
  const { settings } = useSettings()
  const prevReportIdRef = useRef<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (report) {
      const changeTheme = async () => {
        const themeMode = settings.mode === 'dark' ? 'dark' : 'light'
        const currentReportId = (report.config as any).id
        const themeConfig = themeMode === 'dark' ? darkThemeConfig : lightThemeConfig

        if (themeConfig) {
          const applyTheme = async () => {
            try {
              await report.applyTheme({ themeJson: themeConfig })
            } catch (error) {
              console.error('Error applying theme:', error)
            }
          }

          if (!isInitialized) {
            report.on('loaded', async () => {
              await applyTheme()
              setIsInitialized(true)
            })
          }

          if (isInitialized) {
            if (currentReportId === prevReportIdRef.current) {
              applyTheme()
            } else {
              setTimeout(applyTheme, 3000)
            }
          }

          prevReportIdRef.current = currentReportId
        }
      }
      changeTheme()
    }

    return () => {
      if (report) {
        setIsInitialized(false)
      }
    }
  }, [report, settings.mode, darkThemeConfig, lightThemeConfig, isInitialized])
}
