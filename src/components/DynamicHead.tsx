import { useSettings } from 'src/@core/hooks/useSettings'
import Head from 'next/head'

const DynamicHead = () => {
  const { appPortalSettings } = useSettings()
  const browserTabTitle = appPortalSettings?.browser_tab_title || ''

  return (
    <Head>
      <title>{`${browserTabTitle}`}</title>
      <meta name='description' content={`${browserTabTitle}`} />
      <meta name='viewport' content='initial-scale=1, width=device-width' />
    </Head>
  )
}

export default DynamicHead
