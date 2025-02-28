import { useContext, useMemo, useState } from 'react'
import { Box, Button, CircularProgress, DialogContent, Grid, Tooltip, Typography } from '@mui/material'
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog'
import moment from 'moment'
import uppercaseFirstLetter from 'src/utils/uppercaseFirstLetter'
import PagesModal from './components/PagesModal'
import Icon from 'src/@core/components/icon'
import {
  PageType,
  PowerBiReportType,
  ReportDataToUpdateType,
  RoleType,
  UserRoleType,
  WorkspaceType
} from 'src/types/types'
import useDebounce from 'src/hooks/useDebounce'
import Filter from './components/Filter'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomDialog from 'src/components/shared/CustomDialog'
import AddExistingRoleModal from './components/AddExistingRoleModal'
import toast from 'react-hot-toast'
import DensityButtons from './components/DensityButtons'
import ItemList from 'src/components/shared/ItemList'
import ItemCard from 'src/components/shared/ItemCard'
import ChipItem from 'src/components/shared/ChipItem'
import { CONFIG_ITEMS_PER_PAGE } from 'src/constants/pagination'
import { DensityTypes } from './types/types'
import { useSwitchableSetOfIds } from 'src/hooks/useSwitchableSetOfIds'
import { PageTypesEnum } from 'src/enums/pageTypes'
import { checkIfTypeIsPowerBi } from 'src/utils/configurationUtils'
import { UserConfigurationContext } from 'src/context/UserConfiguration/UserConfigurationSharedDataContext'
import { PagesContext } from 'src/context/UserConfiguration/PagesContext'
import { RolesContext } from 'src/context/UserConfiguration/RolesContext'
import { useAuth } from 'src/hooks/useAuth'
import { styled } from '@mui/material/styles'
import RefreshIcon from '@mui/icons-material/Refresh'

const getTitleWithIcons = (title: string, dataForCheck?: ReportDataToUpdateType) => (
  <>
    {title}
    {dataForCheck?.isRemoved && (
      <Icon style={{ marginLeft: 4 }} fontSize={32} color='#f24242' icon='material-symbols:delete-outline' />
    )}
    {(dataForCheck?.shouldUpdateReportName || dataForCheck?.shouldUpdateWorkspaceName) && (
      <Icon style={{ marginLeft: 4 }} fontSize={32} icon='mdi:rename-outline' />
    )}
  </>
)

const FooterItemHeaderStyled = styled(Typography)(() => ({
  textAlign: 'center',
  fontWeight: '500'
}))

const FooterItemValueStyled = styled(Typography)(() => ({
  textAlign: 'center'
}))

const PagesScreen = () => {
  const { handleRefreshClick, reportsNeedUpdating, syncReportsWithTenant } = useContext(UserConfigurationContext)
  const { removeAllPageRolesById, addUpdatePage, pages } = useContext(PagesContext)
  const { isAdmin, isSuperAdmin } = useAuth()
  const { removeRoleReport, roles } = useContext(RolesContext)

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [openModal, setOpenModal] = useState(false)
  const [openRemoveModal, setOpenRemoveModal] = useState(false)
  const [pageReportToUpdate, setPageReportToUpdate] = useState<PageType | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [visiblePages, setVisiblePages] = useState(CONFIG_ITEMS_PER_PAGE)
  const [pagesType, setPagesType] = useState<string[]>([])
  const [pageIdToDelete, setPageIdToDelete] = useState<number | null>(null)
  const [roleToRemove, setRoleToRemove] = useState<{
    role: string
    parentPageId: number | null
    report: string | null
    pageId: number
  } | null>(null)
  const [roleUsers, setRoleUsers] = useState<UserRoleType[] | null>(null)
  const [existingPageToAddRole, setExistingPageToAddRole] = useState<PageType | null>(null)
  const [density, setDensity] = useState<DensityTypes>('standard')
  const [isLoadingSync, setIsLoadingSync] = useState(false)

  const { ids: loadedUsersPagesIds, toggleId: togglePageId } = useSwitchableSetOfIds()

  const rolesAvailableToAdd = useMemo(
    () => roles.filter(r => !existingPageToAddRole?.roles?.find(({ id }) => id === r.id)),
    [roles, existingPageToAddRole]
  )

  const debouncedSearch = useDebounce(searchTerm, 500)

  const searchedPages = useMemo(() => {
    const searched = pages.filter(page =>
      page.type === PageTypesEnum.Iframe
        ? page.iframe_title?.toLowerCase().includes(debouncedSearch.toLowerCase().trim())
        : page.type === PageTypesEnum.Hyperlink
        ? page.hyperlink_title?.toLowerCase().includes(debouncedSearch.toLowerCase().trim())
        : page.report.toLowerCase().includes(debouncedSearch.toLowerCase().trim())
    )

    if (pagesType.length) {
      return searched.filter(({ type }) => type && pagesType.includes(type))
    }

    return searched
  }, [debouncedSearch, pages, pagesType])

  const getPageTitle = (page: PageType): string => {
    if (page.type === PageTypesEnum.Iframe) {
      return page.iframe_title || ''
    } else if (page.type === PageTypesEnum.Hyperlink) {
      return page.hyperlink_title || ''
    } else {
      return page.report
    }
  }

  const getDeleteDialogTitle = (): string => {
    if (pageIdToDelete) {
      const page = pages.find(p => p.id === pageIdToDelete)
      if (page) {
        return `Delete page ${getPageTitle(page)}?`
      }
      
return 'Delete page?'
    }

    if (selectedIds.length === 0) {
      return 'Delete pages?'
    }

    if (selectedIds.length === 1) {
      const page = pages.find(p => p.id === selectedIds[0])
      if (page) {
        return `Delete page ${getPageTitle(page)}?`
      }
      
return 'Delete page?'
    }

    const pageTitles = selectedIds
      .map(id => {
        const page = pages.find(p => p.id === id)
        
return page ? getPageTitle(page) : null
      })
      .filter(Boolean)
      .join(', ')

    return `Delete pages ${pageTitles}?`
  }

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(prevId => prevId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const clickEditButton = (page: PageType) => {
    setPageReportToUpdate(page)

    setOpenModal(true)
  }

  const loadMore = () => {
    setVisiblePages(Math.min(visiblePages + CONFIG_ITEMS_PER_PAGE, searchedPages.length))
  }

  const loadAll = () => {
    setVisiblePages(searchedPages.length)
  }

  const removeHandler = async () => {
    await removeAllPageRolesById(pageIdToDelete ? [pageIdToDelete] : selectedIds)
    setSelectedIds([])
    setPageIdToDelete(null)

    setOpenRemoveModal(false)
  }

  const removeRoleHandler = async () => {
    if (roleToRemove?.parentPageId) await removeRoleReport(roleToRemove?.parentPageId)

    setRoleToRemove(null)
  }

  const addNewRoleToExistingPage = async (newRole: RoleType) => {
    if (existingPageToAddRole) {
      const { error } = await addUpdatePage({
        ...existingPageToAddRole,
        report: {
          name: existingPageToAddRole.report,
          id: existingPageToAddRole.report_id,
          datasetId: existingPageToAddRole.dataset_id
        },
        workspace: {
          id: existingPageToAddRole.workspace_id,
          name: existingPageToAddRole.workspace
        },
        roles: [...existingPageToAddRole.roles, { ...newRole, parentPageId: null }],
        id: null
      })

      if (error) {
        toast.error(error)
      }
    }
  }

  // todo: refactor this, duplicate found in RolesScreen, AddRoleModal
  const onSaveUpdatePage = async (
    pageType: string,
    workspace: WorkspaceType | null,
    report: PowerBiReportType | null,
    iframeHtml: string | null,
    iframeTitle: string | null,
    hyperlinkUrl: string | null,
    hyperlinkTitle: string | null,
    hyperlinkNewTab: boolean | null,
    roles: RoleType[],
    rowLevelRole: string,
    previewPage: boolean
  ) => {
    if (
      checkIfTypeIsPowerBi(pageType)
        ? workspace && report
        : pageType === PageTypesEnum.Hyperlink
        ? hyperlinkUrl && hyperlinkTitle
        : iframeHtml && iframeTitle
    ) {
      const { error } = await addUpdatePage({
        id: pageReportToUpdate?.id,
        workspace,
        report,
        iframe_html: iframeHtml,
        iframe_title: iframeTitle,
        hyperlink_url: hyperlinkUrl,
        hyperlink_title: hyperlinkTitle,
        hyperlink_new_tab: hyperlinkNewTab,
        preview_pages: previewPage,
        roles: roles.map(r => ({
          ...r,
          parentPageId: pageReportToUpdate?.roles.find(({ id }) => id === r.id)?.parentPageId || null
        })),
        type: pageType,
        row_level_role: rowLevelRole
      })

      return error
    }

    return null
  }

  const syncReports = async () => {
    try {
      setIsLoadingSync(true)

      await toast.promise(syncReportsWithTenant(), {
        loading: 'Synchronization is in progress',
        success: 'Synchronization was successful',
        error: 'Synchronization failed'
      })

      setIsLoadingSync(false)
    } catch (error) {
      setIsLoadingSync(false)
    }
  }

  if (!pages.length)
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )

  return (
    <>
      <ItemList
        controls={
          <Grid container spacing={4} mb={6} sx={{ alignItems: 'flex-end' }}>
            <Grid item md={3.5} xs={12}>
              <CustomTextField
                label='Search By Title'
                placeholder='Enter Search Term'
                fullWidth
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </Grid>

            <Grid item md={3} xs={12}>
              <Filter
                value={pagesType || []}
                onChange={newTypes => setPagesType(newTypes)}
                options={Object.values(PageTypesEnum)}
                label='Filter By Type'
              />
            </Grid>
            <Grid item md={5.5} xs={12}>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 2
                }}
              >
                <Button variant='contained' onClick={() => setOpenModal(true)}>
                  Add Page
                </Button>

                <Button
                  variant='contained'
                  color='error'
                  disabled={!selectedIds.length}
                  onClick={() => setOpenRemoveModal(true)}
                >
                  Delete Pages
                </Button>

                <DensityButtons density={density} onChangeDensity={d => setDensity(d)} />
              </Box>
            </Grid>

            {(isAdmin || isSuperAdmin) && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end'
                  }}
                >
                  <Tooltip
                    title={
                      !reportsNeedUpdating.length
                        ? 'All reports are up to date'
                        : `${reportsNeedUpdating.length} reports need to be updated or deleted`
                    }
                  >
                    <span>
                      <Button
                        variant='contained'
                        onClick={syncReports}
                        disabled={!reportsNeedUpdating.length || isLoadingSync}
                        sx={{
                          '&.Mui-disabled': {
                            pointerEvents: 'auto',

                            '&:hover': {
                              backgroundColor: 'rgba(47, 43, 61, 0.12)',
                              boxShadow: 'none'
                            }
                          }
                        }}
                      >
                        Sync Reports with Power BI Service
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
              </Grid>
            )}
          </Grid>
        }
      >
        {searchedPages.slice(0, visiblePages).map(page => {
          const previewPages = page.preview_pages
          const status = page.last_refresh_status
          const rowLevelRole = page.row_level_role ?? ''
          const displayStatus = status ? uppercaseFirstLetter(status) : 'N/A'
          const isReport = page.type !== PageTypesEnum.Iframe && page.type !== PageTypesEnum.Hyperlink

          return (
            <ItemCard
              key={page.id}
              checked={selectedIds.includes(page.id)}
              onSelect={handleSelect}
              id={page.id}
              title={getTitleWithIcons(
                page.type === PageTypesEnum.Iframe
                  ? page.iframe_title || ''
                  : page.type === PageTypesEnum.Hyperlink
                  ? `${page.hyperlink_title} (${page.hyperlink_url})` || ''
                  : page.report,
                page.dataToUpdate!
              )}
              density={density}
              isRemoved={!!page?.dataToUpdate?.isRemoved}
              topControls={
                <>
                  {page.type === PageTypesEnum.PowerBiReport && (
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
                      {page?.last_refresh_status === 'unknown' ? 'Refreshing Page' : 'Refresh Page'}
                    </Button>
                  )}

                  <Button variant='outlined' onClick={() => clickEditButton(page)}>
                    Edit Page
                  </Button>

                  <Button
                    variant='outlined'
                    color='error'
                    onClick={() => {
                      setOpenRemoveModal(true)
                      setPageIdToDelete(page.id)
                      setSelectedIds(prev => prev.filter(prevId => prevId !== page.id))
                    }}
                  >
                    Delete Page
                  </Button>
                </>
              }
              footerControls={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, width: '100%', mt: 8 }}>
                  <Box sx={{ display: 'flex', gap: 6, pl: 12 }}>
                    {rowLevelRole && (
                      <Box>
                        <FooterItemHeaderStyled>Row Level Role</FooterItemHeaderStyled>
                        <FooterItemValueStyled>{rowLevelRole}</FooterItemValueStyled>
                      </Box>
                    )}

                    {isReport && (
                      <Box>
                        <FooterItemHeaderStyled>Preview pages</FooterItemHeaderStyled>

                        <Box sx={{ textAlign: 'center' }}>
                          <Icon icon={previewPages ? 'mdi:check' : 'mdi:close'} />
                        </Box>
                      </Box>
                    )}

                    {isReport && (
                      <>
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
                      </>
                    )}
                  </Box>
                </Box>
              }
            >
              <Box sx={{ mt: 4, display: 'flex', gap: 2, alignContent: 'center', flexWrap: 'wrap' }}>
                {(loadedUsersPagesIds.has(page.id) ? page?.users : page.users.slice(0, 10))?.map(user => (
                  <ChipItem variant='outlined' key={user.id} size='medium' label={user.email} color='primary' />
                ))}

                {page.users?.length > 10 && (
                  <Button
                    variant='contained'
                    size='small'
                    sx={{ borderRadius: 4 }}
                    onClick={() => togglePageId(page.id)}
                  >
                    {loadedUsersPagesIds.has(page.id) ? 'Hide' : 'Show More'}
                  </Button>
                )}
              </Box>

              <Box sx={{ mt: 8, display: 'flex', gap: 2, alignContent: 'center', flexWrap: 'wrap' }}>
                {page.roles.map(role => (
                  <ChipItem
                    key={role.id}
                    size='medium'
                    label={role.role}
                    color='primary'
                    onClick={e => {
                      e.stopPropagation()
                      setRoleUsers(page.users.filter(({ role_id }) => role_id === role.id))
                    }}
                    onDelete={() =>
                      setRoleToRemove({
                        role: role.role,
                        parentPageId: role.parentPageId,
                        report: page.type === PageTypesEnum.PowerBiReport ? page.report : page.iframe_title,
                        pageId: page.id
                      })
                    }
                    sx={{
                      height: '26px',
                      '&:hover': {
                        backgroundColor: '#FFC815',
                        boxShadow: '0px 2px 4px 0px rgba(29, 29, 29, 0.251)'
                      }
                    }}
                  />
                ))}

                <Button
                  variant='outlined'
                  size='small'
                  sx={{ borderRadius: 4 }}
                  onClick={() => setExistingPageToAddRole(page)}
                >
                  Add Role +
                </Button>
              </Box>
            </ItemCard>
          )
        })}
      </ItemList>

      {visiblePages < searchedPages.length && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, mt: 6 }}>
          <Button variant='outlined' onClick={loadMore}>
            Load More
          </Button>

          <Button variant='outlined' onClick={loadAll}>
            Load All
          </Button>
        </Box>
      )}

      <ConfirmationDialog
        open={openRemoveModal || !!pageIdToDelete}
        onClose={() => {
          setPageIdToDelete(null)
          setOpenRemoveModal(false)
        }}
        onHandleConfirm={removeHandler}
        title={getDeleteDialogTitle()}
      />

      <ConfirmationDialog
        open={!!roleToRemove}
        onClose={() => setRoleToRemove(null)}
        onHandleConfirm={removeRoleHandler}
        title={`Delete ${roleToRemove?.role} role from ${roleToRemove?.report} page?`}
      />

      <PagesModal
        handleProcessed={onSaveUpdatePage}
        pageReportToUpdate={pageReportToUpdate}
        open={openModal}
        onClose={() => {
          setOpenModal(false)
          setPageReportToUpdate(null)
        }}
      />

      <CustomDialog open={!!roleUsers} handleClose={() => setRoleUsers(null)} fullWidth maxWidth='md'>
        <DialogContent>
          <Typography variant='h3' sx={{ fontSize: '18px', pt: 2, lineHeight: '22px', mb: 4 }}>
            Users
          </Typography>

          {roleUsers &&
            roleUsers.map(user => (
              <Typography key={user.id} sx={{ py: 2 }}>
                {user.email}
              </Typography>
            ))}
        </DialogContent>
      </CustomDialog>

      <AddExistingRoleModal
        open={!!existingPageToAddRole}
        onClose={() => setExistingPageToAddRole(null)}
        roles={rolesAvailableToAdd}
        handleProcessed={addNewRoleToExistingPage}
      />
    </>
  )
}

export default PagesScreen
