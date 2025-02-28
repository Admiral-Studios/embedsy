import { Box, Card, CardContent, Checkbox, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { ReactNode, useState } from 'react'
import IconifyIcon from 'src/@core/components/icon'
import { DensityTypes } from 'src/views/pages/configuration/types/types'

type Props = {
  checked?: boolean
  onSelect?: (id: number) => void
  id: number
  children: ReactNode
  topControls?: ReactNode
  footerControls?: ReactNode
  title: ReactNode
  density?: DensityTypes
  isRemoved?: boolean
  showCheckbox?: boolean
}

const ItemCard = ({
  checked,
  onSelect,
  id,
  children,
  topControls,
  footerControls,
  title,
  density = 'standard',
  isRemoved,
  showCheckbox = true
}: Props) => {
  const isStandardParentDensity = density === 'standard'

  const [densityType, setDensityType] = useState<null | string>(null)

  const isMainStandardDensity = densityType ? densityType === 'standard' : isStandardParentDensity

  return (
    <Card
      sx={{
        mt: 4,
        ...(isRemoved && {
          border: '1px solid #faa4a4'
        })
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: isMainStandardDensity ? 'flex-start' : 'center',

            '@media (max-width: 588px)': {
              flexDirection: 'column'
            }
          }}
        >
          {showCheckbox && onSelect && (
            <Checkbox
              checked={checked}
              onChange={() => onSelect(id)}
              sx={{
                p: 2,
                '& > svg': {
                  width: '32px',
                  height: '32px'
                }
              }}
            />
          )}

          <Box sx={{ ml: showCheckbox ? 4 : 0, width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                pt: isMainStandardDensity ? 1.5 : 0
              }}
            >
              <Typography
                variant='h3'
                sx={{
                  fontSize: '18px',
                  lineHeight: '22px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {title}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                {topControls}

                <ToggleButtonGroup
                  value={densityType}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue) setDensityType(newValue)
                  }}
                >
                  <ToggleButton value='compact' color='primary' size='small' sx={{ borderRadius: '6px' }}>
                    <IconifyIcon icon='mdi:view-headline' />
                  </ToggleButton>

                  <ToggleButton value='standard' size='small' color='primary' sx={{ borderRadius: '6px' }}>
                    <IconifyIcon icon='mdi:view-sequential' />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
            {isMainStandardDensity && children}
          </Box>
        </Box>

        {footerControls && isMainStandardDensity && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, width: '100%' }}>{footerControls}</Box>
        )}
      </CardContent>
    </Card>
  )
}

export default ItemCard
