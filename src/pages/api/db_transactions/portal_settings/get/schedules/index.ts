import ExecuteQuery from 'src/utils/db'
import { NextApiRequest, NextApiResponse } from 'next/types'

const dayMap: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
}

const padNumber = (num: number): string => {
  return num.toString().padStart(2, '0')
}

export const getSchedulesFromDB = async () => {
  const getSchedulesQuery = `
    SELECT day_of_week, start_hour, start_minutes, end_hour, end_minutes
    FROM portal_schedule;
  `

  const schedulesResult = ((await ExecuteQuery(getSchedulesQuery))?.[0] || []) as {
    day_of_week: number
    start_hour: number
    start_minutes: number
    end_hour: number
    end_minutes: number
  }[]

  return schedulesResult.map(schedule => ({
    day: dayMap[schedule.day_of_week],
    startTime: `${padNumber(schedule.start_hour)}:${padNumber(schedule.start_minutes)}`,
    endTime: `${padNumber(schedule.end_hour)}:${padNumber(schedule.end_minutes)}`
  }))
}

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    const schedulesResult = await getSchedulesFromDB()
    res.status(200).json(schedulesResult)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
