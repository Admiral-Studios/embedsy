import { PermanentRoles } from 'src/context/types'

/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = (role: string) => {
  if (role === PermanentRoles.guest) return '/acl'
  else return '/dashboard'
}

export default getHomeRoute
