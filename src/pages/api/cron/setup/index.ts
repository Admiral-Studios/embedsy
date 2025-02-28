import cron from 'node-cron'
import axios from 'axios'
import { getPortalCapacitySettingsFromDB } from 'src/pages/api/db_transactions/portal_settings/get'
import ExecuteQuery from '../../../../utils/db'
import { NextApiRequest, NextApiResponse } from 'next/types'

declare global {
  // eslint-disable-next-line no-var
  var cronJobs: { [key: string]: cron.ScheduledTask } | undefined
}

interface ScheduleRecord {
  day_of_week: number
  start_hour: number
  start_minutes: number
  end_hour: number
  end_minutes: number
}

const generateCronJobName = (day: number, hour: number, minutes: number, action: 'start' | 'end') => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  return `${action}_${days[day]}_${hour.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`
}

const isWithinScheduledTime = () => {
  const currentUTC = new Date()
  const currentDay = currentUTC.getUTCDay()
  const currentHour = currentUTC.getUTCHours()
  const currentMinutes = currentUTC.getUTCMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinutes

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const currentDayName = days[currentDay]

  const schedulePairs: { start: number; end: number }[] = []

  if (!global.cronJobs) {
    return false
  }

  const cronJobNames = Object.keys(global.cronJobs)

  const startJobs = cronJobNames
    .filter(name => name.startsWith('start_' + currentDayName))
    .map(jobName => {
      const timeStr = jobName.split('_')[2]
      const hour = parseInt(timeStr.substring(0, 2))
      const minutes = parseInt(timeStr.substring(2))

      return {
        name: jobName,
        timeInMinutes: hour * 60 + minutes
      }
    })
    .sort((a, b) => a.timeInMinutes - b.timeInMinutes)

  if (startJobs.length === 0) {
    return false
  }

  const endJobs = cronJobNames
    .filter(name => name.startsWith('end_' + currentDayName))
    .map(jobName => {
      const timeStr = jobName.split('_')[2]
      const hour = parseInt(timeStr.substring(0, 2))
      const minutes = parseInt(timeStr.substring(2))

      return {
        name: jobName,
        timeInMinutes: hour * 60 + minutes
      }
    })
    .sort((a, b) => a.timeInMinutes - b.timeInMinutes)

  for (let i = 0; i < startJobs.length; i++) {
    const currentStart = startJobs[i]
    const nextStart = startJobs[i + 1]

    const matchingEnd = endJobs.find(end => {
      if (nextStart) {
        return end.timeInMinutes > currentStart.timeInMinutes && end.timeInMinutes < nextStart.timeInMinutes
      } else {
        return end.timeInMinutes > currentStart.timeInMinutes
      }
    })

    if (matchingEnd) {
      schedulePairs.push({
        start: currentStart.timeInMinutes,
        end: matchingEnd.timeInMinutes
      })
    }
  }

  return schedulePairs.some(({ start, end }) => {
    if (end > start) {
      return currentTimeInMinutes >= start && currentTimeInMinutes <= end
    } else {
      return currentTimeInMinutes >= start || currentTimeInMinutes <= end
    }
  })
}

export const setupCronJobs = async () => {
  try {
    if (!global.cronJobs) {
      global.cronJobs = {}
    }

    // 1. Check activity cron. Start if it doesn't exist in global cronJobs
    if (!global.cronJobs['activity_check']) {
      global.cronJobs['activity_check'] = cron.schedule('*/5 * * * *', async () => {
        try {
          const capacityDetails = await getPortalCapacitySettingsFromDB()

          if (!capacityDetails || !capacityDetails.auto_managed_capacity) {
            return
          }

          const query = `
            SELECT COUNT(*) as count 
            FROM user_activity 
            WHERE last_ping >= DATEADD(MINUTE, -5, GETUTCDATE())
          `
          const result = await ExecuteQuery(query)
          const activeUsers = result[0][0].count

          // Only suspend if no active users AND not within any scheduled time
          if (activeUsers === 0) {
            if (!isWithinScheduledTime()) {
              await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/capacity/manage`, {
                action: 'suspend'
              })
            }
          }
        } catch (error) {
          console.error('Activity check cron failed:', error)
        }
      })
      console.log('Activity check cron job initialized')
    }

    const capacityDetails = await getPortalCapacitySettingsFromDB()

    if (!capacityDetails || !capacityDetails.scheduled_capacity_enabled || !capacityDetails.auto_managed_capacity) {
      Object.entries(global.cronJobs).forEach(([name, job]) => {
        if (name !== 'activity_check') {
          job.stop()
          delete global.cronJobs![name]
        }
      })

      return {
        success: true,
        activityCheck: !!global.cronJobs['activity_check'],
        scheduleCount: 0
      }
    }

    // 2. Schedule crons - check if they exist/mismatch
    const schedulesQuery = `
      SELECT day_of_week, start_hour, start_minutes, end_hour, end_minutes
      FROM portal_schedule
    `
    const result = await ExecuteQuery(schedulesQuery)
    const dbSchedules: ScheduleRecord[] = result[0]

    const existingCronJobNames = new Set(Object.keys(global.cronJobs || {}))
    const expectedCronJobNames = new Set<string>()

    dbSchedules.forEach(schedule => {
      const startJobName = generateCronJobName(
        schedule.day_of_week,
        schedule.start_hour,
        schedule.start_minutes,
        'start'
      )
      const endJobName = generateCronJobName(schedule.day_of_week, schedule.end_hour, schedule.end_minutes, 'end')
      expectedCronJobNames.add(startJobName)
      expectedCronJobNames.add(endJobName)
    })

    const needsReinit =
      dbSchedules.some(schedule => {
        const startJobName = generateCronJobName(
          schedule.day_of_week,
          schedule.start_hour,
          schedule.start_minutes,
          'start'
        )
        const endJobName = generateCronJobName(schedule.day_of_week, schedule.end_hour, schedule.end_minutes, 'end')

        return !global.cronJobs?.[startJobName] || !global.cronJobs?.[endJobName]
      }) || Array.from(existingCronJobNames).some(name => name !== 'activity_check' && !expectedCronJobNames.has(name))

    // 2. Schedule crons - start if they don't exist or mismatch in cronJobs
    if (needsReinit) {
      Object.entries(global.cronJobs).forEach(([name, job]) => {
        if (name !== 'activity_check') {
          job.stop()
          delete global.cronJobs![name]
        }
      })

      dbSchedules.forEach(schedule => {
        const startJobName = generateCronJobName(
          schedule.day_of_week,
          schedule.start_hour,
          schedule.start_minutes,
          'start'
        )
        const startCron = `${schedule.start_minutes} ${schedule.start_hour} * * ${schedule.day_of_week}`
        global.cronJobs![startJobName] = cron.schedule(
          startCron,
          async () => {
            try {
              await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/capacity/manage`, {
                action: 'resume'
              })
            } catch (error) {
              console.error('Failed to start capacity:', error)
            }
          },
          {
            timezone: 'UTC'
          }
        )

        const endJobName = generateCronJobName(schedule.day_of_week, schedule.end_hour, schedule.end_minutes, 'end')
        const endCron = `${schedule.end_minutes} ${schedule.end_hour} * * ${schedule.day_of_week}`
        global.cronJobs![endJobName] = cron.schedule(
          endCron,
          async () => {
            try {
              const query = `
                SELECT COUNT(*) as count 
                FROM user_activity 
                WHERE last_ping >= DATEADD(MINUTE, -5, GETUTCDATE())
              `
              const result = await ExecuteQuery(query)
              const activeUsers = result[0][0].count

              if (activeUsers === 0) {
                await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/capacity/manage`, {
                  action: 'suspend'
                })
              } else {
                console.log('Skipping scheduled suspension due to active users')
              }
            } catch (error) {
              console.error('Failed to stop capacity:', error)
            }
          },
          {
            timezone: 'UTC'
          }
        )
      })

      console.log('Schedule cron jobs reinitialized')
    }

    return {
      success: true,
      activityCheck: !!global.cronJobs['activity_check'],
      scheduleCount: Object.keys(global.cronJobs).length - 1
    }
  } catch (error: any) {
    console.error('Failed to setup cron jobs:', error)

    return {
      success: false,
      error: error.message
    }
  }
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await setupCronJobs()
    res.status(200).json(result)
  } catch (error) {
    console.error('Error setting up cron jobs:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
