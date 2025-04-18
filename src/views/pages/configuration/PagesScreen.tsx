import { useContext, useMemo, useState } from 'react'
import { Box, Button, CircularProgress, DialogContent, Grid, Typography } from '@mui/material'
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog'
import PagesModal from './components/PagesModal'
import { PageType, PowerBiReportType, RoleType, UserRoleType, WorkspaceType } from 'src/types/types'
import useDebounce from 'src/hooks/useDebounce'
import Filter from './components/Filter'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomDialog from 'src/components/shared/CustomDialog'
import AddExistingRoleModal from './components/AddExistingRoleModal'
import toast from 'react-hot-toast'
import DensityButtons from './components/DensityButtons'
import ItemList from 'src/components/shared/ItemList'
import { CONFIG_ITEMS_PER_PAGE } from 'src/constants/pagination'
import { DensityTypes } from './types/types'
import { PageTypesEnum } from 'src/enums/pageTypes'
import { checkIfTypeIsPowerBi } from 'src/utils/configurationUtils'
import { UserConfigurationContext } from 'src/context/UserConfiguration/UserConfigurationSharedDataContext'
import { PagesContext } from 'src/context/UserConfiguration/PagesContext'
import { RolesContext } from 'src/context/UserConfiguration/RolesContext'
import PagesCard from './components/PagesCard'

const PagesScreen = () => {
  const { reportsNeedUpdating, loadingData, workspaceError } = useContext(UserConfigurationContext)
  const { removeAllPageRolesById, addUpdatePage, pages } = useContext(PagesContext)
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

  const rolesAvailableToAdd = useMemo(
    () => roles.filter(r => !existingPageToAddRole?.roles?.find(({ id }) => id === r.id)),
    [roles, existingPageToAddRole]
  )

  console.log(reportsNeedUpdating)

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

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  const renderControls = () => (
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
    </Grid>
  )

  return (
    <>
      <ItemList controls={renderControls()}>
        {workspaceError && (
          <Typography sx={{ textAlign: 'center', width: '100%' }}>
            {workspaceError}
            <br />
            For more information, click{' '}
            <a
              href='https://embedsy.io/documentation/installation/service_principal'
              style={{ color: 'inherit', fontWeight: 'bold' }}
              target='_blank'
            >
              here
            </a>
            .
          </Typography>
        )}

        {pages.length > 0 ? (
          searchedPages
            .slice(0, visiblePages)
            .map(page => (
              <PagesCard
                key={page.id}
                checked={selectedIds.includes(page.id)}
                handleSelect={handleSelect}
                page={page}
                density={density}
                clickEditButton={clickEditButton}
                setOpenRemoveModal={setOpenRemoveModal}
                setPageIdToDelete={setPageIdToDelete}
                setSelectedIds={setSelectedIds}
                setRoleUsers={setRoleUsers}
                setRoleToRemove={setRoleToRemove}
                setExistingPageToAddRole={setExistingPageToAddRole}
              />
            ))
        ) : !workspaceError ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', mt: 8 }}>
            <Typography variant='h6'>There are no pages available.</Typography>
          </Box>
        ) : null}
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
