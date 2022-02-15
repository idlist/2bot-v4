declare module 'koishi' {
  interface Tables {
    talkative: TalkativeDatabase
  }
}

export interface TalkativeDatabase {
  id: number
  platform: string
  channel: string
  date: Date
  user: string
  message: number
}