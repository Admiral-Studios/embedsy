import { NextApiRequest, NextApiResponse } from 'next/types'
import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
// eslint-disable-next-line
import axios from 'axios'

let activeUsers = 0
let lastActivityTime = Date.now()
let interval: NodeJS.Timeout | null = null

// eslint-disable-next-line
const manageCapacity = async (action: 'resume' | 'suspend') => {
  try {
    // const res = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/capacity/manage`, { action })
    // console.log(res.data.message || res.data.state)
  } catch (error: any) {
    console.error('Failed to manage capacity', error.response?.data || error.message)
  }
}

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HttpServer & {
      io?: SocketIOServer
    }
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const httpServer: HttpServer = res.socket.server
    const io = new SocketIOServer(httpServer, {
      path: '/api/socket'
    })

    io.on('connection', socket => {
      const prevActiveUsers = activeUsers
      activeUsers++
      lastActivityTime = Date.now()

      if (prevActiveUsers === 0) {
        manageCapacity('resume')
      }

      socket.on('disconnect', () => {
        activeUsers--
        if (activeUsers < 0) activeUsers = 0
        if (activeUsers === 0 && !interval) {
          interval = setInterval(async () => {
            if (activeUsers === 0 && Date.now() - lastActivityTime >= 300000) {
              await manageCapacity('suspend')
              if (interval !== null) {
                clearInterval(interval)
                interval = null
              }
            }
          }, 300000) // Check every 5 minutes
        }
      })

      socket.on('away', () => {
        activeUsers--
        if (activeUsers < 0) activeUsers = 0
        if (activeUsers === 0 && !interval) {
          interval = setInterval(async () => {
            if (activeUsers === 0 && Date.now() - lastActivityTime >= 300000) {
              await manageCapacity('suspend')
              if (interval !== null) {
                clearInterval(interval)
                interval = null
              }
            }
          }, 300000) // Check every 5 minutes
        }
      })

      socket.on('active', () => {
        const prevActiveUsers = activeUsers
        activeUsers++
        lastActivityTime = Date.now()

        if (prevActiveUsers === 0) {
          manageCapacity('resume')
        }
      })

      if (interval) {
        clearInterval(interval)
        interval = null
      }
    })

    res.socket.server.io = io
  } else {
    console.log('Socket server already running')
  }

  res.end()
}
