import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ORDER_GROUPS } from '@/entities/order'
import { OrdersPage } from '@/pages/orders'
import { requireAuth } from '@/shared/auth'

const searchSchema = z.object({
	tab: z.enum(ORDER_GROUPS).optional().catch(undefined),
	page: z.coerce.number().int().min(1).optional().catch(undefined),
})

export const Route = createFileRoute('/orders/')({
	beforeLoad: requireAuth,
	validateSearch: searchSchema,
	component: function OrdersRoute() {
		const { tab, page } = Route.useSearch()
		return <OrdersPage tab={tab ?? 'active'} page={page ?? 1} />
	},
})
