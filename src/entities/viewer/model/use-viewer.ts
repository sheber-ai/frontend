import { useGetMyProfile } from '@/shared/api/generated/endpoints/users/users'
import type { UserRoleEnum, UserSchema } from '@/shared/api/generated/model'
import { isAuthenticated } from '@/shared/auth'

export type Viewer = UserSchema

export function useViewer() {
	const authenticated = isAuthenticated()
	const { data, isPending } = useGetMyProfile({
		query: { enabled: authenticated, staleTime: 60_000 },
	})

	return {
		isAuthenticated: authenticated,
		viewer: data,
		isPending: authenticated && isPending,
	}
}

export function hasRole(viewer: Viewer | undefined, role: UserRoleEnum): boolean {
	return viewer?.roles.includes(role) ?? false
}

/** Workshop approved by moderation; the token may still lack the role until it is refreshed. */
export function isWorkshop(viewer: Viewer | undefined): boolean {
	return viewer?.workshopStatus === 'approved'
}

export function getViewerName(viewer: Viewer): string {
	const fullName = [viewer.firstName, viewer.lastName].filter(Boolean).join(' ')
	return fullName || viewer.email || ''
}
