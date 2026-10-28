import { createFileRoute } from '@tanstack/react-router'
import { WorkshopProfilePage } from '@/pages/workshop-profile'

export const Route = createFileRoute('/workshops/$workshopId')({
	component: () => <WorkshopProfilePage workshopId={Route.useParams().workshopId} />,
})
