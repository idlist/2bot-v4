export interface PagePayload {
  parse: {
    text: {
      '*': string
    }
  }
}

export interface SearchResultPayload {
  parse: {
    text: {
      '*': string
    }
  }
}

export interface ExtractResult {
  url: string
  title: string
  content: string
}
