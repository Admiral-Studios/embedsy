import { CircularProgress, Grid } from '@mui/material'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useContext, useState, useEffect } from 'react'
import { Button, Typography } from '@mui/material'
import moment from 'moment'
import uppercaseFirstLetter from 'src/utils/uppercaseFirstLetter'
import RefreshIcon from '@mui/icons-material/Refresh'
import { PageTypesEnum } from 'src/enums/pageTypes'
import ItemList from 'src/components/shared/ItemList'
import ItemCard from 'src/components/shared/ItemCard'
import CustomTextField from 'src/@core/components/mui/text-field'
import DensityButtons from 'src/views/pages/configuration/components/DensityButtons'
import { DensityTypes } from 'src/views/pages/configuration/types/types'
import useDebounce from 'src/hooks/useDebounce'
import { useAuth } from 'src/hooks/useAuth'
import { useRouter } from 'next/router'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import {
  UserConfigurationSharedDataContextProvider,
  UserConfigurationContext
} from 'src/context/UserConfiguration/UserConfigurationSharedDataContext'

const FooterItemHeaderStyled = styled(Typography)(() => ({
  textAlign: 'center',
  fontWeight: '500'
}))

const FooterItemValueStyled = styled(Typography)(() => ({
  textAlign: 'center'
}))

const DatasetsPageContent = () => {
  const router = useRouter()
  const { handleRefreshClick, loadingData, userPages } = useContext(UserConfigurationContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [density, setDensity] = useState<DensityTypes>('standard')
  const { canRefresh, hasAdminPrivileges } = useAuth()

  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (!canRefresh && !hasAdminPrivileges) {
      router.push('/')
    }
  }, [canRefresh, hasAdminPrivileges, router])

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 20 }}>
        <CircularProgress />
      </Box>
    )
  }

  const validPages = userPages.filter(page => page.type === PageTypesEnum.PowerBiReport)

  const filteredPages = validPages.filter(page =>
    page.report.toLowerCase().includes(debouncedSearch.toLowerCase().trim())
  )

  if (validPages.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 20 }}>
        <Typography>No semantic models attributed to your role</Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ItemList
          controls={
            <Grid container spacing={4} mb={6} sx={{ alignItems: 'flex-end' }}>
              <Grid item md={8} xs={12}>
                <CustomTextField
                  label='Search By Title'
                  placeholder='Enter Search Term'
                  fullWidth
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </Grid>
              <Grid item md={4} xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <DensityButtons density={density} onChangeDensity={d => setDensity(d)} />
                </Box>
              </Grid>
            </Grid>
          }
        >
          {filteredPages.map(page => {
            const status = page.last_refresh_status
            const displayStatus = status ? uppercaseFirstLetter(status) : 'N/A'
            const workspaceName = page.workspace

            return (
              <ItemCard
                showCheckbox={false}
                key={page.id}
                id={page.id}
                title={page.report}
                density={density}
                topControls={
                  <>
                    <Button
                      variant='outlined'
                      onClick={() => handleRefreshClick(status, page.workspace_id, page.dataset_id)}
                      startIcon={
                        <RefreshIcon
                          sx={{
                            ...(page?.last_refresh_status === 'unknown' && {
                              animation: 'spin 2s linear infinite',
                              '@keyframes spin': {
                                '0%': {
                                  transform: 'rotate(0deg)'
                                },
                                '100%': {
                                  transform: 'rotate(360deg)'
                                }
                              }
                            })
                          }}
                        />
                      }
                    >
                      {page?.last_refresh_status === 'unknown' ? 'Refreshing Dataset' : 'Refresh Dataset'}
                    </Button>
                  </>
                }
                footerControls={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, width: '100%', mt: 8 }}>
                    <Box sx={{ display: 'flex', gap: 6 }}>
                      <Box>
                        <FooterItemHeaderStyled>Workspace</FooterItemHeaderStyled>
                        <FooterItemValueStyled>{workspaceName}</FooterItemValueStyled>
                      </Box>

                      <Box>
                        <FooterItemHeaderStyled>Last refresh status</FooterItemHeaderStyled>
                        <FooterItemValueStyled>{displayStatus}</FooterItemValueStyled>
                      </Box>

                      <Box>
                        <FooterItemHeaderStyled>Last refresh date</FooterItemHeaderStyled>
                        <FooterItemValueStyled>
                          {page.last_refresh_date
                            ? moment(page.last_refresh_date).format('YYYY/MM/DD - HH:mm:ss')
                            : '-'}
                        </FooterItemValueStyled>
                      </Box>
                    </Box>
                  </Box>
                }
              >
                <Box></Box>
              </ItemCard>
            )
          })}
        </ItemList>
      </Grid>
    </Grid>
  )
}

const DatasetsPage = () => {
  return (
    <UserConfigurationSharedDataContextProvider>
      <DatasetsPageContent />
    </UserConfigurationSharedDataContextProvider>
  )
}

DatasetsPage.acl = {
  action: 'read',
  subject: SubjectTypes.ProfilePage
}

export default DatasetsPage
