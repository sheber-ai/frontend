import { describe, expect, it } from 'vitest'
import { LANGUAGE_STORAGE_KEY } from '@/shared/config'
import kk from './locales/kk.json'
import ru from './locales/ru.json'

describe('i18n', () => {
	it('loads the stored language on demand before it is ready', async () => {
		localStorage.setItem(LANGUAGE_STORAGE_KEY, 'kk')
		const { i18n, i18nReady } = await import('./index')
		await i18nReady

		expect(i18n.language).toBe('kk')
		expect(i18n.t('notifications.title')).toBe(kk.notifications.title)

		await i18n.changeLanguage('ru')
		expect(i18n.t('notifications.title')).toBe(ru.notifications.title)
	})
})
