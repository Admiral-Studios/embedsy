import { Box } from '@mui/material'
import React, { ReactNode } from 'react'

type Props = {
  children?: ReactNode
  controls?: ReactNode
}

const ItemList = ({ children, controls }: Props) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        {controls}
      </Box>

      {children}
    </Box>
  )
}

export default ItemList
