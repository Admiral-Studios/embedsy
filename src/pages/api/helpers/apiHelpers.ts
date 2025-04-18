import { NextApiRequest, NextApiResponse } from 'next/types'
import { withAuth, withRole } from '../middleware/authMiddleware'
import { PermanentRoles } from '../../../context/types'

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void

/**
 * Creates a protected API route with role-based access control for specific methods
 *
 * @param handlers Object containing handlers for different HTTP methods
 * @param roleProtection Object specifying which methods require specific roles
 * @returns API route handler with appropriate protection
 */
export function createProtectedApi(
  handlers: {
    GET?: ApiHandler
    POST?: ApiHandler
    PUT?: ApiHandler
    DELETE?: ApiHandler
    PATCH?: ApiHandler
    [key: string]: ApiHandler | undefined
  },
  roleProtection: {
    GET?: string[]
    POST?: string[]
    PUT?: string[]
    DELETE?: string[]
    PATCH?: string[]
    [key: string]: string[] | undefined
  } = {}
) {
  const methodHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method || 'GET'
    const handler = handlers[method]

    if (!handler) {
      return res.status(405).json({ message: 'Method not allowed' })
    }

    return handler(req, res)
  }

  return (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method || 'GET'
    const requiredRoles = roleProtection[method]

    if (requiredRoles && requiredRoles.length > 0) {
      return withRole(methodHandler, requiredRoles)(req, res)
    } else {
      return withAuth(methodHandler)(req, res)
    }
  }
}

/**
 * Creates an admin-only API route
 *
 * @param handlers Object containing handlers for different HTTP methods
 * @returns API route handler with admin protection
 */
export function createAdminApi(handlers: {
  GET?: ApiHandler
  POST?: ApiHandler
  PUT?: ApiHandler
  DELETE?: ApiHandler
  PATCH?: ApiHandler
  [key: string]: ApiHandler | undefined
}) {
  return createProtectedApi(handlers, {
    GET: [PermanentRoles.admin, PermanentRoles.super_admin],
    POST: [PermanentRoles.admin, PermanentRoles.super_admin],
    PUT: [PermanentRoles.admin, PermanentRoles.super_admin],
    DELETE: [PermanentRoles.admin, PermanentRoles.super_admin],
    PATCH: [PermanentRoles.admin, PermanentRoles.super_admin]
  })
}
