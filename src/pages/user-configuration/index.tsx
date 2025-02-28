import { GetServerSidePropsContext } from 'next/types'
import { SubjectTypes } from 'src/types/acl/subjectTypes'

const ConfigurationPage = () => {
  return null
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (!ctx.params?.page) {
    ctx.res.writeHead(302, { Location: '/user-configuration/roles' })
    ctx.res.end()
  }

  return { props: {} }
}

ConfigurationPage.acl = {
  action: 'read',
  subject: SubjectTypes.UserConfiguration
}

export default ConfigurationPage
