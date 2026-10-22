import { createFileRoute } from '@tanstack/react-router'
import { MyOffersPage } from '@/pages/my-offers'
import { requireAuth } from '@/shared/auth'

export const Route = createFileRoute('/market/offers')({
	beforeLoad: requireAuth,
	component: MyOffersPage,
})
