import { createRouter } from '@tanstack/react-router'
import { queryClient } from '@/shared/api'
import { routeTree } from '../../routeTree.gen'

export const router = createRouter({
	routeTree,
	context: { queryClient },
	defaultPreload: 'intent',
	// Данные кэширует TanStack Query, роутер повторно их не держит
	defaultPreloadStaleTime: 0,
	scrollRestoration: true,
})

declare module '@tanstack/react-router' {
	// biome-ignore lint/style/useConsistentTypeDefinitions: расширение модуля возможно только через interface
	interface Register {
		router: typeof router
	}
}
