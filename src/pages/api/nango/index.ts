import { Nango } from '@nangohq/node'

const secretKey = process.env.NEXT_PUBLIC_NANGO_SECRET_KEY || ''

export const nango = new Nango({
  secretKey
})
