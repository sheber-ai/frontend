import { createFileRoute } from '@tanstack/react-router'
import { OrdersPage } from '@/pages/orders'
import { requireAuth } from '@/shared/auth'

export const Route = createFileRoute('/orders/')({
	beforeLoad: requireAuth,
	component: OrdersPage,
})
