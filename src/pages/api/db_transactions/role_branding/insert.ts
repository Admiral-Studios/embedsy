import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { role_id } = req.body

    if (role_id) {
      try {
        const query = `
                    INSERT INTO role_branding (
                        role_id, overwrite, main_logo, main_logo_on_dark, favicon, favicon_on_dark,
                        main_logo_width, favicon_width, main_color, main_color_on_dark,
                        loading_spinner, loading_spinner_on_dark, loading_spinner_width, powerbi_light_theme, powerbi_dark_theme,
                        login_page_image, registration_page_image
                    ) VALUES (
                        ${role_id}, 0, NULL, NULL, NULL, NULL,
                        NULL, NULL, NULL, NULL,
                        NULL, NULL, NULL, NULL, NULL, NULL, NULL
                    );
                `

        await ExecuteQuery(query)
        res.status(200).json({ message: 'Role branding inserted successfully' })
      } catch (error: any) {
        res.status(500).json({ message: 'Failed to insert role branding', error: error.message })
      }
    } else {
      res.status(400).json({ message: 'Role ID is required' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
