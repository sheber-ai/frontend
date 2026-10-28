import type { NotificationSchema } from '@/shared/api/generated/model'

type Target = { to: '/orders/$orderId'; params: { orderId: string } } | { to: '/workshop' }

/** Where a notification leads: its order, or the workshop page for moderation results. */
export function notificationTarget(notification: NotificationSchema): Target | null {
	if (notification.orderId)
		return { to: '/orders/$orderId', params: { orderId: notification.orderId } }
	if (notification.kind === 'workshop_approved' || notification.kind === 'workshop_rejected')
		return { to: '/workshop' }
	return null
}
