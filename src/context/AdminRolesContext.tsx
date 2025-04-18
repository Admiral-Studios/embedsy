import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import axios from 'axios'
import { AdminRolesType, PermanentRoles, Role } from './types'
import { readCookieOnClientSide } from 'src/utils/cookies'

const defaultProvider: AdminRolesType = {
  canViewRoles: false,
  viewAsCustomRole: null,
  roles: [],
  onChangeViewAsRole: () => null,
  refreshRoles: () => Promise.resolve()
}

const AdminRolesContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AdminRolesProvider = ({ children }: Props) => {
  const [roles, setRoles] = useState<Role[]>([])
  const [viewAsCustomRole, setViewAsCustomRole] = useState<Role | null>(null)
  const [canViewRoles, setCanViewRoles] = useState(false)
  const { hasAdminPrivileges, isSuperAdmin } = useAuth()

  const fetchRoles = useCallback(async () => {
    if (hasAdminPrivileges) {
      try {
        /*
        TODO: Restructure all API calls inside a services folder for better architecture
        sturcturing each service into specific calls.
        */
        const response = await axios.get(`/api/db_transactions/role/get/all`)
        setRoles(response.data || [])
        
return response.data || []
      } catch (error) {
        console.error('Failed to fetch roles', error)
        
return []
      }
    }
    
return []
  }, [hasAdminPrivileges])

  const refreshRoles = useCallback(async () => {
    return await fetchRoles()
  }, [fetchRoles])

  const onChangeViewAsRole = async (role: Role | null) => {
    const isRoleAdminOrSuperAdmin =
      !role || (role.role === PermanentRoles.admin && !isSuperAdmin) || role.role === PermanentRoles.super_admin
    const roleValue = isRoleAdminOrSuperAdmin ? null : String(role.id)

    try {
      await axios.post('/api/custom_role/post/update_role', {
        viewAsCustomRole: roleValue
      })

      if (isRoleAdminOrSuperAdmin) {
        setViewAsCustomRole(null)
      } else {
        setViewAsCustomRole(role)
      }
      window.location.assign('/dashboard')
    } catch (error) {
      console.error('Failed to update role', error)
    }
  }

  useEffect(() => {
    if (hasAdminPrivileges) {
      setCanViewRoles(true)
      fetchRoles()
    }
  }, [hasAdminPrivileges, fetchRoles])

  useEffect(() => {
    const viewAsCustomRoleCookie = readCookieOnClientSide('viewAsCustomRole')
    if (viewAsCustomRoleCookie && roles.length > 0) {
      const matchedRole = roles.find(role => role.id === Number(viewAsCustomRoleCookie))
      if (matchedRole) {
        setViewAsCustomRole(matchedRole)
      }
    }
  }, [roles])

  return (
    <AdminRolesContext.Provider value={{ canViewRoles, viewAsCustomRole, roles, onChangeViewAsRole, refreshRoles }}>
      {children}
    </AdminRolesContext.Provider>
  )
}

export { AdminRolesContext, AdminRolesProvider }
