export interface BossData {
  keywords: string[]
  name: string
  zoneId: number
  id: number
  teamsize: number
  diff: number
  server: {
    global: number
    cn: number
  }
}

export interface ResolvedJob {
  name: string
  code: string
  logsCode: string
}

export interface LogsData {
  boss: string
  job: string
  jobCode: string
  server: '国服' | '国际服',
  type: 'aDPS' | 'rDPS',
  duration: string
  record: string
  data: string[]
}