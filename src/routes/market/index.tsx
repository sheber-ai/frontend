import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MarketPage } from '@/pages/market'
import { FurnitureTypeEnum } from '@/shared/api/generated/model'
import { requireAuth } from '@/shared/auth'

const searchSchema = z.object({
	city: z.uuid().optional().catch(undefined),
	type: z.enum(FurnitureTypeEnum).optional().catch(undefined),
})

export const Route = createFileRoute('/market/')({
	beforeLoad: requireAuth,
	validateSearch: searchSchema,
	component: () => <MarketPage search={Route.useSearch()} />,
})
