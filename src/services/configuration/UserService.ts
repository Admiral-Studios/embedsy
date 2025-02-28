import axios from 'axios'

export const UserService = {
  deleteUserFromPortal: async (email: string) => {
    await axios.post(`/api/db_transactions/users/delete`, { email: email })
  }
}
