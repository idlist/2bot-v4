export interface MarketShortcodeItem {
  code: string
  full: string
}

export interface SearchShortcodeOptions {
  direction: 'shorten' | 'lengthen'
}

export interface ItemData {
  status: 'success'
  name: string
  id: string
}

export interface ItemAPIError {
  status: 'error'
  message: string
}

export type ItemResolve = Promise<ItemData | ItemAPIError>

export interface ItemQuery {
  status: 'success'
  name: string
  server: string
  hq: boolean
  nq: boolean
}

/**
 * This payload typing is not full typing as some likely-unused keys are omitted.
 */
export interface MarketPayloadListing {
  lastReviewTime: number
  pricePerUnit: number
  quantity: number
  worldName: string
  worldID: number
  hq: boolean
  onMannequin: boolean
  retainerName: string
  total: number
}

export interface MarketPayloadHistory {
  hq: boolean
  pricePerUnit: number
  quantity: number
  timestamp: number
  buyerName: string
  total: number
}

/**
 * This payload typing is not full typing as some likely-unused keys are omitted.
 */
export interface MarketPayload {
  itemID: number
  lastUploadTime: number
  dcName?: string
  worldName?: string
  worldID?: number
  listings: MarketPayloadListing[]
  recentHistory: MarketPayloadHistory[]
  currentAveragePrice: number
  currentAveragePriceNQ: number
  currentAveragePriceHQ: number
  regularSaleVelocity: number
  nqSaleVelocity: number
  hqSaleVelocity: number
}

export interface MarketResult extends ItemQuery {
  payload: MarketPayload
}

export interface MarketAPIError extends Omit<ItemQuery, 'status'> {
  status: 'error'
  message: string
}

export type MarketResolve = Promise<MarketResult | ItemAPIError | MarketAPIError>

export interface MarketListing {
  seller: string
  server: string
  hq: boolean
  unit: number
  qty: number
  total: number
}

export interface MarketListingCounted extends MarketListing {
  repeat: number
}

export interface MarketImageData {
  item: string
  hq: boolean
  nq: boolean
  server: string
  average: number
  lastUpdate: number
  list: MarketListingCounted[]
}

export interface MarketListItem {
  name: string
  items: string[]
}