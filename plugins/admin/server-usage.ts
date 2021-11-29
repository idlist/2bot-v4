interface VnStatDate {
  year: number
  month: number
  day: number
}

interface VnStatTime {
  hour: number
  minute: number
}

interface VnStatTraffic {
  rx: number
  tx: number
}

interface VnStatTrafficItemBase extends VnStatTraffic {
  id: number
}

type VnStatTrafficItem<T extends {} = {}> = VnStatTrafficItemBase & T

export interface VnStatOutput {
  vnstatversion: string
  jsonversion: string
  interfaces: {
    name: string
    alias: string
    created: {
      date: VnStatDate
    }
    updated: {
      date: VnStatDate
      time: VnStatTime
    }
    traffic: {
      total: VnStatTraffic
      fiveminute: VnStatTrafficItem<{
        date: VnStatDate
        time: VnStatTime
      }>[]
      hour: VnStatTrafficItem<{
        date: VnStatDate
        time: VnStatTime
      }>[]
      day: VnStatTrafficItem<{
        date: VnStatDate
      }>[]
      month: VnStatTrafficItem<{
        date: {
          year: number
          month: number
        }
      }>[]
      year: VnStatTrafficItem<{
        date: {
          year: number
        }
      }>[]
      top: VnStatTrafficItem<{
        date: VnStatDate
      }>[]
    }
  }[]
}