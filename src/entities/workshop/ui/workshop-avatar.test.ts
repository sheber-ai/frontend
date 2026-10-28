import { describe, expect, it } from 'vitest'
import { workshopInitials } from './workshop-avatar'

describe('workshopInitials', () => {
	it('takes the first letters of two words, ignoring quotes', () => {
		expect(workshopInitials('Ағаш Шебер')).toBe('АШ')
		expect(workshopInitials('«Мебель Плюс» ТОО')).toBe('МП')
		expect(workshopInitials('wood')).toBe('W')
		expect(workshopInitials('  ')).toBe('')
	})
})
