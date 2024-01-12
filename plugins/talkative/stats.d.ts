export interface UserMessageCount {
  user: string
  name: string
  message: number
}

export interface TalkativeStatsByType {
  ranking: UserMessageCount[]
  total: number
}

export interface TalkativeStats {
  yesterday: TalkativeStatsByType
  week: TalkativeStatsByType
  month: TalkativeStatsByType
  year: TalkativeStatsByType
  overall: TalkativeStatsByType
}

export interface SummarizedStats {
  [platform: string]: {
    [channel: string]: TalkativeStats
  }
}
