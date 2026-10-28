import type { MyOfferSchema } from '@/shared/api/generated/model'

export type OfferStage = 'pending' | 'chosen' | 'inProgress' | 'done' | 'closed'

/** Where a workshop's offer stands, combining its own status with the order's. */
export function offerStage(
	offer: Pick<MyOfferSchema, 'status'> & { order: Pick<MyOfferSchema['order'], 'status'> },
): OfferStage {
	if (offer.status === 'pending') return offer.order.status === 'published' ? 'pending' : 'closed'
	if (offer.status !== 'accepted') return 'closed'
	if (offer.order.status === 'assigned') return 'chosen'
	if (offer.order.status === 'in_progress') return 'inProgress'
	if (offer.order.status === 'completed') return 'done'
	return 'closed'
}

export const OFFER_TABS = ['active', 'archive'] as const
export type OfferTab = (typeof OFFER_TABS)[number]

export function offerTab(stage: OfferStage): OfferTab {
	return stage === 'pending' || stage === 'chosen' || stage === 'inProgress' ? 'active' : 'archive'
}
