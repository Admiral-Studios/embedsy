import ExecuteQuery from 'src/utils/db'
import { NextApiRequest, NextApiResponse } from 'next/types'

// Map day names to numbers (0-6)
const dayToNumber: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
}

type Schedule = {
  day: string
  startTime: string
  endTime: string
}

const parseTimeString = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':')
  
return {
    hours: parseInt(hours, 10),
    minutes: parseInt(minutes, 10)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await ExecuteQuery('DELETE FROM portal_schedule')

    const schedules: Schedule[] = req.body

    if (schedules && schedules.length > 0) {
      const values = schedules
        .map(schedule => {
          const dayNumber = dayToNumber[schedule.day]
          const { hours: startHour, minutes: startMinutes } = parseTimeString(schedule.startTime)
          const { hours: endHour, minutes: endMinutes } = parseTimeString(schedule.endTime)

          return `(${dayNumber}, ${startHour}, ${startMinutes}, ${endHour}, ${endMinutes})`
        })
        .join(',')

      const insertQuery = `
        INSERT INTO portal_schedule (day_of_week, start_hour, start_minutes, end_hour, end_minutes)
        VALUES ${values}
      `

      await ExecuteQuery(insertQuery)
    }

    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/cron/setup`)

    res.status(200).json({ message: 'Schedules updated successfully' })
  } catch (error) {
    console.error('Error updating schedules:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
