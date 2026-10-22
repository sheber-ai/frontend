import { describe, expect, it } from 'vitest'
import { formatMoney, formatPhone } from './format'

describe('format', () => {
	it('groups tenge amounts', () => {
		expect(formatMoney(450000, 'ru').replace(/\s/g, ' ')).toBe('450 000 ₸')
	})

	it('spaces Kazakhstan phone numbers', () => {
		expect(formatPhone('+77011234567')).toBe('+7 701 123 45 67')
		expect(formatPhone('123')).toBe('123')
	})
})
