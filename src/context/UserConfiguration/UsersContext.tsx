import { createContext, ReactNode, FC, useContext } from 'react'
import toast from 'react-hot-toast'
import { UserRolesService } from 'src/services/configuration/UserRolesService'
import { RoleType, UserRoleType, UserType } from 'src/types/types'
import { UserConfigurationContext } from './UserConfigurationSharedDataContext'
import { UserService } from 'src/services/configuration/UserService'

interface UsersContextProps {
  assignUserToRole: (roleId: number, email: string, disableSetLocalData?: boolean | undefined) => Promise<void>
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
  assignUserToRole: () => Promise.resolve(),
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

      const updatedUserRoles = [
        ...syncUserRoles.current,
        { ...data, role_id: data.roleId, role: roles.find(({ id }) => id === roleId)?.role || '' }
      ]

      setUserRoles(updatedUserRoles)
      syncUserRoles.current = updatedUserRoles

      !disableSetLocalData && setLocalData()
    } catch (error) {
      toast.error('Failed to assign user')
      console.error(error)
    }
  }

  const removeUsers = async (ids: number[]) => {
    try {
      await Promise.all(ids.map(id => UserRolesService.deleteUser(id)))

      const updatedUsers = userRoles.filter(({ id }) => !ids.includes(id))
      setUserRoles(updatedUsers)
      syncUserRoles.current = updatedUsers

      setLocalData()
    } catch (error) {
      toast.error('Failed to remove users from roles')
      console.error(error)
    }
  }

  const deleteUsersFromPortal = async (ids: number[]) => {
    try {
      const emailsToDelete = [...new Set(userRoles.filter(user => ids.includes(user.id)).map(user => user.email))]

      await Promise.all(emailsToDelete.map(email => UserService.deleteUserFromPortal(email)))

      const updatedUsers = userRoles.filter(({ id }) => !ids.includes(id))
      setUserRoles(updatedUsers)
      syncUserRoles.current = updatedUsers

      setLocalData()
    } catch (error) {
      toast.error('Failed to delete users from portal')
      console.error(error)
    }
  }

  const addUpdateUser = async (user: UserType | null, email: string, roles: RoleType[]) => {
    try {
      if (user) {
        const rolesToRemove = user.roles.filter(role => !roles.find(newRole => role.id === newRole.id))

        await Promise.all(
          rolesToRemove.map(({ id }) => UserRolesService.deleteUserByEmail({ role_id: id, email: user.email }))
        )

        const updatedUserRoles = syncUserRoles.current.filter(
          ({ email, role_id }) => !rolesToRemove.find(role => role.id === role_id && email === user.email)
        )

        syncUserRoles.current = updatedUserRoles

        const rolesToAdd = roles.filter(newRole => !user.roles.find(role => role.id === newRole.id))

        await Promise.all(rolesToAdd.map(({ id }) => assignUserToRole(id, email)))

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
        await Promise.all(roles.map(({ id }) => assignUserToRole(id, email)))
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
