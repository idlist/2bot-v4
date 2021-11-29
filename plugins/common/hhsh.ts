interface OfficialAbbrs {
  name: string
  trans: string[]
}

interface UserAbbrs {
  name: string
  inputting: string[]
}

export type AbbrsPayload = OfficialAbbrs[] | UserAbbrs[]