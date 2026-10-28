import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { getErrorCode } from '@/shared/api/errors'
import { toast } from '@/shared/ui/sonner'

const KNOWN = [
	'network',
	'validation',
	'not_found',
	'permission_denied',
	'unauthorized',
	'profile_incomplete',
	'workshop_required',
	'offer_exists',
	'invalid_status',
	'conflict',
	'service_unavailable',
	'city_not_found',
	'already_published',
	'thread_required',
	'review_not_allowed',
	'import_rate_limited',
] as const

type Known = (typeof KNOWN)[number]

/** Shows a translated toast for a failed request. */
export function useApiErrorToast() {
	const { t } = useTranslation()
	return useCallback(
		(error: unknown) => {
			const code = getErrorCode(error)
			const known = KNOWN.includes(code as Known) ? (code as Known) : 'unknown'
			toast.error(t(`errors.${known}`))
		},
		[t],
	)
}
