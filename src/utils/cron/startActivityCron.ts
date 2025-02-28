import axios from 'axios'

export const startActivityCron = () => {
  axios.get(`${process.env.NEXT_PUBLIC_URL}/api/cron/setup`).catch(error => {
    console.error('Failed to initialize cron job:', error)
  })
}
