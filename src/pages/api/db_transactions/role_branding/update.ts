import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { PermanentRoles } from 'src/context/types'
import { withRole } from 'src/pages/api/middleware/authMiddleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    updateFields.push(`overwrite = ${overwrite === null ? 'NULL' : '@overwrite'}`)
    if (main_logo !== undefined) updateFields.push(`main_logo = ${main_logo === null ? 'NULL' : '@mainLogo'}`)
    if (main_logo_on_dark !== undefined)
      updateFields.push(`main_logo_on_dark = ${main_logo_on_dark === null ? 'NULL' : '@mainLogoOnDark'}`)
    if (favicon !== undefined) updateFields.push(`favicon = ${favicon === null ? 'NULL' : '@favicon'}`)
    if (favicon_on_dark !== undefined)
      updateFields.push(`favicon_on_dark = ${favicon_on_dark === null ? 'NULL' : '@faviconOnDark'}`)
    if (main_logo_width !== undefined)
      updateFields.push(`main_logo_width = ${main_logo_width === null ? 'NULL' : '@mainLogoWidth'}`)
    if (favicon_width !== undefined)
      updateFields.push(`favicon_width = ${favicon_width === null ? 'NULL' : '@faviconWidth'}`)
    if (main_color !== undefined) updateFields.push(`main_color = ${main_color === null ? 'NULL' : '@mainColor'}`)
    if (main_color_on_dark !== undefined)
      updateFields.push(`main_color_on_dark = ${main_color_on_dark === null ? 'NULL' : '@mainColorOnDark'}`)
    if (loading_spinner !== undefined)
      updateFields.push(`loading_spinner = ${loading_spinner === null ? 'NULL' : '@loadingSpinner'}`)
    if (loading_spinner_on_dark !== undefined)
      updateFields.push(
        `loading_spinner_on_dark = ${loading_spinner_on_dark === null ? 'NULL' : '@loadingSpinnerOnDark'}`
      )
    if (loading_spinner_width !== undefined)
      updateFields.push(`loading_spinner_width = ${loading_spinner_width === null ? 'NULL' : '@loadingSpinnerWidth'}`)
    if (powerbi_light_theme !== undefined)
      updateFields.push(`powerbi_light_theme = ${powerbi_light_theme === null ? 'NULL' : '@powerbiLightTheme'}`)
    if (powerbi_dark_theme !== undefined)
      updateFields.push(`powerbi_dark_theme = ${powerbi_dark_theme === null ? 'NULL' : '@powerbiDarkTheme'}`)
    if (login_page_image !== undefined)
      updateFields.push(`login_page_image = ${login_page_image === null ? 'NULL' : '@loginPageImage'}`)
    if (registration_page_image !== undefined)
      updateFields.push(
        `registration_page_image = ${registration_page_image === null ? 'NULL' : '@registrationPageImage'}`
      )

    if (updateFields.length === 0) {
      res.status(400).json({ message: 'No valid fields provided for update' })

      return
    }

    try {
      const updateQuery = `
        UPDATE role_branding SET
          ${updateFields.join(', ')}
        WHERE role_id = @roleId;
      `

      const params: Record<string, any> = { roleId: role_id }

      if (overwrite !== null) params.overwrite = overwrite
      if (main_logo !== null && main_logo !== undefined) params.mainLogo = main_logo
      if (main_logo_on_dark !== null && main_logo_on_dark !== undefined) params.mainLogoOnDark = main_logo_on_dark
      if (favicon !== null && favicon !== undefined) params.favicon = favicon
      if (favicon_on_dark !== null && favicon_on_dark !== undefined) params.faviconOnDark = favicon_on_dark
      if (main_logo_width !== null && main_logo_width !== undefined) params.mainLogoWidth = main_logo_width
      if (favicon_width !== null && favicon_width !== undefined) params.faviconWidth = favicon_width
      if (main_color !== null && main_color !== undefined) params.mainColor = main_color
      if (main_color_on_dark !== null && main_color_on_dark !== undefined) params.mainColorOnDark = main_color_on_dark
      if (loading_spinner !== null && loading_spinner !== undefined) params.loadingSpinner = loading_spinner
      if (loading_spinner_on_dark !== null && loading_spinner_on_dark !== undefined)
        params.loadingSpinnerOnDark = loading_spinner_on_dark
      if (loading_spinner_width !== null && loading_spinner_width !== undefined)
        params.loadingSpinnerWidth = loading_spinner_width
      if (powerbi_light_theme !== null && powerbi_light_theme !== undefined)
        params.powerbiLightTheme = powerbi_light_theme
      if (powerbi_dark_theme !== null && powerbi_dark_theme !== undefined) params.powerbiDarkTheme = powerbi_dark_theme
      if (login_page_image !== null && login_page_image !== undefined) params.loginPageImage = login_page_image
      if (registration_page_image !== null && registration_page_image !== undefined)
        params.registrationPageImage = registration_page_image

      await ExecuteQuery(updateQuery, params)
      res.status(200).json({ message: 'Role branding updated successfully' })
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to update role branding', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}

export default withRole(handler, [PermanentRoles.admin, PermanentRoles.super_admin])
