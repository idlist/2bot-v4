interface FontConfig {
  name: string
  weight?: string | number
}

export interface Config {
  fonts: {
    text: FontConfig
    number: FontConfig
  }
}