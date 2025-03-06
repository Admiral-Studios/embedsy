import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [awayTimer, setAwayTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const socket = io({
      path: '/api/socket'
    })
    setSocket(socket)

    // eslint-disable-next-line
    socket.on('connect', () => {})

    // eslint-disable-next-line
    socket.on('disconnect', () => {})

    // eslint-disable-next-line
    socket.on('message', message => {})

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setAwayTimer(
          setTimeout(() => {
            socket.emit('away')
          }, 300000)
        )
      } else {
        if (awayTimer) {
          clearTimeout(awayTimer)
          setAwayTimer(null)
        }
        socket.emit('active')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      socket.disconnect()
    }
  }, [awayTimer])

  return socket
}

export default useSocket
