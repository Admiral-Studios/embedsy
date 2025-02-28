import axios from 'axios'

export const RoleService = {
  createRole: async (body: {
    role: string
    can_refresh: boolean
    can_export: boolean
    can_manage_own_account: boolean
  }) => {
    const {
      data: { id }
    } = await axios.post(`/api/db_transactions/role/insert`, body)

    return id
  },

  updateRole: async (body: {
    role: string
    can_refresh: boolean
    can_export: boolean
    can_manage_own_account: boolean
    id: number | null
  }) => {
    const {
      data: { id }
    } = await axios.patch(`/api/db_transactions/role/update`, body)

    return id
  },

  removeRoles: async (ids: number[]) => {
    await Promise.all(ids.map(id => axios.post(`/api/db_transactions/role/delete`, { id: id })))
  }
}
