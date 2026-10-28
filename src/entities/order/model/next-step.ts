import type { OrderSchema } from '@/shared/api/generated/model'

export type ClientNextStep = 'chooseWorkshop' | 'waitOffers' | 'agreeStart' | 'confirmDone'

/** What the client should do with the order now; null when nothing is pending (finished or cancelled). */
export function clientNextStep(
	order: Pick<OrderSchema, 'status' | 'offersCount'>,
): ClientNextStep | null {
	switch (order.status) {
		case 'published':
			return order.offersCount > 0 ? 'chooseWorkshop' : 'waitOffers'
		case 'assigned':
			return 'agreeStart'
		case 'in_progress':
			return 'confirmDone'
		default:
			return null
	}
}

/** Steps that wait for the client, as opposed to waiting for workshops. */
export const CLIENT_ACTION_STEPS: readonly ClientNextStep[] = ['chooseWorkshop', 'confirmDone']

export const ORDER_GROUPS = ['active', 'completed', 'cancelled'] as const
export type OrderGroup = (typeof ORDER_GROUPS)[number]

/** Tab of the client's order list. */
export function orderGroup(status: OrderSchema['status']): OrderGroup {
	if (status === 'completed') return 'completed'
	if (status === 'cancelled') return 'cancelled'
	return 'active'
}

export type WorkshopNextStep = 'agreeAndStart' | 'finishWork' | 'waitChoice' | 'notChosen'

/** What the workshop should do with an order it responded to; null when nothing is pending. */
export function workshopNextStep(
	status: OrderSchema['status'],
	isAssigned: boolean,
	hasLiveOffer: boolean,
): WorkshopNextStep | null {
	if (isAssigned && status === 'assigned') return 'agreeAndStart'
	if (isAssigned && status === 'in_progress') return 'finishWork'
	if (status === 'published' && hasLiveOffer) return 'waitChoice'
	if (!isAssigned && hasLiveOffer && status !== 'published') return 'notChosen'
	return null
}
