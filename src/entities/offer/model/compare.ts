import type { OfferSchema } from '@/shared/api/generated/model'

export const OFFER_SORTS = ['price', 'days', 'newest'] as const
export type OfferSort = (typeof OFFER_SORTS)[number]

type Comparable = Pick<OfferSchema, 'id' | 'price' | 'days' | 'createdAt' | 'status'>

export function sortOffers<T extends Comparable>(offers: T[], sort: OfferSort): T[] {
	const sorted = [...offers]
	if (sort === 'price') sorted.sort((a, b) => a.price - b.price || a.days - b.days)
	else if (sort === 'days') sorted.sort((a, b) => a.days - b.days || a.price - b.price)
	else sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
	return sorted
}

export type OfferHighlights = { cheapest: Set<string>; fastest: Set<string> }

/** Best price and shortest term among offers still in play; nothing to highlight with fewer than two. */
export function offerHighlights(offers: Comparable[]): OfferHighlights {
	const live = offers.filter((offer) => offer.status === 'pending' || offer.status === 'accepted')
	if (live.length < 2) return { cheapest: new Set(), fastest: new Set() }
	const minPrice = Math.min(...live.map((offer) => offer.price))
	const minDays = Math.min(...live.map((offer) => offer.days))
	return {
		cheapest: new Set(live.filter((offer) => offer.price === minPrice).map((offer) => offer.id)),
		fastest: new Set(live.filter((offer) => offer.days === minDays).map((offer) => offer.id)),
	}
}
