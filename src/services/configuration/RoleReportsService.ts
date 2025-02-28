import axios from 'axios'
import { PageTypesEnum } from 'src/enums/pageTypes'
import { ResponseReportType } from 'src/types/types'
import { preparePageRequestBody } from 'src/utils/configurationUtils'
import { prepareAddPageResponse } from 'src/views/pages/configuration/utils/prepareAddPageResponse'

interface DeletePageResponse {
  type: 'Iframe' | 'Hyperlink' | string
  iframe_title?: string
  hyperlink_title?: string
  report_id?: string
}

export const RoleReportsService = {
  removeReports: async (ids: (number | null)[]) => {
    await Promise.all(ids.map(id => axios.post(`/api/db_transactions/role_reports/delete/by-id`, { id })))
  },

  updateReports: async (pagesToUpdate: any[]) => {
    const updatePromises = pagesToUpdate.map(updatedPage => {
      let endpoint

      switch (updatedPage.type) {
        case PageTypesEnum.PowerBiReport:
        case PageTypesEnum.PowerBiPaginated:
          endpoint = '/api/db_transactions/role_reports/update_with_powerbi'
          break
        case PageTypesEnum.Hyperlink:
          endpoint = '/api/db_transactions/role_reports/update_with_hyperlink'
          break
        case PageTypesEnum.Iframe:
          endpoint = '/api/db_transactions/role_reports/update_with_iframe'
          break
        default:
          endpoint = '/api/db_transactions/role_reports/update_with_iframe'
      }

      return axios.patch<ResponseReportType>(
        endpoint,
        preparePageRequestBody(updatedPage, updatedPage.type as PageTypesEnum)
      )
    })

    const updateResponses = await Promise.all(updatePromises)
    const updatedReports = updateResponses.map(({ data }) => prepareAddPageResponse(data))

    return updatedReports
  },

  createReports: async (pagesToCreate: any[]) => {
    const createPromises = pagesToCreate.map(createdPage => {
      let endpoint

      switch (createdPage.type) {
        case PageTypesEnum.PowerBiReport:
        case PageTypesEnum.PowerBiPaginated:
          endpoint = '/api/db_transactions/role_reports/insert_with_powerbi'
          break
        case PageTypesEnum.Hyperlink:
          endpoint = '/api/db_transactions/role_reports/insert_with_hyperlink'
          break
        case PageTypesEnum.Iframe:
          endpoint = '/api/db_transactions/role_reports/insert_with_iframe'
          break
        default:
          endpoint = '/api/db_transactions/role_reports/insert_with_iframe'
      }

      return axios.post<ResponseReportType>(
        endpoint,
        preparePageRequestBody(createdPage, createdPage.type as PageTypesEnum)
      )
    })

    const createResponses = await Promise.all(createPromises)
    const createdReports = createResponses.map(({ data }) => prepareAddPageResponse(data))

    return createdReports
  },

  removeAllPageRoles: async (id: number): Promise<DeletePageResponse> => {
    const response = await axios.post<DeletePageResponse>(`/api/db_transactions/role_reports/delete`, { id: id })

    return response.data
  },

  removePageById: async (id: number) => {
    await axios.post(`/api/db_transactions/role_reports/delete/by-id`, { id: id })
  }
}
