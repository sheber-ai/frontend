import { QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			// Client errors (403, 404) will not change on retry
			retry: (failureCount, error) =>
				failureCount < 1 && !(isAxiosError(error) && (error.response?.status ?? 500) < 500),
			refetchOnWindowFocus: false,
		},
	},
})
