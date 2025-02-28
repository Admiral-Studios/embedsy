import React, { useState, createContext, ReactNode } from 'react'

import * as pbi from 'powerbi-client'

interface ReportContextProps {
  report: pbi.Report | undefined
  setReport: React.Dispatch<React.SetStateAction<pbi.Report | undefined>>
}

interface ReportContextProviderProps {
  children: ReactNode
}

export const ReportContext = createContext<ReportContextProps | undefined>(undefined)

export const ContextProvider: React.FC<ReportContextProviderProps> = ({ children }) => {
  const [report, setReport] = useState<pbi.Report | undefined>(undefined)

  return <ReportContext.Provider value={{ report, setReport }}>{children}</ReportContext.Provider>
}
