export interface RollStatusChannel {
  teamsize: number
  member: {
    id: string
    result: number
  }[]
}

export type RollStatus = Record<string, RollStatusChannel>