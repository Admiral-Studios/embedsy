import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    const {
      role_id,
      overwrite,
      main_logo,
      main_logo_on_dark,
      favicon,
      favicon_on_dark,
      main_logo_width,
      favicon_width,
      main_color,
      main_color_on_dark,
      loading_spinner,
      loading_spinner_on_dark,
      loading_spinner_width,
      powerbi_light_theme,
      powerbi_dark_theme,
      login_page_image,
      registration_page_image
    } = req.body

    if (!role_id) {
      res.status(400).json({ message: 'Role ID is required for updating branding' })

      return
    }

    const updateFields = []
    updateFields.push(`overwrite = ${overwrite === null ? 'NULL' : `'${overwrite}'`}`)
    if (main_logo !== undefined) updateFields.push(`main_logo = ${main_logo === null ? 'NULL' : `'${main_logo}'`}`)
    if (main_logo_on_dark !== undefined)
      updateFields.push(`main_logo_on_dark = ${main_logo_on_dark === null ? 'NULL' : `'${main_logo_on_dark}'`}`)
    if (favicon !== undefined) updateFields.push(`favicon = ${favicon === null ? 'NULL' : `'${favicon}'`}`)
    if (favicon_on_dark !== undefined)
      updateFields.push(`favicon_on_dark = ${favicon_on_dark === null ? 'NULL' : `'${favicon_on_dark}'`}`)
    if (main_logo_width !== undefined)
      updateFields.push(`main_logo_width = ${main_logo_width === null ? 'NULL' : main_logo_width}`)
    if (favicon_width !== undefined)
      updateFields.push(`favicon_width = ${favicon_width === null ? 'NULL' : `'${favicon_width}'`}`)
    if (main_color !== undefined) updateFields.push(`main_color = ${main_color === null ? 'NULL' : `'${main_color}'`}`)
    if (main_color_on_dark !== undefined)
      updateFields.push(`main_color_on_dark = ${main_color_on_dark === null ? 'NULL' : `'${main_color_on_dark}'`}`)
    if (loading_spinner !== undefined)
      updateFields.push(`loading_spinner = ${loading_spinner === null ? 'NULL' : `'${loading_spinner}'`}`)
    if (loading_spinner_on_dark !== undefined)
      updateFields.push(
        `loading_spinner_on_dark = ${loading_spinner_on_dark === null ? 'NULL' : `'${loading_spinner_on_dark}'`}`
      )
    if (loading_spinner_width !== undefined)
      updateFields.push(
        `loading_spinner_width = ${loading_spinner_width === null ? 'NULL' : `'${loading_spinner_width}'`}`
      )
    if (powerbi_light_theme !== undefined)
      updateFields.push(`powerbi_light_theme = ${powerbi_light_theme === null ? 'NULL' : `'${powerbi_light_theme}'`}`)
    if (powerbi_dark_theme !== undefined)
      updateFields.push(`powerbi_dark_theme = ${powerbi_dark_theme === null ? 'NULL' : `'${powerbi_dark_theme}'`}`)
    if (login_page_image !== undefined)
      updateFields.push(`login_page_image = ${login_page_image === null ? 'NULL' : `'${login_page_image}'`}`)
    if (registration_page_image !== undefined)
      updateFields.push(
        `registration_page_image = ${registration_page_image === null ? 'NULL' : `'${registration_page_image}'`}`
      )

    if (updateFields.length === 0) {
      res.status(400).json({ message: 'No valid fields provided for update' })

      return
    }

    try {
      const updateQuery = `
        UPDATE role_branding SET
          ${updateFields.join(', ')}
        WHERE role_id = ${role_id};
      `

      await ExecuteQuery(updateQuery)
      res.status(200).json({ message: 'Role branding updated successfully' })
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to update role branding', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
