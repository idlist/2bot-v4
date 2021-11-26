export interface ListPayload {
  data: {
    data: {
      list: {
        vlist: {
          aid: number
          title: string
        }[]
      }
    }
  }
}

export interface ReportPayload {
  data: {
    data: {
      aid: number
      title: string
      desc: string
    }
  }
}