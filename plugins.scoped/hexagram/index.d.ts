export interface AnalyzeResult {
  figures: number[]
  orders: string[]
  display: string
  upper: number
  lower: number
  code: number
  name: string
  fullName: string
  meaning: string
  details: string[]
}

export interface SymbolMeaning {
  name: string
  meaning: string
  details: string[]
}