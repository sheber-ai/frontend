import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import i18n from 'i18next'
import { queryClient } from '@/shared/api'
import { router } from '../router'

// Localized server data is cached per URL, so refetch it in the new language
i18n.on('languageChanged', () => void queryClient.invalidateQueries())

export function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	)
}
