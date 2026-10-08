import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/pages/profile'
import { requireAuth } from '@/shared/auth'

export const Route = createFileRoute('/profile')({
	beforeLoad: requireAuth,
	component: ProfilePage,
})
