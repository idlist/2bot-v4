/// <reference path="database.d.ts"/>

export interface UserMessageCount {
  user: string
  message: number
}

export interface TalkativeStats {
  yesterday: UserMessageCount[]
  week: UserMessageCount[]
  month: UserMessageCount[]
  year: UserMessageCount[]
  overall: UserMessageCount[]
}

export interface SummarizedStats {
  [platform: string]: {
    [channel: string]: TalkativeStats
  }
}
