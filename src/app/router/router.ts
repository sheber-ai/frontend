import { createRouter } from '@tanstack/react-router'
import { queryClient } from '@/shared/api'
import { routeTree } from '../../routeTree.gen'

export const router = createRouter({
	routeTree,
	context: { queryClient },
	defaultPreload: 'intent',
	// TanStack Query owns data caching
	defaultPreloadStaleTime: 0,
	scrollRestoration: true,
})

declare module '@tanstack/react-router' {
	// biome-ignore lint/style/useConsistentTypeDefinitions: module augmentation requires interface
	interface Register {
		router: typeof router
	}
}
