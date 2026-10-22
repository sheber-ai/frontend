import { createFileRoute } from '@tanstack/react-router'
import { WorkshopPage } from '@/pages/workshop'
import { requireAuth } from '@/shared/auth'

export const Route = createFileRoute('/workshop')({
	beforeLoad: requireAuth,
	component: WorkshopPage,
})
