import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { OFFER_TABS } from '@/entities/offer'
import { MyOffersPage } from '@/pages/my-offers'
import { requireAuth } from '@/shared/auth'

const searchSchema = z.object({
	tab: z.enum(OFFER_TABS).optional().catch(undefined),
	page: z.coerce.number().int().min(1).optional().catch(undefined),
})

export const Route = createFileRoute('/market/offers')({
	beforeLoad: requireAuth,
	validateSearch: searchSchema,
	component: function MyOffersRoute() {
		const { tab, page } = Route.useSearch()
		return <MyOffersPage tab={tab ?? 'active'} page={page ?? 1} />
	},
})
