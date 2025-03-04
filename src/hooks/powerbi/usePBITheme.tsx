import { useTheme } from '@mui/material'
import { useContext, useEffect } from 'react'

import { ReportContext } from 'src/context/ReportContext'

type Props = {
  darkThemeConfig?: JSON | null
  lightThemeConfig?: JSON | null
}

export const usePBITheme = ({ darkThemeConfig, lightThemeConfig }: Props) => {
  const { report } = useContext(ReportContext) || {}
  const theme = useTheme()

  useEffect(() => {
    if (report) {
      const changeTheme = async () => {
        if (theme.palette.mode === 'light' && lightThemeConfig) {
          await report.applyTheme({ themeJson: lightThemeConfig })
        } else if (theme.palette.mode === 'dark' && darkThemeConfig) {
          await report.applyTheme({ themeJson: darkThemeConfig })
        }
      }
      changeTheme()
    }
  }, [report, theme.palette.mode, darkThemeConfig, lightThemeConfig])
}
