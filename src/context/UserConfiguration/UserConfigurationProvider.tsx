import { ReactNode } from 'react'
import { PagesContextProvider } from './PagesContext'
import { UserConfigurationSharedDataContextProvider } from './UserConfigurationSharedDataContext'
import { UsersContextProvider } from './UsersContext'
import { RolesContextProvider } from './RolesContext'

export const UserConfigurationProvider = ({ children }: { children: ReactNode }) => {
  return (
    <UserConfigurationSharedDataContextProvider>
      <PagesContextProvider>
        <UsersContextProvider>
          <RolesContextProvider>{children}</RolesContextProvider>
        </UsersContextProvider>
      </PagesContextProvider>
    </UserConfigurationSharedDataContextProvider>
  )
}
