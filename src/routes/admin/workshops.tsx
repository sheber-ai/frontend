import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AdminWorkshopsPage } from '@/pages/admin-workshops'
import { WorkshopStatusEnum } from '@/shared/api/generated/model'
import { requireAuth } from '@/shared/auth'

const searchSchema = z.object({
	status: z.enum(WorkshopStatusEnum).catch(WorkshopStatusEnum.pending),
})

export const Route = createFileRoute('/admin/workshops')({
	beforeLoad: requireAuth,
	validateSearch: searchSchema,
	component: () => <AdminWorkshopsPage search={Route.useSearch()} />,
})
