import axios from 'axios'

export const UserRolesService = {
  createUser: async (body: { email: string; roleId: number }) => {
    const { data } = await axios.post(`/api/db_transactions/user_roles/insert`, body)

    return data
  },

  deleteUser: async (id: number) => {
    await axios.post(`/api/db_transactions/user_roles/delete`, { id: id })
  },

  deleteUserByEmail: async (body: { role_id: number; email: string }) => {
    await axios.post(`/api/db_transactions/user_roles/delete_by_email_role`, body)
  },

  updateUser: async (body: { email: string; roleId: number; id: number }) => {
    const { data } = await axios.patch(`/api/db_transactions/user_roles/update`, body)

    return data
  }
}
