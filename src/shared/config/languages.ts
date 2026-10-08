/** Every language that has a locale file. Keep all of them translated. */
export const LANGUAGES = ['ru', 'kk', 'en'] as const
export type Language = (typeof LANGUAGES)[number]

/** Languages offered in the UI. English is translated but not released yet. */
export const ENABLED_LANGUAGES: readonly Language[] = ['ru', 'kk']

export const DEFAULT_LANGUAGE: Language = 'ru'
export const LANGUAGE_STORAGE_KEY = 'sheber.language'

/** Labels are shown in their own language, so they are not translated. */
export const LANGUAGE_LABELS: Record<Language, string> = {
	ru: 'Рус',
	kk: 'Қаз',
	en: 'Eng',
}

export function isEnabledLanguage(value: unknown): value is Language {
	return ENABLED_LANGUAGES.includes(value as Language)
}
