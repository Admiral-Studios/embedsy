import { Box } from '@mui/material'
import { SlackChannel, SlackUser } from 'src/types/apps/slackTypes'
import { Icon } from '@iconify/react'

interface Props {
  option: any
  contact: SlackChannel | SlackUser | null
}

export const SlackAutocompleteOption = ({ option, contact }: Props) => {
  if (contact === null) return null

  if ('is_channel' in contact === true) {
    return (
      <Box {...option} display='flex' alignItems='center' gap={2} padding={2}>
        <Icon icon='tabler:hash' width={24} /> {contact.name_normalized}
      </Box>
    )
  }

  // if (contact.is_bot === true) {
  //   return (
  //     <Box {...option} display='flex' alignItems='center' gap={2} padding={2}>
  //       {contact?.profile?.image_original ? (
  //         <img
  //           style={{ borderRadius: '4px' }}
  //           src={contact?.profile?.image_original || ''}
  //           alt='contact avatar'
  //           width={24}
  //           height={24}
  //         />
  //       ) : (
  //         <img
  //           style={{ borderRadius: '4px' }}
  //           src='https://ca.slack-edge.com/T08GRTNRA9J-U08G8358R63-gf7f47b68b4f-48'
  //           alt='contact avatar'
  //           width={24}
  //           height={24}
  //         />
  //       )}
  //       <Typography variant='body1'>{contact?.profile?.display_name || contact?.profile?.real_name}</Typography>
  //     </Box>
  //   )
  // }

  // if (contact?.profile?.display_name || contact?.profile?.real_name) {
  //   return (
  //     <Box {...option} display='flex' alignItems='center' gap={2} padding={2}>
  //       {contact?.profile?.image_original ? (
  //         <img
  //           style={{ borderRadius: '4px' }}
  //           src={contact?.profile?.image_original || ''}
  //           alt='contact avatar'
  //           width={24}
  //           height={24}
  //         />
  //       ) : (
  //         <img
  //           style={{ borderRadius: '4px' }}
  //           src='https://ca.slack-edge.com/T08GRTNRA9J-U08G8358R63-gf7f47b68b4f-48'
  //           alt='contact avatar'
  //           width={24}
  //           height={24}
  //         />
  //       )}

  //       <Typography variant='body1'>{contact?.profile?.display_name || contact?.profile?.real_name}</Typography>
  //     </Box>
  //   )
  // }

  return null
}
