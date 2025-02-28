import axios from 'axios'
import * as pbi from 'powerbi-client'
import { ReportTypes } from 'src/enums/pageTypes'
import { ReportType } from 'src/types/types'

const MINUTES_BEFORE_EXPIRATION = 10
const INTERVAL_TIME = 30000

interface TokenCache {
  token: string
  expiration: string
  timestamp: number
}

interface TokenCacheMap {
  [key: string]: TokenCache
}

const tokenCache: TokenCacheMap = {}
let timer: NodeJS.Timer
let currentReportId: string
let currentWorkspaceId: string

const getNewAccessToken = async (
  reportId: string,
  workspaceId: string,
  email: string,
  datasetId: string,
  rowLevelRole: string,
  reportType: ReportType
) => {
  const cacheKey = `${workspaceId}-${reportId}`
  const currentTime = Date.now()
  const cachedData = tokenCache[cacheKey]

  if (cachedData) {
    const expirationTime = new Date(cachedData.expiration)
    if (expirationTime > new Date()) {
      return {
        token: cachedData.token,
        expiration: cachedData.expiration
      }
    }
  }

  try {
    const { data } = await axios.post(
      `/api/powerbi/report-token/${
        reportType === ReportTypes.PowerBiReport ? 'report' : 'paginated-report'
      }?reportId=${reportId}&workspaceId=${workspaceId}&reportType=${reportType}`,
      {
        email,
        datasetId,
        rowLevelRole
      }
    )

    tokenCache[cacheKey] = {
      token: data.token,
      expiration: data.expiration,
      timestamp: currentTime
    }

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
  rowLevelRole: string,
  reportType = ReportTypes.PowerBiReport
) {
  currentReportId = reportId
  currentWorkspaceId = workspaceId

  try {
    await updateToken(report, reportId, workspaceId, email, datasetId, rowLevelRole, reportType)

    timer = setInterval(
      () => checkTokenAndUpdate(report, reportId, workspaceId, email, datasetId, rowLevelRole, reportType),
      INTERVAL_TIME
    )

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        checkTokenAndUpdate(report, reportId, workspaceId, email, datasetId, rowLevelRole, reportType)
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
  rowLevelRole: string,
  reportType: ReportType
) {
  const cacheKey = `${workspaceId}-${reportId}`
  const cachedData = tokenCache[cacheKey]

  if (!cachedData) {
    await updateToken(report, reportId, workspaceId, email, datasetId, rowLevelRole, reportType)

    return
  }

  try {
    const currentTime = Date.now()
    const expiration = Date.parse(cachedData.expiration)
    const timeUntilExpiration = expiration - currentTime
    const timeToUpdate = MINUTES_BEFORE_EXPIRATION * 60 * 1000

    if (timeUntilExpiration <= timeToUpdate) {
      await updateToken(report, reportId, workspaceId, email, datasetId, rowLevelRole, reportType)
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
  rowLevelRole: string,
  reportType: ReportType
) {
  try {
    const newAccessToken = await getNewAccessToken(reportId, workspaceId, email, datasetId, rowLevelRole, reportType)
    await report.setAccessToken(newAccessToken.token)
  } catch (error) {}
}

export function stopTokenManager() {
  if (timer) {
    clearInterval(timer)
    timer = null as any
  }

  if (currentWorkspaceId && currentReportId) {
    const cacheKey = `${currentWorkspaceId}-${currentReportId}`
    delete tokenCache[cacheKey]
  }
}
