import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import kk from './locales/kk.json'
import ru from './locales/ru.json'

export const defaultNS = 'translation'
export const resources = {
	ru: { translation: ru },
	kk: { translation: kk },
} as const

void i18n.use(initReactI18next).init({
	resources,
	lng: 'ru',
	fallbackLng: 'ru',
	defaultNS,
	interpolation: { escapeValue: false },
})

export { i18n }
