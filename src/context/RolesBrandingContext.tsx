import { GridValidRowModel } from '@mui/x-data-grid'
import axios from 'axios'
import React, { useState, useEffect, createContext, ReactNode, useCallback } from 'react'
import { useAuth } from 'src/hooks/useAuth'

interface RolesBrandingContextProps {
  rolesBranding: any
  rolesBrandingRows: readonly GridValidRowModel[]
  setRolesBrandingRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>
  refreshData: () => Promise<void>
}

interface RolesBrandingContextProviderProps {
  children: ReactNode
}

export const RolesBrandingContext = createContext<RolesBrandingContextProps>({
  rolesBranding: [],
  rolesBrandingRows: [],
  setRolesBrandingRows: () => null,
  refreshData: () => Promise.resolve()
})

export const RolesBrandingContextProvider: React.FC<RolesBrandingContextProviderProps> = ({ children }) => {
  const { hasAdminPrivileges } = useAuth()

  const [rolesBranding, setRolesBranding] = useState<any>([])
  const [rolesBrandingRows, setRolesBrandingRows] = useState<readonly GridValidRowModel[]>([])

  const fetchData = useCallback(async () => {
    if (hasAdminPrivileges) {
      try {
        const rolesBrandingResponse = await axios.get('/api/db_transactions/role_branding/get/all')
        setRolesBranding(rolesBrandingResponse.data)
      } catch (error) {
        console.error('Error fetching role branding data:', error)
      }
    }
  }, [hasAdminPrivileges])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setRolesBrandingRows(rolesBranding)
  }, [rolesBranding])

  const refreshData = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  return (
    <RolesBrandingContext.Provider
      value={{
        rolesBranding,
        rolesBrandingRows,
        setRolesBrandingRows,
        refreshData
      }}
    >
      {children}
    </RolesBrandingContext.Provider>
  )
}
