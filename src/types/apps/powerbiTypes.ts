import * as models from 'powerbi-models'

export type PowerBiStore = {
  status: string
  reportToken: string
  embedURL: string
  error: string
}

export type PowerBIIframeType = {
  store: PowerBiStore
}

export type PowerBIReportType = {
  type: string
  accessToken: string
  embedUrl: string
  id: string
  tokenType: number
  settings: {
    navContentPaneEnabled: boolean
    filterPaneEnabled: boolean
    layoutType: models.LayoutType.Master
  }
}

export type PowerBIDatasetType = {
  id: string
  name: string
  webUrl: string
  addRowsAPIEnabled: boolean
  configuredBy: string
  isRefreshable: boolean
  isEffectiveIdentityRequired: boolean
  isEffectiveIdentityRolesRequired: boolean
  isOnPremGatewayRequired: boolean
  targetStorageMode: string
  createdDate: string
  createReportEmbedURL: string
  qnaEmbedURL: string
  upstreamDatasets: string[]
  users: string[]
  queryScaleOutSettings: {
    autoSyncReadOnlyReplicas: boolean
    maxReadOnlyReplicas: number
  }
}

export type PowerBICredentials = {
  reportToken: string
  embedURL: string
}
