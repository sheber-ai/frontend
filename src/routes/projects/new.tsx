import { createFileRoute } from '@tanstack/react-router'
import { ProjectNewPage } from '@/pages/project-new'
import { requireAuth } from '@/shared/auth'

export const Route = createFileRoute('/projects/new')({
	beforeLoad: requireAuth,
	component: ProjectNewPage,
})
