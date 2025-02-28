import { Card, CardContent } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import { SubjectTypes } from 'src/types/acl/subjectTypes'

const IframeIdPage = () => {
  const { query } = useRouter()

  const { user } = useAuth()

  const iframe = useMemo(
    () => user?.iframes.find(({ iframe_title }) => iframe_title?.replace(' ', '_').toLowerCase() === query.iframeTitle),
    [user?.iframes, query.iframeTitle]
  )

  const hasHeight = iframe?.iframe_html?.includes('height=')

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent
            sx={{
              height: !hasHeight ? '100vh' : {},
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {iframe?.iframe_html && (
              <div
                dangerouslySetInnerHTML={{
                  __html: hasHeight
                    ? iframe.iframe_html.replace('<iframe', '<iframe style="border-width:0px"')
                    : iframe.iframe_html.replace('<iframe', '<iframe style="border-width:0px" height="100%"')
                }}
                style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center' }}
              ></div>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

IframeIdPage.acl = {
  action: 'read',
  subject: SubjectTypes.IframeIdPage
}

export default IframeIdPage
