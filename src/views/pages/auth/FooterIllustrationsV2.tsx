// ** React Imports
import { ReactNode } from 'react'

// ** MUI Components
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

interface FooterIllustrationsV2Prop {
  height?: number
  image?: ReactNode
  className?: string
}

const FooterIllustrationsV2 = (props: FooterIllustrationsV2Prop) => {
  // ** Props
  const { image, className } = props

  // ** Hook
  const theme = useTheme()

  // ** Vars
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  if (!hidden && image) {
    return (
      <>{typeof image === 'string' ? <img alt='footer illustration' src={image} className={className} /> : image}</>
    )
  } else {
    return null
  }
}

export default FooterIllustrationsV2
