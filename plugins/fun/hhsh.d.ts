interface OfficialAbbrs {
  name: string
  trans: string[]
}

interface UserAbbrs {
  name: string
  inputting: string[]
}

export interface AbbrsPayload {
  data: OfficialAbbrs[] | UserAbbrs[]
}