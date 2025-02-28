// import { NextApiRequest, NextApiResponse } from 'next/types'
// import ExecuteQuery from '../../../../utils/db'
// import axios from 'axios'
// import cron from 'node-cron'
// import { getPortalCapacitySettingsFromDB } from 'src/pages/api/db_transactions/portal_settings/get'

// declare global {
//   // eslint-disable-next-line no-var
//   var cronJob: cron.ScheduledTask | undefined
// }

// const initCronJob = () => {
//   try {
//     if (global.cronJob) {
//       return
//     }

//     global.cronJob = cron.schedule('*/5 * * * *', async () => {
//       try {
//         const capacityDetails = await getPortalCapacitySettingsFromDB()

//         if (!capacityDetails || !capacityDetails.auto_managed_capacity) {
//           return
//         }

//         const query = `
//           SELECT COUNT(*) as count
//           FROM user_activity
//           WHERE last_ping >= DATEADD(MINUTE, -5, GETUTCDATE())
//         `
//         const result = await ExecuteQuery(query)
//         const activeUsers = result[0][0].count

//         if (activeUsers === 0) {
//           await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/capacity/manage`, {
//             action: 'suspend'
//           })
//         }
//       } catch (error) {
//         console.error('Cron job execution failed:', error)
//         if (global.cronJob) {
//           global.cronJob.stop()
//           global.cronJob = undefined
//           initCronJob()
//         }
//       }
//     })
//   } catch (error) {
//     console.error('Failed to initialize cron job:', error)
//     global.cronJob = undefined
//   }
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   initCronJob()
//   res.status(200).json({ message: 'Cron job status checked', isRunning: !!global.cronJob })
// }
