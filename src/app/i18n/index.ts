import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import {
	DEFAULT_LANGUAGE,
	isEnabledLanguage,
	LANGUAGE_STORAGE_KEY,
	type Language,
} from '@/shared/config'
import en from './locales/en.json'
import kk from './locales/kk.json'
import ru from './locales/ru.json'

export const defaultNS = 'translation'
export const resources = {
	ru: { translation: ru },
	kk: { translation: kk },
	en: { translation: en },
} as const

function readStoredLanguage(): Language {
	try {
		const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
		return isEnabledLanguage(stored) ? stored : DEFAULT_LANGUAGE
	} catch {
		return DEFAULT_LANGUAGE
	}
}

i18n.on('languageChanged', (language) => {
	document.documentElement.lang = language
	try {
		localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
	} catch {
		// Storage may be unavailable (private mode)
	}
})

void i18n.use(initReactI18next).init({
	resources,
	lng: readStoredLanguage(),
	fallbackLng: DEFAULT_LANGUAGE,
	defaultNS,
	interpolation: { escapeValue: false },
})

export { i18n }
