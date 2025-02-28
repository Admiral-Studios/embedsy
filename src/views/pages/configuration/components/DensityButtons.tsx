import { Button, ListItemIcon, Menu, MenuItem } from '@mui/material'
import React, { useState } from 'react'
import IconifyIcon from 'src/@core/components/icon'
import { DensityTypes } from '../types/types'

type Props = {
  density: 'standard' | 'compact'
  onChangeDensity: (density: DensityTypes) => void
}

const DensityButtons = ({ density, onChangeDensity }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  return (
    <>
      <Button
        variant='outlined'
        id='density-button'
        onClick={e => setAnchorEl(e.currentTarget)}
        startIcon={<IconifyIcon icon='mdi:view-sequential' />}
      >
        Density
      </Button>

      <Menu
        id='basic-density-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{
          sx: { maxHeight: '200px' }
        }}
      >
        <MenuItem
          selected={density === 'compact'}
          onClick={() => {
            onChangeDensity('compact')
            setAnchorEl(null)
          }}
        >
          <ListItemIcon>
            <IconifyIcon icon='mdi:view-headline' />
          </ListItemIcon>{' '}
          Compact
        </MenuItem>

        <MenuItem
          selected={density === 'standard'}
          onClick={() => {
            onChangeDensity('standard')
            setAnchorEl(null)
          }}
        >
          <ListItemIcon>
            <IconifyIcon icon='mdi:view-sequential' />
          </ListItemIcon>{' '}
          Standard
        </MenuItem>
      </Menu>
    </>
  )
}

export default DensityButtons
