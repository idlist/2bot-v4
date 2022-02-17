export type ReplaceList = string[][]

export type ParrotDataType = Record<string, {
  message: string
  count: number
  trigger: number
  lastTriggered: number
}>