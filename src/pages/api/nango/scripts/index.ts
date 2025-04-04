import { NextApiRequest, NextApiResponse } from "next/types";
import { nango } from "..";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method !== 'GET') {
    res.status(405).json({ ok: false, message: 'Method not allowed' })

    return
  }

  try {
    const scriptsConfig = await nango.getScriptsConfig();
    console.log(scriptsConfig)
    res.status(200).json({ ok: true, scriptsConfig: scriptsConfig })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Failed to fetch scripts config' })
  }

}
