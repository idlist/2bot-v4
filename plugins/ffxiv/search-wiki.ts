export interface PagePayload {
  parse: {
    title: string
    text: {
      '*': string
    }
  }
}

export interface SearchResultPayload {
  query: {
    searchinfo: {
      totalhits: number
    }
  }
}

export interface ExtractResult {
  url: string
  title: string
  content: string
}
