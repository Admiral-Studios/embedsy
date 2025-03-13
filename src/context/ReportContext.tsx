import React, { useState, createContext, ReactNode } from 'react'

import * as pbi from 'powerbi-client'

type ReportContextType = {
  report: pbi.Report | null
  setReport: (report: pbi.Report) => void
  isFullscreen: boolean
  fullscreen: () => void
  iframeLoaded: boolean
  setIframeLoaded: (loaded: boolean) => void
}

export const ReportContext = createContext<ReportContextType | undefined>(undefined)

type Props = {
  children: ReactNode
}

export const ReportProvider = ({ children }: Props) => {
  const [report, setReport] = useState<pbi.Report | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <ReportContext.Provider
      value={{
        report,
        setReport,
        isFullscreen,
        fullscreen: handleFullscreen,
        iframeLoaded,
        setIframeLoaded
      }}
    >
      {children}
    </ReportContext.Provider>
  )
}
