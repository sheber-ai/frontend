import { describe, expect, it } from 'vitest'
import { formatMessageTime, formatMoney, formatRelativeTime } from './format'

describe('format', () => {
	it('groups tenge amounts', () => {
		expect(formatMoney(450000, 'ru').replace(/\s/g, ' ')).toBe('450 000 ₸')
	})

	it('describes past moments relative to now', () => {
		const now = new Date('2026-10-22T12:00:00Z')
		expect(formatRelativeTime('2026-10-22T11:59:40Z', 'en', now)).toBeNull()
		expect(formatRelativeTime('2026-10-22T11:55:00Z', 'en', now)).toBe('5 minutes ago')
		expect(formatRelativeTime('2026-10-22T09:00:00Z', 'en', now)).toBe('3 hours ago')
		expect(formatRelativeTime('2026-10-21T12:00:00Z', 'en', now)).toBe('yesterday')
		expect(formatRelativeTime('2026-10-01T12:00:00Z', 'en', now)).toBe('3 weeks ago')
	})

	it('adds the date only to older messages', () => {
		const now = new Date('2026-10-22T15:00:00')
		expect(formatMessageTime('2026-10-22T09:05:00', 'ru', now)).toBe('09:05')
		expect(formatMessageTime('2026-10-20T09:05:00', 'en', now)).toMatch(/20 Oct/)
	})
})
