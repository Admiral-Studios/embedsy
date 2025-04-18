import Icon from 'src/@core/components/icon'
import ItemCard from 'src/components/shared/ItemCard'
import { PageTypesEnum } from 'src/enums/pageTypes'
import { PageType, ReportDataToUpdateType, UserRoleType } from 'src/types/types'
import { DensityTypes } from '../types/types'
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material'
import { Dispatch, SetStateAction, useContext, useState } from 'react'
import { UserConfigurationContext } from 'src/context/UserConfiguration/UserConfigurationSharedDataContext'
import RefreshIcon from '@mui/icons-material/Refresh'
import { styled } from '@mui/material/styles'
import uppercaseFirstLetter from 'src/utils/uppercaseFirstLetter'
import moment from 'moment'
import { useSwitchableSetOfIds } from 'src/hooks/useSwitchableSetOfIds'
import ChipItem from 'src/components/shared/ChipItem'

interface Props {
  checked: boolean
  handleSelect: (id: number) => void
  page: PageType
  density: DensityTypes
  clickEditButton: (page: PageType) => void
  setOpenRemoveModal: (open: boolean) => void
  setPageIdToDelete: (id: number) => void
  setSelectedIds: Dispatch<SetStateAction<number[]>>
  setRoleUsers: Dispatch<SetStateAction<UserRoleType[] | null>>
  setRoleToRemove: Dispatch<
    SetStateAction<{
      role: string
      parentPageId: number | null
      report: string | null
      pageId: number
    } | null>
  >
  setExistingPageToAddRole: Dispatch<SetStateAction<PageType | null>>
}

const FooterItemHeaderStyled = styled(Typography)(() => ({
  textAlign: 'center',
  fontWeight: '500'
}))

const FooterItemValueStyled = styled(Typography)(() => ({
  textAlign: 'center'
}))

const getTitleWithIcons = (title: string, data?: ReportDataToUpdateType) => {
  if (data?.isRemoved) {
    return (
      <>
        {title}
        <Tooltip title='Delete' placement='top'>
          <IconButton style={{ marginLeft: 5 }}>
            <Icon key='delete' fontSize={28} color='#f24242' icon='material-symbols:delete-outline' />
          </IconButton>
        </Tooltip>
      </>
    )
  }

  if (data?.shouldUpdateReportName || data?.shouldUpdateWorkspaceName) {
    return (
      <>
        {title}
        <Tooltip title='Edit' placement='top'>
          <IconButton style={{ marginLeft: 5 }}>
            <Icon key='rename' style={{ marginLeft: 4 }} fontSize={28} icon='mdi:rename-outline' />
          </IconButton>
        </Tooltip>
      </>
    )
  }

  return title
}

const PagesCard = (props: Props) => {
  const {
    checked,
    handleSelect,
    page,
    density,
    clickEditButton,
    setOpenRemoveModal,
    setPageIdToDelete,
    setSelectedIds,
    setRoleUsers,
    setRoleToRemove,
    setExistingPageToAddRole
  } = props
  const { ids: loadedUsersPagesIds, toggleId: togglePageId } = useSwitchableSetOfIds()
  const [isPowerBiSyncing, setIsPowerBiSyncing] = useState(false)
  const previewPages = page.preview_pages
  const isRemoved = !!page?.dataToUpdate?.isRemoved
  const rowLevelRole = page.row_level_role ?? ''
  const { handleRefreshClick } = useContext(UserConfigurationContext)
  const isReport = page.type !== PageTypesEnum.Iframe && page.type !== PageTypesEnum.Hyperlink
  const displayStatus = status ? uppercaseFirstLetter(status) : 'N/A'

  const handlePowerBiSync = () => {
    setIsPowerBiSyncing(true)

    setIsPowerBiSyncing(false)
  }

  return (
    <ItemCard
      key={page.id}
      checked={checked}
      onSelect={handleSelect}
      id={page.id}
      title={getTitleWithIcons(
        page.type === PageTypesEnum.Iframe
          ? page.iframe_title || ''
          : page.type === PageTypesEnum.Hyperlink
          ? `${page.hyperlink_title} (${page.hyperlink_url})` || ''
          : page.report,
        page.dataToUpdate
      )}
      density={density}
      isRemoved={isRemoved}
      topControls={
        <>
          <Tooltip title='Tooltip' placement='top'>
            <Button variant='outlined' onClick={handlePowerBiSync}>
              {isPowerBiSyncing ? 'Syncing...' : 'Sync with Power BI'}
            </Button>
          </Tooltip>

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
                    {page.last_refresh_date ? moment(page.last_refresh_date).format('YYYY/MM/DD - HH:mm:ss') : '-'}
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
          <Button variant='contained' size='small' sx={{ borderRadius: 4 }} onClick={() => togglePageId(page.id)}>
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

        <Button variant='outlined' size='small' sx={{ borderRadius: 4 }} onClick={() => setExistingPageToAddRole(page)}>
          Add Role +
        </Button>
      </Box>
    </ItemCard>
  )
}

export default PagesCard
