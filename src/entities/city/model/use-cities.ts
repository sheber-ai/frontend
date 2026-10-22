import { useListCities } from '@/shared/api/generated/endpoints/cities/cities'

/** Active cities in the current language, sorted by the backend. The list changes rarely. */
export function useCities() {
	const { data, isPending } = useListCities({ query: { staleTime: 60 * 60_000 } })
	return { cities: data?.items ?? [], isPending }
}
