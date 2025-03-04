import { GridValidRowModel } from '@mui/x-data-grid'
import axios from 'axios'
import React, { useState, useEffect, createContext, ReactNode, useCallback } from 'react'
import { useAuth } from 'src/hooks/useAuth'

interface RolesContextProps {
  allRolesData: any
  rolesRows: readonly GridValidRowModel[]
  setRolesRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>
  userRoles: any
  userRolesRows: readonly GridValidRowModel[]
  setUserRolesRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>
  roleReports: any
  roleReportsRows: readonly GridValidRowModel[]
  setRoleReportsRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>
  refreshData: () => Promise<void>
}

interface RolesContextProviderProps {
  children: ReactNode
}

export const RolesContext = createContext<RolesContextProps>({
  allRolesData: [],
  rolesRows: [],
  setRolesRows: () => null,
  userRoles: [],
  userRolesRows: [],
  setUserRolesRows: () => null,
  roleReports: [],
  roleReportsRows: [],
  setRoleReportsRows: () => null,
  refreshData: () => Promise.resolve()
})

export const RolesContextProvider: React.FC<RolesContextProviderProps> = ({ children }) => {
  const { hasAdminPrivileges, canRefresh, user } = useAuth()

  const [allRolesData, setAllRolesData] = useState<any>([])
  const [rolesRows, setRolesRows] = useState<readonly GridValidRowModel[]>([])
  const [userRoles, setUserRoles] = useState<any>([])
  const [userRolesRows, setUserRolesRows] = useState<readonly GridValidRowModel[]>([])
  const [roleReports, setRoleReports] = useState<any>([])
  const [roleReportsRows, setRoleReportsRows] = useState<readonly GridValidRowModel[]>([])

  const fetchData = useCallback(async () => {
    if (hasAdminPrivileges) {
      try {
        const [rolesResponse, userRolesResponse, roleReportsResponse] = await Promise.all([
          axios.get('/api/db_transactions/role/get/all'),
          axios.get('/api/db_transactions/user_roles/get/all'),
          axios.get('/api/db_transactions/role_reports/get/all')
        ])

        setAllRolesData(rolesResponse.data)
        setUserRoles(userRolesResponse.data)
        setRoleReports(roleReportsResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    } else if (canRefresh && user?.role) {
      try {
        const roleReportsResponse = await axios.post('/api/db_transactions/role_reports/get/by_role', {
          role: user.role
        })
        setRoleReports(roleReportsResponse.data)
      } catch (error) {
        console.error('Error fetching role reports:', error)
      }
    }
  }, [hasAdminPrivileges, canRefresh, user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setRolesRows(allRolesData)
  }, [allRolesData])

  useEffect(() => {
    setUserRolesRows(userRoles)
  }, [userRoles])

  useEffect(() => {
    setRoleReportsRows(roleReports)
  }, [roleReports])

  const refreshData = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  return (
    <RolesContext.Provider
      value={{
        allRolesData,
        rolesRows,
        setRolesRows,
        userRoles,
        userRolesRows,
        setUserRolesRows,
        roleReports,
        roleReportsRows,
        setRoleReportsRows,
        refreshData
      }}
    >
      {children}
    </RolesContext.Provider>
  )
}
