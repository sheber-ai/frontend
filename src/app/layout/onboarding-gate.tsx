import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { hasRole, useViewer } from '@/entities/viewer'

/** Sends users without a filled profile to /welcome: orders need a phone and a city. Staff skip it. */
export function OnboardingGate() {
	const { viewer } = useViewer()
	const navigate = useNavigate()
	const pathname = useRouterState({ select: (state) => state.location.pathname })

	useEffect(() => {
		if (viewer && !viewer.onboarded && !hasRole(viewer, 'admin') && pathname !== '/welcome') {
			void navigate({ to: '/welcome', replace: true })
		}
	}, [viewer, pathname, navigate])

	return null
}
