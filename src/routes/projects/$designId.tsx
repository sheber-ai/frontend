import { createFileRoute } from '@tanstack/react-router'
import { ProjectEditorPage } from '@/pages/project-editor'
import { requireAuth } from '@/shared/auth'

export const Route = createFileRoute('/projects/$designId')({
	beforeLoad: requireAuth,
	component: () => <ProjectEditorPage designId={Route.useParams().designId} />,
})
