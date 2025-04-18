// ** React Imports
import { ReactNode } from 'react'

// ** MUI Components
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'

interface FooterIllustrationsProp {
  image?: ReactNode
  className?: string
}

// Styled Components
const MaskImg = styled('img')(() => ({
  bottom: 0,
  zIndex: -1,
  height: 260,
  width: '100%',
  position: 'absolute'
}))

const FooterIllustrations = (props: FooterIllustrationsProp) => {
  // ** Props
  const { image, className } = props

  // ** Hook
  const theme = useTheme()

  // ** Vars
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  if (!hidden && image) {
    return (
      <>{typeof image === 'string' ? <MaskImg alt='footer illustration' src={image} className={className} /> : image}</>
    )
  } else {
    return null
  }
}

export default FooterIllustrations
