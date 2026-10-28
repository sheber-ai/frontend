import { isAxiosError } from 'axios'

/**
 * Stable error code from the backend ErrorSchema (`{ code, detail }`); `validation` for a 422 without a code
 * (FastAPI request validation), `network` without a response.
 */
export function getErrorCode(error: unknown): string {
	if (!isAxiosError(error)) return 'unknown'
	if (!error.response) return 'network'
	const data: unknown = error.response.data
	if (data && typeof data === 'object' && 'code' in data && typeof data.code === 'string')
		return data.code
	if (error.response.status === 422) return 'validation'
	return 'unknown'
}
