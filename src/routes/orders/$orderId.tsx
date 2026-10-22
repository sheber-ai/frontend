import { createFileRoute } from '@tanstack/react-router'
import { OrderDetailsPage } from '@/pages/order-details'
import { requireAuth } from '@/shared/auth'

export const Route = createFileRoute('/orders/$orderId')({
	beforeLoad: requireAuth,
	component: () => <OrderDetailsPage orderId={Route.useParams().orderId} />,
})
