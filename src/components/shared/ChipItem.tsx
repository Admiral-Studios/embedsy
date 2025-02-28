import { Chip, ChipProps } from '@mui/material'
import React from 'react'

const ChipItem = (props: ChipProps) => {
  return <Chip size='medium' color='primary' sx={{ height: '28px' }} {...props} />
}
export default ChipItem
