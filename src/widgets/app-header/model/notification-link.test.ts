import { describe, expect, it } from 'vitest'
import type { NotificationSchema } from '@/shared/api/generated/model'
import { notificationTarget } from './notification-link'

const base: NotificationSchema = {
	id: 'n1',
	kind: 'offer_received',
	orderId: 'o1',
	subject: 'Шкаф',
	actor: 'Цех',
	readAt: null,
	createdAt: '2026-10-22T10:00:00Z',
}

describe('notificationTarget', () => {
	it('opens the order the event is about', () => {
		expect(notificationTarget(base)).toEqual({ to: '/orders/$orderId', params: { orderId: 'o1' } })
	})

	it('opens a new order from the feed notification', () => {
		expect(notificationTarget({ ...base, kind: 'new_order', actor: null })).toEqual({
			to: '/orders/$orderId',
			params: { orderId: 'o1' },
		})
	})

	it('sends moderation results to the workshop page', () => {
		expect(notificationTarget({ ...base, kind: 'workshop_approved', orderId: null })).toEqual({
			to: '/workshop',
		})
	})
})
