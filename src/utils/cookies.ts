import { serialize, parse, CookieSerializeOptions } from 'cookie'
import { NextApiResponse } from 'next/types'

export const setCookie = (
  res: NextApiResponse,
  name: string,
  value: string | Record<string, unknown>,
  options: CookieSerializeOptions
) => {
  const stringValue = typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value)

  if ('maxAge' in options) {
    if (options.maxAge) {
      options.expires = new Date(Date.now() + options.maxAge)
    }
  }

  res.setHeader('Set-Cookie', serialize(name, String(stringValue), options))
}

export const parseCookies = (req: { headers: { cookie: string } }) => {
  return parse(req.headers.cookie || '')
}

export const serializeCookie = (name: string, value: string, options = {}) => {
  return serialize(name, value, {
    httpOnly: true, // Set the cookie as HttpOnly
    secure: process.env.NODE_ENV === 'production', // Only send in production
    sameSite: 'strict',
    ...options
  })
}

export const readCookieOnClientSide = (name: string) => {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length)
  }

  return null
}
