import { createFileRoute } from '@tanstack/react-router'
import { WelcomePage } from '@/pages/welcome'
import { requireAuth } from '@/shared/auth'

export const Route = createFileRoute('/welcome')({
	beforeLoad: requireAuth,
	component: WelcomePage,
})
