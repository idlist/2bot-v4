export interface BVideoListPayload {
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

export interface BVideoPayload {
  data: {
    data: {
      aid: number
      title: string
      desc: string
    }
  }
}