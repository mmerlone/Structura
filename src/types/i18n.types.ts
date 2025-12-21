// Language codes and their types
export const SUPPORTED_LANGUAGES = Intl.supportedValuesOf('collation').map((code) => {
  try {
    const displayName = new Intl.DisplayNames([code], { type: 'language' }).of(code)
    return {
      code,
      name: displayName ?? code,
      nativeName: displayName ?? code,
    }
  } catch {
    return { code, name: code, nativeName: code }
  }
})

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]

// Language metadata
export interface Language {
  code: LanguageCode
  name: string
  nativeName: string
  flag: string
}
