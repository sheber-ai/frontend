import { describe, expect, it } from 'vitest'
import { fitImportedSize, guessFurnitureType } from './import-draft'

describe('guessFurnitureType', () => {
	it('recognises common product names', () => {
		expect(guessFurnitureType('Шкаф-купе «Север» 180 см')).toBe('wardrobe')
		expect(guessFurnitureType('Стеллаж книжный Лофт')).toBe('shelving')
		expect(guessFurnitureType('Комод с 4 ящиками')).toBe('dresser')
		expect(guessFurnitureType('HEMNES Wardrobe')).toBe('wardrobe')
		expect(guessFurnitureType('Диван угловой')).toBeNull()
		expect(guessFurnitureType(null)).toBeNull()
	})
})

describe('fitImportedSize', () => {
	const fallback = { width: 1800, height: 2400, depth: 600 }

	it('takes the shop sizes and keeps the template ones where the shop is silent', () => {
		expect(fitImportedSize({ width: 1200, height: null, depth: 450 }, fallback)).toEqual({
			size: { width: 1200, height: 2400, depth: 450 },
			clamped: false,
		})
		expect(fitImportedSize(null, fallback)).toEqual({ size: fallback, clamped: false })
	})

	it('fits sizes the constructor cannot build and says so', () => {
		const result = fitImportedSize({ width: 5000, height: 2000, depth: 100 }, fallback)
		expect(result.size).toEqual({ width: 3600, height: 2000, depth: 250 })
		expect(result.clamped).toBe(true)
	})
})
