import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { getErrorCode } from './errors'

const failed = (status: number, data: unknown) =>
	new AxiosError('failed', 'ERR', undefined, undefined, {
		status,
		data,
		statusText: '',
		headers: {},
		config: { headers: new AxiosHeaders() },
	})

describe('getErrorCode', () => {
	it('prefers the code the backend sent, whatever the status', () => {
		expect(getErrorCode(failed(422, { code: 'import_blocked', detail: 'x' }))).toBe(
			'import_blocked',
		)
		expect(getErrorCode(failed(409, { code: 'offer_exists', detail: 'x' }))).toBe('offer_exists')
	})

	it('reads request validation and transport failures', () => {
		expect(getErrorCode(failed(422, { detail: [{ loc: ['body'] }] }))).toBe('validation')
		expect(getErrorCode(new AxiosError('offline'))).toBe('network')
		expect(getErrorCode(new Error('boom'))).toBe('unknown')
	})
})
