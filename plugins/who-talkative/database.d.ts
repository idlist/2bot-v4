declare module 'koishi' {
  interface Tables {
    talkative_daily: TalkativeDaily
    talkative_stats: TalkativeStats
  }
}

interface TalkativeDaily {
  id: number
  platform: string
  channel: string
  date: Date
  user: string
  message: number
}

interface TalkativeStats {
  platform: string
  channel: string
  yesterday: Record<string, number>
  week: Record<string, number>
  month: Record<string, number>
  year: Record<string, number>
  overall: Record<string, number>
}