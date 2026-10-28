import i18n, { type BackendModule } from 'i18next'
import { initReactI18next } from 'react-i18next'
import {
	DEFAULT_LANGUAGE,
	isEnabledLanguage,
	LANGUAGE_STORAGE_KEY,
	type Language,
} from '@/shared/config'
import ru from './locales/ru.json'

export const defaultNS = 'translation'
export const resources = {
	ru: { translation: ru },
} as const

// Only the default language ships in the main bundle; the others load when chosen
const LAZY_LOCALES: Partial<Record<Language, () => Promise<{ default: object }>>> = {
	kk: () => import('./locales/kk.json'),
	en: () => import('./locales/en.json'),
}

const lazyLocales: BackendModule = {
	type: 'backend',
	init() {},
	read(language, _namespace, callback) {
		const load = LAZY_LOCALES[language as Language]
		if (!load) {
			callback(null, {})
			return
		}
		load().then(
			(module) => callback(null, module.default),
			(error: unknown) => callback(error instanceof Error ? error : String(error), false),
		)
	},
}

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

/** Resolves once the stored language is loaded; render after it to avoid a flash of the fallback. */
export const i18nReady = i18n
	.use(lazyLocales)
	.use(initReactI18next)
	.init({
		resources,
		partialBundledLanguages: true,
		lng: readStoredLanguage(),
		fallbackLng: DEFAULT_LANGUAGE,
		defaultNS,
		interpolation: { escapeValue: false },
	})

export { i18n }
