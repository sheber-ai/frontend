import { describe, expect, it } from 'vitest'
import { offerHighlights, sortOffers } from './compare'

const offer = (id: string, price: number, days: number, createdAt: string, status = 'pending') =>
	({ id, price, days, createdAt, status }) as Parameters<typeof offerHighlights>[0][number]

const OFFERS = [
	offer('a', 420000, 21, '2026-10-01T10:00:00Z'),
	offer('b', 390000, 30, '2026-10-02T10:00:00Z'),
	offer('c', 450000, 14, '2026-10-03T10:00:00Z'),
]

describe('sortOffers', () => {
	it('orders by price, term or recency without mutating the input', () => {
		expect(sortOffers(OFFERS, 'price').map((o) => o.id)).toEqual(['b', 'a', 'c'])
		expect(sortOffers(OFFERS, 'days').map((o) => o.id)).toEqual(['c', 'a', 'b'])
		expect(sortOffers(OFFERS, 'newest').map((o) => o.id)).toEqual(['c', 'b', 'a'])
		expect(OFFERS.map((o) => o.id)).toEqual(['a', 'b', 'c'])
	})
})

describe('offerHighlights', () => {
	it('marks the cheapest and the fastest live offers', () => {
		const { cheapest, fastest } = offerHighlights(OFFERS)
		expect([...cheapest]).toEqual(['b'])
		expect([...fastest]).toEqual(['c'])
	})

	it('ignores rejected offers and needs at least two to compare', () => {
		const { cheapest } = offerHighlights([
			offer('a', 420000, 21, '2026-10-01T10:00:00Z'),
			offer('b', 390000, 30, '2026-10-02T10:00:00Z', 'rejected'),
		])
		expect(cheapest.size).toBe(0)
	})
})
