import { useContext } from 'react'
import { AdminRolesContext } from 'src/context/AdminRolesContext'

export const useAdminRoles = () => useContext(AdminRolesContext)
