import { createFileRoute } from '@tanstack/react-router'
import { ProjectsPage } from '@/pages/projects'
import { requireAuth } from '@/shared/auth'

export const Route = createFileRoute('/projects/')({
	beforeLoad: requireAuth,
	component: ProjectsPage,
})
