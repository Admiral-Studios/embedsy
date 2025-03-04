import axios from 'axios'
import * as pbi from 'powerbi-client'

const MINUTES_BEFORE_EXPIRATION = 10
const INTERVAL_TIME = 30000

let tokenExpiration: string
let timer: NodeJS.Timer
let cachedToken: { token: string; expiration: string } | null = null

const getNewAccessToken = async (
  reportId: string,
  workspaceId: string,
  email: string,
  datasetId: string,
  rowLevelRole: string
) => {
  const currentTime = new Date()
  const expirationTime = cachedToken ? new Date(cachedToken.expiration) : null

  if (cachedToken && expirationTime && expirationTime > currentTime) {
    return cachedToken
  }

  try {
    const { data } = await axios.post(`/api/powerbi/report-token?reportId=${reportId}&workspaceId=${workspaceId}`, {
      email,
      datasetId,
      rowLevelRole
    })

    cachedToken = data
    
return data
  } catch (error) {
    console.error('Error fetching new access token: ', error)
    throw error
  }
}

export async function initializeTokenManager(
  report: pbi.Report,
  reportId: string,
  workspaceId: string,
  email: string,
  datasetId: string,
  rowLevelRole: string
) {
  try {
    if (!cachedToken) {
      await updateToken(report, reportId, workspaceId, email, datasetId, rowLevelRole)
    }

    setInterval(() => checkTokenAndUpdate(report, reportId, workspaceId, email, datasetId, rowLevelRole), INTERVAL_TIME)

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkTokenAndUpdate(report, reportId, workspaceId, email, datasetId, rowLevelRole)
      }
    })
  } catch (error) {
    console.error('Error initializing token manager: ', error)
  }
}

async function checkTokenAndUpdate(
  report: pbi.Report,
  reportId: string,
  workspaceId: string,
  email: string,
  datasetId: string,
  rowLevelRole: string
) {
  try {
    const currentTime = Date.now()
    const expiration = Date.parse(tokenExpiration)
    const timeUntilExpiration = expiration - currentTime
    const timeToUpdate = MINUTES_BEFORE_EXPIRATION * 60 * 1000

    if (timeUntilExpiration <= timeToUpdate) {
      await updateToken(report, reportId, workspaceId, email, datasetId, rowLevelRole)
    }
  } catch (error) {
    console.error('Error checking token and updating: ', error)
  }
}

async function updateToken(
  report: pbi.Report,
  reportId: string,
  workspaceId: string,
  email: string,
  datasetId: string,
  rowLevelRole: string
) {
  try {
    const newAccessToken = await getNewAccessToken(reportId, workspaceId, email, datasetId, rowLevelRole)
    tokenExpiration = newAccessToken.expiration

    await report.setAccessToken(newAccessToken.token)
  } catch (error) {
    console.error('Error updating token: ', error)
  }
}

export function stopTokenManager() {
  clearInterval(timer)
  timer = null as any
  cachedToken = null
}
