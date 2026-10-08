import { useGetMe } from '@/shared/api/generated/endpoints/auth/auth'
import type { CurrentUserSchema, UserRoleEnum } from '@/shared/api/generated/model'
import { isAuthenticated } from '@/shared/auth'

export type Viewer = CurrentUserSchema

export function useViewer() {
	const authenticated = isAuthenticated()
	const { data, isPending } = useGetMe({ query: { enabled: authenticated, staleTime: Infinity } })

	return {
		isAuthenticated: authenticated,
		viewer: data,
		isPending: authenticated && isPending,
	}
}

export function hasRole(viewer: Viewer | undefined, role: UserRoleEnum): boolean {
	return viewer?.roles.includes(role) ?? false
}

export function getViewerName(viewer: Viewer): string {
	const fullName = [viewer.firstName, viewer.lastName].filter(Boolean).join(' ')
	return fullName || viewer.email || ''
}
