import React, { ReactNode, createContext, useEffect, useState, useCallback, useRef } from 'react'
import axios from 'axios'
import { useAuth } from 'src/hooks/useAuth'
import { useSettings } from 'src/@core/hooks/useSettings'

interface SessionContextProviderProps {
  children: ReactNode
}

export const SessionContext = createContext<{
  lastActivityTime: number
  isWarningModalOpen: boolean
  isInactiveBeyondCapacityThreshold: boolean
  acknowledgeWarning: () => void
}>({
  lastActivityTime: Date.now(),
  isWarningModalOpen: false,
  isInactiveBeyondCapacityThreshold: false,
  acknowledgeWarning: () => null
})

const SESSION_UPDATE_INTERVAL = 60_000
const INACTIVITY_THRESHOLD = 3 * 60_000
const CAPACITY_THRESHOLD = 5 * 60_000
const THROTTLE_DELAY = 1_000

const USER_ACTIVITY_EVENTS = {
  MOUSE_MOVE: 'mousemove',
  KEY_DOWN: 'keydown',
  MOUSE_DOWN: 'mousedown',
  TOUCH_START: 'touchstart',
  SCROLL: 'scroll'
}

export const SessionProvider = ({ children }: SessionContextProviderProps) => {
  const { user } = useAuth()
  const { powerBICapacityExists, checkAndAutoManageCapacity, isCapacityAutoManaged } = useSettings()

  const [sessionData, setSessionData] = useState<{
    sessionDuration: number
    loginAt: string
  } | null>(null)
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now())
  const [isTracking, setIsTracking] = useState<boolean>(true)
  const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false)
  const [isInactiveBeyondCapacityThreshold, setIsInactiveBeyondCapacityThreshold] = useState<boolean>(false)

  const lastActivityTimeRef = useRef<number>(lastActivityTime)
  const isWarningModalOpenRef = useRef<boolean>(isWarningModalOpen)
  const isInactiveBeyondCapacityRef = useRef<boolean>(isInactiveBeyondCapacityThreshold)
  const lastUpdateRef = useRef<number>(Date.now())

  useEffect(() => {
    lastActivityTimeRef.current = lastActivityTime
  }, [lastActivityTime])

  useEffect(() => {
    isWarningModalOpenRef.current = isWarningModalOpen
  }, [isWarningModalOpen])

  useEffect(() => {
    isInactiveBeyondCapacityRef.current = isInactiveBeyondCapacityThreshold
  }, [isInactiveBeyondCapacityThreshold])

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user?.id || sessionData) return

      try {
        const { data } = await axios.post('/api/session/get', { userId: user.id })
        setSessionData({
          sessionDuration: +data.sessionDuration,
          loginAt: data.loginAt
        })

        await axios.patch('/api/session/update', {
          userId: user.id,
          currentDuration: +data.sessionDuration,
          loginAt: data.loginAt
        })
      } catch (error) {
        console.error('Failed to initialize session tracking:', error)
      }
    }

    fetchSessionData()
  }, [user, sessionData])

  const handleUserActivity = useCallback(() => {
    if (!isTracking || !user?.id) return

    const now = Date.now()
    const timeSinceLast = now - lastActivityTimeRef.current

    if (
      powerBICapacityExists &&
      isCapacityAutoManaged &&
      timeSinceLast >= CAPACITY_THRESHOLD &&
      !isInactiveBeyondCapacityRef.current
    ) {
      setIsInactiveBeyondCapacityThreshold(true)
    }

    if (now - lastUpdateRef.current >= THROTTLE_DELAY) {
      setLastActivityTime(now)
      lastUpdateRef.current = now
    }
  }, [isTracking, powerBICapacityExists, isCapacityAutoManaged, user])

  useEffect(() => {
    const events = Object.values(USER_ACTIVITY_EVENTS)

    if (isTracking && user?.id) {
      events.forEach(event => window.addEventListener(event, handleUserActivity))
    } else {
      events.forEach(event => window.removeEventListener(event, handleUserActivity))
    }

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity))
    }
  }, [isTracking, handleUserActivity, user])

  useEffect(() => {
    if (!user?.id || !sessionData) return

    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivityTimeRef.current

      if (timeSinceLastActivity < SESSION_UPDATE_INTERVAL) {
        const newSessionDuration = sessionData.sessionDuration + SESSION_UPDATE_INTERVAL / 1000

        axios
          .patch('/api/session/update', {
            userId: user.id,
            currentDuration: newSessionDuration,
            loginAt: sessionData.loginAt
          })
          .then(() => {
            setSessionData(prev =>
              prev
                ? {
                    ...prev,
                    sessionDuration: newSessionDuration
                  }
                : null
            )
          })
          .catch(console.error)
      }

      if (
        powerBICapacityExists &&
        isCapacityAutoManaged &&
        timeSinceLastActivity >= INACTIVITY_THRESHOLD &&
        !isWarningModalOpenRef.current
      ) {
        setIsWarningModalOpen(true)
        setIsTracking(false)
      }

      if (
        powerBICapacityExists &&
        isCapacityAutoManaged &&
        timeSinceLastActivity >= CAPACITY_THRESHOLD &&
        !isInactiveBeyondCapacityRef.current
      ) {
        setIsInactiveBeyondCapacityThreshold(true)
      }
    }, SESSION_UPDATE_INTERVAL)

    return () => {
      clearInterval(interval)
    }
  }, [user, sessionData, powerBICapacityExists, isCapacityAutoManaged])

  const acknowledgeWarning = useCallback(() => {
    setIsWarningModalOpen(false)
    setIsTracking(true)
    setLastActivityTime(Date.now())

    if (powerBICapacityExists && isInactiveBeyondCapacityRef.current) {
      setIsInactiveBeyondCapacityThreshold(false)

      checkAndAutoManageCapacity()
    }
  }, [powerBICapacityExists, checkAndAutoManageCapacity])

  return (
    <SessionContext.Provider
      value={{
        lastActivityTime,
        isWarningModalOpen,
        isInactiveBeyondCapacityThreshold,
        acknowledgeWarning
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}
