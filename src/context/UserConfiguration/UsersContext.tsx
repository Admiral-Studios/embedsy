import { createContext, ReactNode, FC, useContext } from 'react'
import toast from 'react-hot-toast'
import { UserRolesService } from 'src/services/configuration/UserRolesService'
import { RoleType, UserRoleType, UserType } from 'src/types/types'
import { UserConfigurationContext } from './UserConfigurationSharedDataContext'
import { UserService } from 'src/services/configuration/UserService'
import { PermanentRoles } from '../types'

interface UsersContextProps {
  assignUserToRole: (
    roleId: number,
    email: string,
    disableSetLocalData?: boolean | undefined
  ) => Promise<{
    success: boolean
    error?: string
  }>
  removeUsers: (ids: number[]) => Promise<void>
  deleteUsersFromPortal: (ids: number[]) => Promise<void>
  addUpdateUser: (id: UserType | null, email: string, roles: RoleType[]) => Promise<void>
  locallyAddNewUsers: (users: UserRoleType[]) => void
  userRoles: UserRoleType[]
  users: UserType[]
}

interface UsersProviderProps {
  children: ReactNode
}

export const UsersContext = createContext<UsersContextProps>({
  assignUserToRole: () => Promise.resolve({ success: true }),
  removeUsers: () => Promise.resolve(),
  deleteUsersFromPortal: () => Promise.resolve(),
  addUpdateUser: () => Promise.resolve(),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  locallyAddNewUsers: () => {},
  userRoles: [],
  users: []
})

export const UsersContextProvider: FC<UsersProviderProps> = ({ children }) => {
  const { syncUserRoles, roles, setLocalData, setUserRoles, userRoles, users } = useContext(UserConfigurationContext)

  const assignUserToRole = async (roleId: number, email: string, disableSetLocalData: boolean | undefined = false) => {
    try {
      const data = await UserRolesService.createUser({ email: email, roleId: roleId })

      const updatedUserRoles = syncUserRoles.current.filter(ur => ur.email !== email)

      updatedUserRoles.push({
        ...data,
        role_id: data.roleId,
        role: roles.find(({ id }) => id === roleId)?.role || ''
      })

      setUserRoles(updatedUserRoles)
      syncUserRoles.current = updatedUserRoles

      !disableSetLocalData && setLocalData()

      return { success: true }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to assign user'
      if (!disableSetLocalData) {
        toast.error(errorMessage)
      }
      console.error(error)

      return { success: false, error: errorMessage }
    }
  }

  const removeUsers = async (ids: number[]) => {
    try {
      const successfullyDeletedIds: number[] = []
      const errors: string[] = []
      const guestRole = roles.find(r => r.role === PermanentRoles.guest)

      for (const id of ids) {
        try {
          await UserRolesService.deleteUser(id)
          successfullyDeletedIds.push(id)

          const userToUpdate = userRoles.find(ur => ur.id === id)
          if (userToUpdate && guestRole) {
            const updatedUserRoles = syncUserRoles.current.filter(ur => ur.id !== id)
            updatedUserRoles.push({
              ...userToUpdate,
              role_id: guestRole.id,
              role: PermanentRoles.guest,
              id: Date.now()
            })

            setUserRoles(updatedUserRoles)
            syncUserRoles.current = updatedUserRoles
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || `Failed to remove user ID ${id}`
          errors.push(errorMessage)
          console.error(`Error removing user ${id}:`, error)
        }
      }

      setLocalData()

      if (errors.length > 0) {
        toast.error(
          errors.length === 1
            ? errors[0]
            : `Failed to remove ${errors.length} user(s). Some users may have special permissions.`
        )
      }

      if (successfullyDeletedIds.length > 0) {
        toast.success(`Successfully removed ${successfullyDeletedIds.length} user(s) from their roles`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove users from roles')
      console.error(error)
    }
  }

  const deleteUsersFromPortal = async (ids: number[]) => {
    try {
      const emailsToDelete = [...new Set(userRoles.filter(user => ids.includes(user.id)).map(user => user.email))]
      const successfullyDeletedEmails: string[] = []
      const successfullyDeletedIds: number[] = []
      const errors: string[] = []

      for (const email of emailsToDelete) {
        try {
          await UserService.deleteUserFromPortal(email)
          successfullyDeletedEmails.push(email)

          const relatedIds = userRoles
            .filter(user => user.email === email && ids.includes(user.id))
            .map(user => user.id)

          successfullyDeletedIds.push(...relatedIds)
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || `Failed to delete user ${email}`
          errors.push(errorMessage)
          console.error(`Error deleting user ${email}:`, error)
        }
      }

      if (successfullyDeletedIds.length > 0) {
        const updatedUsers = userRoles.filter(({ id }) => !successfullyDeletedIds.includes(id))
        setUserRoles(updatedUsers)
        syncUserRoles.current = updatedUsers
        setLocalData()
      }

      if (errors.length > 0) {
        toast.error(
          errors.length === 1
            ? errors[0]
            : `Failed to delete ${errors.length} user(s). Some users may be Super Admins or the last Admin.`
        )
      }

      if (successfullyDeletedEmails.length > 0) {
        toast.success(`Successfully deleted ${successfullyDeletedEmails.length} user(s) from the portal`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete users from portal')
      console.error(error)
    }
  }

  const addUpdateUser = async (user: UserType | null, email: string, roles: RoleType[]) => {
    try {
      if (user) {
        const rolesToRemove = user.roles.filter(role => !roles.find(newRole => role.id === newRole.id))

        try {
          await Promise.all(
            rolesToRemove.map(({ id }) => UserRolesService.deleteUserByEmail({ role_id: id, email: user.email }))
          )
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to update user roles'
          toast.error(errorMessage)
          
return
        }

        const updatedUserRoles = syncUserRoles.current.filter(
          ({ email, role_id }) => !rolesToRemove.find(role => role.id === role_id && email === user.email)
        )

        syncUserRoles.current = updatedUserRoles

        const rolesToAdd = roles.filter(newRole => !user.roles.find(role => role.id === newRole.id))

        const results = await Promise.all(rolesToAdd.map(({ id }) => assignUserToRole(id, email)))
        const errors = results.filter(r => !r.success)
        if (errors.length > 0) {
          toast.error(
            errors.length === 1
              ? errors[0].error
              : `Failed to assign ${errors.length} role(s). Some roles may have special permissions.`
          )
          
return
        }

        const usersToUpdate = syncUserRoles.current.filter(({ email }) => email === user.email)

        await Promise.all(
          usersToUpdate.map(user => UserRolesService.updateUser({ email: email, roleId: user.role_id, id: user.id }))
        )

        syncUserRoles.current = syncUserRoles.current.map(user => {
          const updated = usersToUpdate.find(u => u.id === user.id)

          if (updated) {
            return { ...user, email: email }
          }

          return user
        })

        setLocalData()
        setUserRoles(syncUserRoles.current)
      } else {
        const results = await Promise.all(roles.map(({ id }) => assignUserToRole(id, email)))
        const errors = results.filter(r => !r.success)
        if (errors.length > 0) {
          toast.error(
            errors.length === 1
              ? errors[0].error
              : `Failed to assign ${errors.length} role(s). Some roles may have special permissions.`
          )
          
return
        }
      }
    } catch (error) {
      toast.error('Failed to add user')
      console.error(error)
    }
  }

  const locallyAddNewUsers = (users: UserRoleType[]) => {
    const updatedUsers = [...syncUserRoles.current, ...users]

    syncUserRoles.current = updatedUsers

    setUserRoles(updatedUsers)

    setLocalData()
  }

  return (
    <UsersContext.Provider
      value={{
        assignUserToRole,
        removeUsers,
        deleteUsersFromPortal,
        addUpdateUser,
        locallyAddNewUsers,
        userRoles,
        users
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}
