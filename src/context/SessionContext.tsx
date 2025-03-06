import axios from 'axios'
import React, { ReactNode, createContext, useEffect } from 'react'
import { useAuth } from 'src/hooks/useAuth'

interface SessionContextProviderProps {
  children: ReactNode
}

// TODO: uncomment if need to pass props
// interface SessionContextProps {}

const INTERVAL_TIMESTAMP = 100000

export const SessionContext = createContext<{}>({})

export const SessionProvider: React.FC<SessionContextProviderProps> = ({ children }) => {
  const { user } = useAuth()

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined
    if (user?.id) {
      const getSessionDuration = async () => {
        const { data } = await axios.post('/api/session/get', { userId: user.id })

        let currentDuration = +data.sessionDuration

        interval = setInterval(() => {
          axios.patch('/api/session/update', {
            userId: user.id,
            currentDuration: (currentDuration += INTERVAL_TIMESTAMP / 1000),
            loginAt: data.loginAt
          })
        }, INTERVAL_TIMESTAMP)
      }

      getSessionDuration()
    }

    return () => clearInterval(interval)
  }, [user])

  return <SessionContext.Provider value={{}}>{children}</SessionContext.Provider>
}
