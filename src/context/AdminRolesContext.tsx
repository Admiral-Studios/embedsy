import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import axios from 'axios'
import { AdminRolesType, PermanentRoles, Role } from './types'
import { readCookieOnClientSide } from 'src/utils/cookies'

const defaultProvider: AdminRolesType = {
  canViewRoles: false,
  viewAsCustomRole: null,
  roles: [],
  onChangeViewAsRole: () => null
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

  const onChangeViewAsRole = async (role: Role) => {
    const isRoleAdminOrSuperAdmin =
      (role.role === PermanentRoles.admin && !isSuperAdmin) || role.role === PermanentRoles.super_admin
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
      const fetchRoles = async () => {
        if (hasAdminPrivileges) {
          try {
            /*
            TODO: Restructure all API calls inside a services folder for better architecture
            sturcturing each service into specific calls.

            Axios should not be imported directly into components. We should use services for abstractization between ClientSide & APIs.
            Architecture should follow this order: Components > Service > API
          */
            const response = await axios.get(`/api/db_transactions/role/get/all`)
            setRoles(response.data || [])
          } catch (error) {
            console.error('Failed to fetch roles', error)
          }
        }
      }
      fetchRoles()
    }
  }, [hasAdminPrivileges])

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
    <AdminRolesContext.Provider value={{ canViewRoles, viewAsCustomRole, roles, onChangeViewAsRole }}>
      {children}
    </AdminRolesContext.Provider>
  )
}

export { AdminRolesContext, AdminRolesProvider }
