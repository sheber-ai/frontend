import type { QueryClient } from '@tanstack/react-query'

/** Generated query keys start with the request path: invalidate everything under the given prefixes. */
export function invalidatePaths(queryClient: QueryClient, ...prefixes: string[]): Promise<void> {
	return queryClient.invalidateQueries({
		predicate: ({ queryKey }) =>
			typeof queryKey[0] === 'string' &&
			prefixes.some((prefix) => (queryKey[0] as string).startsWith(prefix)),
	})
}

export const API_PATHS = {
	orders: '/api/v1/orders',
	offers: '/api/v1/offers',
	designs: '/api/v1/designs',
	workshops: '/api/v1/workshops',
	me: '/api/v1/users/me',
	notifications: '/api/v1/notifications',
	attachments: '/api/v1/attachments',
} as const
