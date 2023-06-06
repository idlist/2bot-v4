export interface BVideoListPayload {
  data: {
    code: number
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

export interface BVideoPayload {
  data: {
    data: {
      aid: number
      title: string
      desc: string
    }
  }
}