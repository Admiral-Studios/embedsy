import Icon from 'src/@core/components/icon'
import { IconButton, IconButtonProps } from '@mui/material'
import { Theme } from '@mui/material/styles'

interface Props extends IconButtonProps {
  disabled: boolean
  onClick: () => void
}

const customStyle = (theme: Theme) => ({ color: `rgba(${theme.palette.customColors.main}, 0.75)` })

function ModeFullscreen({ disabled, onClick, ...rest }: Props) {
  return (
    <IconButton sx={customStyle} disabled={disabled} onClick={onClick} {...rest}>
      <Icon fontSize='1.5rem' icon='octicon:screen-full-24' />
    </IconButton>
  )
}

export default ModeFullscreen
