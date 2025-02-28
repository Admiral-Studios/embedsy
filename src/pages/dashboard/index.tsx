import jwt from 'jsonwebtoken'
import axios from 'axios'
import { GetServerSidePropsContext } from 'next/types'
import ExecuteQuery from 'src/utils/db'

const DashboardPage = () => {
  return null
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { req } = ctx
  const token = req.cookies.refreshToken
  const viewAsCustomRole = req.cookies.viewAsCustomRole

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.')
  }
  let id
  jwt.verify(token, jwtSecret, function (err: any, decoded: any) {
    if (err) {
      console.error(err)
    }
    id = decoded.id
  })

  const dbQuery = `SELECT TOP 1 * FROM users WHERE id='${id}'`

  const findUser = await ExecuteQuery(dbQuery)
  const user = findUser[0][0]

  const apiUrl = viewAsCustomRole
    ? `${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role/get/by_custom_role`
    : `${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role/get/by_email`

  const requestData = viewAsCustomRole ? { roleId: viewAsCustomRole } : { email: user.email }

  try {
    const { data } = await axios.post(apiUrl, requestData)
    const { role, workspaces } = data
    if (!ctx.params?.page) {
      if (role && !workspaces) {
        return {
          redirect: {
            destination: '/acl',
            permanent: false
          }
        }
      }

      return {
        redirect: {
          destination: `/dashboard/${workspaces[0].workspaceID}/report/${workspaces[0].reports[0]}`,
          permanent: false
        }
      }
    }

    return { props: {} }
  } catch (e) {
    console.error(e)

    return { props: {} }
  }
}

export default DashboardPage
